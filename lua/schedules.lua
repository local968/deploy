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
  "solution"
}
local common = commonInit(fields)

local maxProgressing = 2

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

  local function checkQueue()
    -- push into queue
    if not box.space[space] then
      return
    end
    local timeUpSchedules = box.space[space].index["estimatedTime"]:select({"waiting"})
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
    local progressingSchedules = box.space[space].index["estimatedTime"]:select({"progressing"})
    if (#progressingSchedules >= maxProgressing) then
      return
    end
    local queueSchedules = box.space[space].index["estimatedTime"]:select({"queue"})

    local max = maxProgressing - #progressingSchedules
    if (#queueSchedules < max) then
      max = #queueSchedules
    end
    for i = 1, max, 1 do
      local _tuple = queueSchedules[i]
      local tuple = common.mapArrayToObject(_tuple)
      tuple.status = "progressing"
      tuple.updatedDate = os.time()

      local deployment = box.space["deployments"].index.primary:select({tuple.deploymentId, tuple.userId})
      if (#deployment == 1) then
        deployment = deployment[1]
      else
        deployment = nil
      end
      if deployment then
        local id = common.createUUID()
        local result =
          box.space["modeling_request"]:replace(
          {
            id,
            {
              projectId = deployment[3],
              userId = deployment[2],
              csvLocation = deployment[8].file,
              command = "deploy2",
              solution = deployment[5]
            }
          }
        )
        queue.tube.taskQueue:put(id)
        tuple.requestId = id
        tuple.solution = deployment[5]
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
    local progressingSchedules = box.space[space].index["estimatedTime"]:select({"progressing"})
    for k, _tuple in pairs(progressingSchedules) do
      local tuple = common.mapArrayToObject(_tuple)
      local result = box.space["modeling_result"]:select({tuple.requestId, tuple.solution})
      if #result > 0 then
        tuple.result = result[1][3].result
        tuple.status = "finished"
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
      checkQueue()
      executeQueue()
      checkResult()
      fiber.sleep(10)
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
        status = "waiting",
        createdDate = os.time(),
        updatedDate = os.time()
      }

      local options
      -- fetch schedule options from deployment
      local deployments = box.space["deployments"].index["primary"]:select({self.data.deploymentId, userId})
      if #deployments > 0 then
        local d = deployments[1]
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

      -- get deployment and specific type related schedules
      local schedules = box.space[space].index["deploymentId"]:select({self.data.deploymentId, self.data.type, userId})
      if #schedules > 0 then
        local s = schedules[1]
        if s[5] == "waiting" or s[5] == "queue" then
          self.data.tuple.id = s[1]
          self.data.tuple.createdDate = s[11]
        end
      end

      -- only for once
      if options.frequency == "once" and options.frequencyOptions and options.frequencyOptions.time then
        if options.frequencyOptions.time == "completed" then
          self.data.tuple.estimatedTime = os.time()
        else
          self.data.tuple.estimatedTime = options.frequencyOptions.time
        end
        self.data.tuple.ends = self.data.tuple.estimatedTime
      else
        local result = self.data
        result.message = "not support yet."
        result.status = 500
        return self:render({data = result})
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

  -- rule {isRequired, type}
  api["deploySchedule"] = {
    ["type"] = {true, "string"},
    ["deploymentId"] = {true, "string"}
  }
  api["searchSchedule"] = {
    ["id"] = {false, "string"}
  }
  api["watchSchedule"] = "watch"
  api["unwatchSchedule"] = {}
end

-- local unregister = before.register()
