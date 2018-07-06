return function(fields)
  local function mapObjectToArray(obj)
    if not obj then
      return {}
    end
    local arr = {}
    for k, v in pairs(fields) do
      arr[k] = obj[v]
    end
    return arr
  end

  local function mapArrayToObject(array)
    if not array then
      return {}
    end
    local obj = {}
    for k, v in pairs(array) do
      if (fields[k]) then
        obj[fields[k]] = v
      end
    end
    return obj
  end

  local function mapArrayArrayToArrayObject(arrayArray)
    if not arrayArray then
      return {}
    end
    local result = {}
    for k, row in pairs(arrayArray) do
      result[#result + 1] = mapArrayToObject(row)
    end
    return result
  end

  local function mapArrayObjectToArrayArray(arrayObject)
    if not arrayObject then
      return {}
    end
    local result = {}
    for k, row in pairs(arrayObject) do
      result[#result + 1] = mapObjectToArray(row)
    end
    return result
  end

  return {
    mapObjectToArray = mapObjectToArray,
    mapArrayToObject = mapArrayToObject,
    mapArrayArrayToArrayObject = mapArrayArrayToArrayObject,
    mapArrayObjectToArrayArray = mapArrayObjectToArrayArray
  }
end
