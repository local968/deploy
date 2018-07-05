local fiber = require("fiber")
local channel = fiber.channel(10000)

local tables = {"deployments"}

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
    if box.space[result.space] then
      local ok, returnval =
        pcall(
        function()
          return box.space[result.space]:delete(result.key)
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
    return result
  end,
  unwatch = function(request)
    local result = request.data
    return result
  end
}

return function(server)
  local _fiber =
    fiber.create(
    function()
      while channel do
        local request = channel:get()
        local result = strategies[request.type](request)
        server:sendMessageTo(request.connid, request.type, result)
      end
    end
  )
  return channel
end
