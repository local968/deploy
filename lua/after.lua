local listener = {}

return {
  trigger = function(request, result, watchers)
    local name = request.space .. ":" .. request.type
    if listener[name] then
      for k, fn in pairs(listener[name]) do
        local ok, returnval = pcall(fn, request, result)
        if not ok then
          dump(returnval)
        else
          result = returnval
        end
      end
    end
    return result
  end,
  register = function(space, types, fn)
    local unregisters = {}
    if type(types) == "string" then
      types = {types}
    end
    for k, t in pairs(types) do
      local index = 1
      local name = space .. ":" .. t
      if listener[name] then
        listener[name][#listener[name] + 1] = fn
        index = #listener[name] + 1
      else
        listener[name] = {fn}
      end
      unregisters[#unregisters + 1] = function()
        table.remove(listener[name], index)
      end
    end
    return function()
      for k, fn in pairs(unregisters) do
        fn()
      end
    end
  end
}
