local function insert(code, id, session, email)
    local time = os.time()
    local table = box.space['js_email_code']
    table:insert({code, id, session, email, time})
end

local function find(code)
    local index = box.space['js_email_code'].index['primary']
    local result = index:select({code});
    if #result > 0 then
        index:delete({code})
        return {
            id = result[1][2],
            session = result[1][3],
            email = result[1][4]
        }
    end
    return nil
end

return {
    insert = insert,
    find = find
}