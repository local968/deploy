local after = require("deploy2.lua.after")
local before = require("deploy2.lua.before")
local operate = require("deploy2.lua.operate")
local commonInit = require("deploy2.lua.common")
local conn = require("deploy2.lua.conn")
local space = "deployments"
local fields = {
  "id",
  "userId",
  "projectName",
  "modelName",
  "modelType",
  "deploymentOptions",
  "performanceOptions",
  "updatedDate",
  "createdDate"
}
local common = commonInit(fields)

return function(server, api)
  if not box.space[space] then
    local space = box.schema.space.create(space)
    space:create_index(
      "primary",
      {
        parts = {1, "string", 2, "string"}
      }
    )

    space:create_index(
      "userId",
      {
        parts = {2, "string"},
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
    {type = "newDeploy"},
    function(self)
      -- local userResult = conn.getConnid(self.connid)
      local userResult = {1, "tytytytytyt"}
      if not userResult then
        local result = self.data
        result.message = "need login."
        result.status = 401
        return self:render({data = result})
      end
      local userId = userResult[2]
      self.data.tuple.userId = userId
      self.data.tuple.id = common.createUUID()
      local request = {
        space = space,
        type = "insert",
        data = self.data,
        userId = userId
      }
      return self:render({data = operate(request)})
    end
  )

  server:addMessage(
    {type = "updateDeploy"},
    function(self)
      -- local userResult = conn.getConnid(self.connid)
      local userResult = {1, "tytytytytyt"}
      if not userResult then
        local result = self.data
        result.message = "need login."
        result.status = 401
        return self:render({data = result})
      end
      local userId = userResult[2]
      self.data.tuple.userId = userId
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
    {type = "searchDeploy"},
    function(self)
      -- local userResult = conn.getConnid(self.connid)
      local userResult = {1, "tytytytytyt"}
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
    {type = "watchDeploy"},
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
    {type = "unwatchDeploy"},
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
  api["newDeploy"] = {
    ["tuple"] = {true, "object"},
    ["tuple.projectName"] = {true, "string"},
    ["tuple.modelName"] = {true, "string"},
    ["tuple.modelType"] = {true, "string"},
    ["tuple.deploymentOptions"] = {true, "object"},
    ["tuple.performanceOptions"] = {true, "object"}
  }
  api["updateDeploy"] = {
    ["tuple"] = {true, "object"},
    ["tuple.id"] = {true, "string"},
    ["tuple.projectName"] = {true, "string"},
    ["tuple.modelName"] = {true, "string"},
    ["tuple.modelType"] = {true, "string"},
    ["tuple.deploymentOptions"] = {true, "object"},
    ["tuple.performanceOptions"] = {true, "object"}
  }
  -- todo pager
  api["searchDeploy"] = {
    ["id"] = {false, "string"},
    ["keyword"] = {false, "string"},
    ["sort"] = {false, "string"}
  }
  api["watchDeploy"] = {}
  api["unwatchDeploy"] = {}
end

-- local unregister = before.register()
