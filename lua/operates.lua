local fiber = require("fiber")
local after = require("deploy2.lua.after")
local before = require("deploy2.lua.before")
local channel = fiber.channel(10000)

-- key = space name, value = connid[]
local watcher = {}

-- request
-- {
--   connid,
--   type,
--   data,
--   user,
--   ...
-- }

local strategies = {
  select = function(request)
    local result = request.data
    result.message = "space or index not exist."
    result.status = 404
    if box.space[result.space] and box.space[result.space].index[result.index] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space].index[result.index]:select(result.args)
        end
      )
      if ok then
        result.result = returnval
        result.status = 200
        result.message = "ok"
      else
        result.message = returnval
        result.status = 400
      end
    end
    return result
  end,
  insert = function(request)
    local result = request.data
    result.message = "space not exist."
    result.status = 404
    if box.space[result.space] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space]:insert(result.tuple)
        end
      )
      if ok then
        result.result = returnval
        result.status = 200
        result.message = "ok"
      else
        result.message = returnval
        result.status = 400
      end
    end
    return result
  end,
  update = function(request)
    local result = request.data
    result.message = "space or index not exist."
    result.status = 404
    if box.space[result.space] and box.space[result.space].index[result.index] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space].index[result.index]:update(result.key, result.modifier)
        end
      )
      if ok then
        result.result = returnval
        result.status = 200
        result.message = "ok"
      else
        result.message = returnval
        result.status = 400
      end
    end
    return result
  end,
  upsert = function(request)
    local result = request.data
    result.message = "space or index not exist."
    result.status = 404
    if box.space[result.space] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space]:upsert(result.tuple, result.modifier)
        end
      )
      if ok then
        result.result = returnval
        result.status = 200
        result.message = "ok"
      else
        result.message = returnval
        result.status = 400
      end
    end
    return result
  end,
  replace = function(request)
    local result = request.data
    result.message = "space not exist."
    result.status = 404
    if box.space[result.space] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space]:replace(result.tuple)
        end
      )
      if ok then
        result.result = returnval
        result.status = 200
        result.message = "ok"
      else
        result.message = returnval
        result.status = 400
      end
    end
    return result
  end,
  delete = function(request)
    local result = request.data
    result.message = "space not exist."
    result.status = 404
    if box.space[result.space] and box.space[result.space].index[result.index] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space].index[result.index]:delete(result.key)
        end
      )
      if ok then
        result.result = returnval
        result.status = 200
        result.message = "ok"
      else
        result.message = returnval
        result.status = 400
      end
    end
    return result
  end,
  watch = function(request)
    local result = request.data
    if watcher[result.space] then
      watcher[result.space][#watcher[result.space] + 1] = request.connid
    else
      watcher[result.space] = {request.connid}
    end
    result.status = 200
    result.message = "ok"
    return result
  end,
  unwatch = function(request)
    local result = request.data
    if watcher[result.space] then
      for k, v in pairs(watcher[result.space]) do
        if v == request.connid then
          table.remove(watcher[result.space], k)
        end
      end
    end
    result.status = 200
    result.message = "ok"
    return result
  end
}

return function(server)
  local _fiber =
    fiber.create(
    function()
      while channel do
        local request = channel:get()
        local result
        request = before.trigger(request)
        if request then
          result = strategies[request.type](request)
        else
          result = request
        end
        result = after.trigger(request, result, watcher[request.space])
        server:sendMessageTo(request.connid, request.type, result)
      end
    end
  )
  return channel
end
