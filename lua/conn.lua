local function getConnids(userId)
    local index = box.space["js_connids"].index["index_conn"]
    local result = index:select({userId})

    local list = {}
    for k, v in pairs(result) do
        list[k] = v[1]
    end
    return list;
end

local function getConnid(connid)
    local index = box.space["js_connids"].index["primary"]
    local tuple = {connid}
    local result = index:select(tuple)
    return result[1]
end

local function delete(connid)
    local index = box.space["js_connids"].index["primary"]
    local tuple = {connid}
    index:delete(tuple)
end

local function save(userId, connid)
    local result = getConnid(connid)

    if not result then
        local table = box.space["js_connids"]
        local tuple = {connid, userId}
        table:insert(tuple)
    end
end

return {
    save= save,
    getConnids= getConnids,
    getConnid= getConnid,
    delete= delete
}