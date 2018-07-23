local after = require("deploy2.lua.after")
local before = require("deploy2.lua.before")
local operate = require("deploy2.lua.operate")
local commonInit = require("deploy2.lua.common")
local conn = require("deploy2.lua.conn")
local fiber = require("fiber")
local channel = fiber.channel(1000)
local space = "schedules"
local queue = require("queue")
local fields = {
  "id",
  "userId",
  "deploymentId",
  "type",
  "status",
  "estimatedTime",
  "actualTime",
  "ends",
  "prevSchedule",
  "updatedDate",
  "createdDate",
  "requestId",
  "result",
  "solution",
  "threshold",
  "autoDisable"
}
local common = commonInit(fields)
local Schedule = require("module.Schedule")

local maxProcessing = 2

-- easy version currently
-- todo: delta mode
-- event
-- {
--    watchers,
--    userId
-- }

return function(server, api)
  local function watcherHandler()
    while channel do
      local event = channel:get()
      local watchers = event.watchers
      local userId = event.userId
      if not watchers or not userId then
        return
      end
      local connIds = conn.getConnids(userId)
      -- local connIds = watchers
      for _k, connId in pairs(connIds) do
        for k, watcherConnId in pairs(watchers) do
          if watcherConnId == connId[1] then
            local request = {
              space = space,
              type = "select",
              userId = userId,
              data = {},
              args = {userId},
              index = "userId"
            }
            local result = operate(request)
            server:sendMessageTo(connId[1], "watchSchedule", result)
          end
        end
      end
    end
  end

  fiber.create(watcherHandler)

  local function cronHandler(old, new, arg)
    -- handle
    local _tuple = box.space[space].index["deploymentStatus"]:select({arg.deploymentId, arg.type, "pending"})
    if (#_tuple < 1) then
      return
    end
    local tuple = common.mapArrayToObject(_tuple[1])
    tuple.status = "queue"
    tuple.updatedDate = os.time()
    local request = {
      space = space,
      type = "replace",
      data = {tuple = tuple},
      userId = tuple.userId
    }
    operate(request)

    if (new and new.nexttime) then
      -- generate next schedule
      tuple.status = "pending"
      tuple.estimatedTime = tonumber(new.nexttime)
      tuple.prevSchedule = tuple.id
      tuple.createdDate = os.time()
      tuple.id = common.createUUID()
      local request = {
        space = space,
        type = "replace",
        data = {tuple = tuple},
        userId = tuple.userId
      }
      operate(request)
    end
  end

  local function cancelSchedule(schedule)
    local schedules = box.space[space].index["deploymentId"]:select({schedule.deploymentId, schedule.type})
    for k, s in pairs(common.mapArrayArrayToArrayObject(schedules)) do
      if s.status == "pending" or s.status == "queue" then
        local request = {
          space = space,
          type = "delete",
          userId = s.userId,
          data = {key = {s.id, s.userId}},
          index = "primary"
        }
        operate(request)
        local name = "deployment" .. ":" .. schedule.type .. ":" .. schedule.deploymentId
        Schedule.unregister(name)
      end
    end
  end

  -- Deprecated
  local function checkQueue()
    -- push into queue
    if not box.space[space] then
      return
    end
    local timeUpSchedules = box.space[space].index["estimatedTime"]:select({"pending"})
    for k, _tuple in pairs(timeUpSchedules) do
      local tuple = common.mapArrayToObject(_tuple)
      if (tuple.estimatedTime < os.time()) then
        tuple.status = "queue"
        tuple.updatedDate = os.time()
        local request = {
          space = space,
          type = "replace",
          data = {tuple = tuple},
          userId = tuple.userId
        }
        operate(request)
      end
    end
  end

  local function executeQueue()
    if not box.space[space] or not box.space["deployments"] then
      return
    end
    local processingSchedules = box.space[space].index["estimatedTime"]:select({"processing"})
    if (#processingSchedules >= maxProcessing) then
      return
    end
    local queueSchedules = box.space[space].index["estimatedTime"]:select({"queue"})

    local max = maxProcessing - #processingSchedules
    if (#queueSchedules < max) then
      max = #queueSchedules
    end
    for i = 1, max, 1 do
      local _tuple = queueSchedules[i]
      local tuple = common.mapArrayToObject(_tuple)
      tuple.status = "processing"
      tuple.updatedDate = os.time()

      local deployment = box.space["deployments"].index.primary:select({tuple.deploymentId, tuple.userId})
      if (#deployment == 1) then
        deployment = deployment[1]
      else
        deployment = nil
      end
      if deployment then
        local id = common.createUUID()
        local file
        if tuple.type == "performance" then
          file = deployment[9].file
        else
          file = deployment[8].file
        end
        local result =
          box.space["modeling_request"]:replace(
          {
            id,
            {
              projectId = deployment[3],
              userId = deployment[2],
              csvLocation = file,
              command = "deploy2",
              solution = deployment[5]
            }
          }
        )
        -- todo
        -- sql_user_name, sql_password, sql_host_name, sql_port, sql_database, sql_table, sql_encoding:str='utf8',
        -- database_type:str='MySql',sql_query_str:str=''
        queue.tube.taskQueue:put(id)
        tuple.requestId = id
        tuple.solution = deployment[5]
      else
        tuple.status = "issue"
        tuple.result["process error"] = "deployment not found."
      end

      -- todo: send request

      local request = {
        space = space,
        type = "replace",
        data = {tuple = tuple},
        userId = tuple.userId
      }
      operate(request)
    end
  end

  local function checkResult()
    if not box.space[space] then
      return
    end
    local processingSchedules = box.space[space].index["estimatedTime"]:select({"processing"})
    for k, _tuple in pairs(processingSchedules) do
      local tuple = common.mapArrayToObject(_tuple)
      local result = box.space["modeling_result"]:select({tuple.requestId, tuple.solution})
      local errorResult = box.space["modeling_result"]:select({tuple.requestId, "error"})
      if #errorResult > 0 then
        result = errorResult
      end
      if #result > 0 then
        tuple.result = result[1][3].result
        tuple.status = "finished"
        if #errorResult > 0 then
          tuple.status = "issue"
          if tuple.autoDisable ~= box.NULL or tuple.autoDisable == true then
            cancelSchedule(tuple)
          end
        end
        local request = {
          space = space,
          type = "replace",
          data = {tuple = tuple},
          userId = tuple.userId
        }
        operate(request)
      end
    end
  end

  local function queueHandler()
    while true do
      -- checkQueue()
      executeQueue()
      checkResult()
      fiber.sleep(2)
    end
  end

  fiber.create(queueHandler)

  if not box.space[space] then
    local space = box.schema.space.create(space)
    space:create_index(
      "primary",
      {
        parts = {1, "string", 2, "string"}
      }
    )

    space:create_index(
      "deploymentId",
      {
        parts = {3, "string", 4, "string", 2, "string"},
        unique = false
      }
    )

    space:create_index(
      "deploymentStatus",
      {
        parts = {3, "string", 4, "string", 5, "string"},
        unique = false
      }
    )

    space:create_index(
      "deleteSchedules",
      {
        parts = {3, "string", 2, "string"},
        unique = false
      }
    )

    space:create_index(
      "userId",
      {
        parts = {2, "string"},
        unique = false
      }
    )

    space:create_index(
      "estimatedTime",
      {
        parts = {5, "string", 6, "number"},
        unique = false
      }
    )
  end

  local function registerSchedule(schedules)
    for k, s in pairs(schedules) do
      s = common.mapArrayToObject(s)
      Schedule.setcallback("deployment:" .. s.type .. ":" .. s.deploymentId, cronHandler)
    end
  end

  local pendingSchedules = box.space[space].index["estimatedTime"]:select({"pending"})
  local queueSchedules = box.space[space].index["estimatedTime"]:select({"queue"})
  registerSchedule(pendingSchedules)
  registerSchedule(queueSchedules)

  before.register(
    space,
    {"insert", "replace"},
    function(request)
      local data = request.data.tuple
      request.data.originTuple = data
      request.data.tuple = common.mapObjectToArray(data)
      return request
    end
  )

  after.register(
    space,
    {"insert", "replace", "delete"},
    function(request, response, watchers)
      if watchers then
        channel:put({watchers = watchers, userId = request.userId})
      end
      if request.data.originTuple then
        request.data.tuple = request.data.originTuple
        request.data.originTuple = nil
      end
      response.result = common.mapArrayToObject(response.result)
      return response
    end
  )

  after.register(
    space,
    "select",
    function(request, response, watchers)
      response.result = common.mapArrayArrayToArrayObject(response.result)
      return response
    end
  )

  server:addMessage(
    {type = "searchSchedule"},
    function(self)
      local userResult = conn.getConnid(self.connid)
      -- local userResult = {1, "tytytytytyt"}
      if not userResult then
        local result = self.data
        result.message = "need login."
        result.status = 401
        return self:render({data = result})
      end
      local userId = userResult[2]
      local args = {userId}
      local index = "userId"
      if self.data.id then
        args = {self.data.id, userId}
        index = "primary"
      end
      local request = {
        space = space,
        type = "select",
        data = self.data,
        userId = userId,
        args = args,
        index = index
      }
      return self:render({data = operate(request)})
    end
  )

  server:addMessage(
    {type = "deploySchedule"},
    function(self)
      local userResult = conn.getConnid(self.connid)
      -- local userResult = {1, "tytytytytyt"}
      if not userResult then
        local result = self.data
        result.message = "need login."
        result.status = 401
        return self:render({data = result})
      end
      local userId = userResult[2]

      self.data.tuple = {
        id = common.createUUID(),
        userId = userId,
        deploymentId = self.data.deploymentId,
        estimatedTime = os.time(),
        type = self.data.type,
        ends = "completed",
        status = "pending",
        createdDate = os.time(),
        updatedDate = os.time()
      }

      local options
      local d
      -- fetch schedule options from deployment
      local deployments = box.space["deployments"].index["primary"]:select({self.data.deploymentId, userId})
      if #deployments > 0 then
        d = deployments[1]
        if self.data.type == "performance" then
          options = d[9]
        else
          options = d[8]
        end
      else
        local result = self.data
        result.message = "deployment not found."
        result.status = 404
        return self:render({data = result})
      end

      -- autoDisable
      self.data.tuple.autoDisable = options.autoDisable

      -- get deployment and specific type related schedules
      local schedules = box.space[space].index["deploymentId"]:select({self.data.deploymentId, self.data.type, userId})
      if #schedules > 0 then
        local schedule
        for k, s in pairs(schedules) do
          if s[5] == "pending" or s[5] == "queue" then
            schedule = s
          end
        end
        if schedule then
          self.data.tuple.id = schedule[1]
          self.data.tuple.createdDate = schedule[11]
        end
      end

      -- only for once
      if options.frequency == "once" then
        -- once

        if options.frequencyOptions and options.frequencyOptions.time then
          if options.frequencyOptions.time == "completed" then
            self.data.tuple.estimatedTime = os.time()
          else
            self.data.tuple.estimatedTime = tonumber(options.frequencyOptions.time)
          end
          self.data.tuple.ends = self.data.tuple.estimatedTime
          local cron = "* * * * * *"
          local starts = self.data.tuple.estimatedTime
          local startsSecond = os.date("%S", starts)
          local startsMinute = os.date("%M", starts)
          local startsHour = os.date("%H", starts)
          cron = "* * * * * *"
          local describe = {
            cron = cron,
            starttime = self.data.tuple.estimatedTime,
            times = 1
          }
          local name = "deployment" .. ":" .. self.data.type .. ":" .. d[1]
          local ok, schedule =
            Schedule.register(
            name,
            describe,
            cronHandler,
            {
              deploymentId = d[1],
              type = self.data.type
            }
          )
        else
          local result = self.data
          result.message = "time not set."
          result.status = 400
          return self:render({data = result})
        end
      elseif options.frequency == "repeat" then
        -- repeat

        local repeatPeriod = options.frequencyOptions.repeatPeriod
        local repeatFrequency = options.frequencyOptions.repeatFrequency
        local repeatOn = options.frequencyOptions.repeatOn
        local starts = options.frequencyOptions.starts
        local ends = options.frequencyOptions.ends

        local startsSecond = os.date("%S", starts)
        local startsMinute = os.date("%M", starts)
        local startsHour = os.date("%H", starts)

        local cron = "* * * * * *"
        local frequency = repeatFrequency
        cron = tonumber(startsSecond) .. " " .. tonumber(startsMinute) .. " " .. tonumber(startsHour) .. " "
        if (repeatPeriod == "day") then
          cron = cron .. "* * *"
        elseif (repeatPeriod == "week") then
          cron = cron .. "* * " .. tonumber(repeatOn - 1)
        elseif (repeatPeriod == "month") then
          cron = cron .. tonumber(repeatOn) .. " * *"
        end

        local describe = {
          cron = cron,
          frequency = frequency
        }

        if (ends == "never") then
          -- dont do anything
        elseif (ends < 10000) then
          describe.times = ends
        else
          describe.endtime = ends
        end

        local name = "deployment" .. ":" .. self.data.type .. ":" .. d[1]
        local ok, schedule =
          Schedule.register(
          name,
          describe,
          cronHandler,
          {
            deploymentId = d[1],
            type = self.data.type
          }
        )
        self.data.tuple.estimatedTime = tonumber(schedule.nexttime)
      else
        local result = self.data
        result.message = "not support request."
        result.status = 400
        return self:render({data = result})
      end

      -- add threshold for performance
      if self.data.type == "performance" then
        self.data.tuple.threshold = self.data.threshold
      end

      local request = {
        space = space,
        type = "replace",
        data = self.data,
        userId = userId
      }

      return self:render({data = operate(request)})
    end
  )

  server:addMessage(
    {type = "watchSchedule"},
    function(self)
      local request = {
        space = space,
        type = "watch",
        data = self.data,
        connId = self.connid
      }
      return self:render({data = operate(request)})
    end
  )

  server:addMessage(
    {type = "unwatchSchedule"},
    function(self)
      local request = {
        space = space,
        type = "unwatch",
        data = self.data,
        connId = self.connid
      }
      return self:render({data = operate(request)})
    end
  )

  server:addMessage(
    {type = "suspendDeployment"},
    function(self)
      local schedules = box.space[space].index["deploymentId"]:select({self.data.id})
      for k, s in pairs(common.mapArrayArrayToArrayObject(schedules)) do
        if s.status == "pending" or s.status == "queue" then
          local request = {
            space = space,
            type = "delete",
            userId = s.userId,
            data = {key = {s.id, s.userId}},
            index = "primary"
          }
          operate(request)
          local name = "deployment" .. ":" .. s.type .. ":" .. s.deploymentId
          Schedule.unregister(name)
        end
      end
      return self:render({data = 1})
    end
  )

  server:addMessage(
    {type = "checkDatabase"},
    function(self)
      local userResult = conn.getConnid(self.connid)
      -- local userResult = {1, "tytytytytyt"}
      if not userResult then
        local result = self.data
        result.message = "need login."
        result.status = 401
        return self:render({data = result})
      end
      local userId = userResult[2]
      box.space["modeling_request"]:replace(
        {
          self.data.reqNo,
          {
            projectId = self.data.projectId,
            userId = userId,
            command = "deploy2",
            sqlHostName = self.data.sqlHostName,
            sqlPort = self.data.sqlPort,
            sqlDatabase = self.data.sqlDatabase,
            sqlTable = self.data.sqlTable,
            sqlQueryStr = self.data.sqlQueryStr or "",
            sqlEncoding = self.data.sqlEncoding,
            sqlUserName = self.data.sqlUserName,
            sqlPassword = self.data.sqlPassword
          }
        }
      )

      local f =
        fiber.create(
        function()
          local finished = false
          while not finished do
            local result = box.space["modeling_result"]:select({self.data.reqNo})
            if (#result > 0) then
              finished = true
              local result = self.data
              result.status = 200
              result.message = "ok"
              result.result = result
              self:render({data = result[0]})
              return f.kill()
            end
            fiber.sleep(2)
          end
        end
      )
    end
  )

  -- rule {isRequired, type}
  api["deploySchedule"] = {
    ["type"] = {true, "string"},
    ["deploymentId"] = {true, "string"}
  }
  api["searchSchedule"] = {
    ["id"] = {false, "string"}
  }
  api["watchSchedule"] = "watch"
  api["suspendDeployment"] = {
    ["id"] = {true, "string"}
  }
  api["unwatchSchedule"] = {}

  api["checkDatabase"] = {
    ["projectId"] = {true, "string"},
    ["sqlHostName"] = {true, "string"},
    ["sqlPort"] = {true, "string"},
    ["sqlDatabase"] = {true, "string"},
    ["sqlTable"] = {true, "string"},
    ["sqlQueryStr"] = {false, "string"},
    ["sqlEncoding"] = {true, "string"},
    ["sqlUserName"] = {true, "string"},
    ["sqlPassword"] = {false, "string"},
    ["projectId"] = {true, "string"}
  }
end

-- local unregister = before.register()
