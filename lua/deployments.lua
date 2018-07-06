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
    function(req, res, watchers)
      res.result = common.mapArrayToObject(res.result)
      return res
    end
  )

  after.register(
    space,
    "select",
    function(req, res, watchers)
      res.result = common.mapArrayArrayToArrayObject(res.result)
      return res
    end
  )

  server:addMessage(
    {type = "newDeploy"},
    function(self)
      -- local userResult = conn.getConnid(self.connid)
      local userResult = "tytytytytyt"
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
      local userResult = "tytytytytyt"
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
      local request = {
        space = space,
        type = "select",
        data = self.data
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
    ["tuple.id"] = {true, "number"},
    ["tuple.projectName"] = {true, "string"},
    ["tuple.modelName"] = {true, "string"},
    ["tuple.modelType"] = {true, "string"},
    ["tuple.deploymentOptions"] = {true, "object"},
    ["tuple.performanceOptions"] = {true, "object"}
  }

  -- todo pager
  api["searchDeploy"] = {
    ["id"] = {false, "number"},
    ["keyword"] = {false, "string"},
    ["sort"] = {false, "string"}
  }
end

-- local unregister = before.register()
