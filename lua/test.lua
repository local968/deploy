local after = require("deploy2.lua.after")
local before = require("deploy2.lua.before")
local space = "test"
local fields = {"id", "test"}

local function mapObjectToArray(object)
  local arr = {}
  for k, v in pairs(fields) do
    arr[k] = object[v]
  end
  return arr
end

local function mapArrayToObject(array)
  local obj = {}
  for k, v in pairs(array) do
    if (fields[k]) then
      obj[fields[k]] = v
    end
  end
  return obj
end

if not box.space[space] then
  box.schema.space.create(space)

  box.space[space]:create_index(
    "primary",
    {
      parts = {1, "unsigned"}
    }
  )
end

before.register(
  space,
  "insert",
  function(request)
    local data = request.data.tuple
    request.data.originTuple = data
    request.data.tuple = mapObjectToArray(data)
    return request
  end
)

after.register(
  space,
  "insert",
  function(req, res, watchers)
    if res.result and #res.result > 0 then
      res.result = mapArrayToObject(res.result)
    end
    return res
  end
)

after.register(
  space,
  "select",
  function(req, res, watchers)
    if res.result and #res.result > 0 then
      local _result = {}
      for k, row in pairs(res.result) do
        _result[#_result + 1] = mapArrayToObject(row)
      end
      res.result = _result
    end
    return result
  end
)
