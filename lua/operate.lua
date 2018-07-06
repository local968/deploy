local after = require("deploy2.lua.after")
local before = require("deploy2.lua.before")

-- key = space name, value = connid[]
local watcher = {}

-- request
-- {
--   type,
--   space,
--   [index],
--   data,
--   user,
--   [args]   (just for select)
--   ...
-- }

-- response
-- {
--   ...request.data,
--   message,
--   status,
--   result
--   ...
-- }

local strategies = {
  select = function(request)
    local response = request.data
    response.message = "space or index not exist."
    response.status = 404
    if box.space[request.space] and box.space[request.space].index[request.index] then
      local ok, returnval =
        pcall(
        function()
          return box.space[request.space].index[request.index]:select(request.args)
        end
      )
      if ok then
        response.result = returnval
        response.status = 200
        response.message = "ok"
      else
        response.message = returnval
        response.status = 400
      end
    end
    return response
  end,
  insert = function(request)
    local response = request.data
    response.message = "space not exist."
    response.status = 404
    if box.space[request.space] then
      local ok, returnval =
        pcall(
        function()
          return box.space[request.space]:insert(request.data.tuple)
        end
      )
      if ok then
        response.result = returnval
        response.status = 200
        response.message = "ok"
      else
        response.message = returnval
        response.status = 400
      end
    end
    return response
  end,
  replace = function(request)
    local response = request.data
    response.message = "space not exist."
    response.status = 404
    if box.space[request.space] then
      local ok, returnval =
        pcall(
        function()
          return box.space[request.space]:replace(request.data.tuple)
        end
      )
      if ok then
        response.result = returnval
        response.status = 200
        response.message = "ok"
      else
        response.message = returnval
        response.status = 400
      end
    end
    return response
  end,
  delete = function(request)
    local response = request.data
    response.message = "space not exist."
    response.status = 404
    if box.space[request.space] and box.space[request.space].index[request.index] then
      local ok, returnval =
        pcall(
        function()
          return box.space[request.space].index[request.index]:delete(request.data.key)
        end
      )
      if ok then
        response.result = returnval
        response.status = 200
        response.message = "ok"
      else
        response.message = returnval
        response.status = 400
      end
    end
    return response
  end,
  watch = function(request)
    local response = request.data
    if watcher[request.space] then
      watcher[request.space][#watcher[request.space] + 1] = request.connid
    else
      watcher[request.space] = {request.connid}
    end
    response.status = 200
    response.message = "ok"
    return response
  end,
  unwatch = function(request)
    local response = request.data
    if watcher[request.space] then
      for k, v in pairs(watcher[request.space]) do
        if v == request.connid then
          watcher[request.space][k] = nil
        end
      end
    end
    response.status = 200
    response.message = "ok"
    return response
  end
}

return function(request)
  local response
  request = before.trigger(request)
  if request then
    response = strategies[request.type](request)
  else
    response = request.data
  end
  response = after.trigger(request, response, watcher[request.space])
  return response
end
