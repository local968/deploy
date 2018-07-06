local after = require("deploy2.lua.after")
local before = require("deploy2.lua.before")
local commonInit = require("deploy2.lua.common")
local space = "test"
local fields = {"id", "test"}
local common = commonInit(fields)

if not box.space[space] then
  box.schema.space.create(space)
  box.space[space]:create_index(
    "primary",
    {
      parts = {1, "unsigned"}
    }
  )

  box.space[space]:create_index(
    "test",
    {
      parts = {2, "unsigned"},
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
