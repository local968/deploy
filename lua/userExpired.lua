local function upsert(email, expired, type)
    local table = box.space['js_auth_free']
    table:upsert({email, expired, type}, {{"=", 2, expired},{'=', 3, type}})
end

local function find(email)
    local index = box.space['js_auth_free'].index['primary']
    local result = index:select({email})

    if #result > 0 then
        return {
            expired = result[1][2],
            type = result[1][3]
        }
    end
    return {}
end

return {
    upsert = upsert,
    find = find
}