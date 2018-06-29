-- connid -> userid
local conn_cache = {}

local function getConnids(userId)
    local list = {}
    for k, v in pairs(conn_cache) do
        if v[2] == userId then
            list[#list + 1] = v
        end
    end
    return list;
end

local function getConnid(connid)
    return conn_cache[connid]
end

local function delete(connid)
    conn_cache[connid] = nil
end

local function save(userId, connid)
    conn_cache[connid] = {connid, userId}
end

return {
    save= save,
    getConnids= getConnids,
    getConnid= getConnid,
    delete= delete
}