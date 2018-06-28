local function login(userId)
    local table = box.space['js_authlog']
    local time = os.time()

    table:insert({userId, time, 1})
end

local function logout(userId)
    local table = box.space['js_authlog']
    local time = os.time()

    table:insert({userId, time, 2})
end

local function total(userId)
    local time=0
    local start=0
    for k,v in box.space['js_authlog'].index["primary"]:pairs({userId}) do
        if v[3]==1 then 
            if start == 0 then
                start = v[2] 
            end
        else
            if start ~= 0 then
                time = time + v[2] - start 
            end
        end
    end
    return time
end

return {
    login = login,
    logout = logout
}