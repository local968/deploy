local reqTable, reqIndex, resTable, resIndex, server
local conn = require('deploy2.lua.conn')

local function _upsert(id,params)
    reqTable:upsert({id,params},{{"=",2,params}});
    queue.tube.taskQueue:put(id)
end

local function _query(id)
    local query = {id}

    local result = resIndex:select(query)
    local list = {}
    for k, v in pairs(result) do
        list[k] = {id=v[1],params=v[2]}
    end
    return list;
end

local function change(self)
    -- {id,params}
    local data = self.data

    _upsert(data.id,data.params)
    
    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

local function onModelingResult(old, new)
    if new then
        local data = new[2]
        local userId = data.userId
        local connids = conn.getConnids(userId);
        for k, conn in pairs(connids) do
            local connect = server._r2wsd:get_conn(conn[1]);
            if connect then
                server:sendMessageTo(conn[1], "onModelingResult", data)
            end
        end
    end
end

local function initTrigger() 
    resTable:on_replace(onModelingResult)
end

return function(_server)
    server = _server;
    reqTable = box.space["modeling_request"]
    reqIndex = box.space["modeling_request"].index["primary"]
    resTable = box.space["modeling_result"]
    resIndex = box.space["modeling_result"].index["primary"]

    initTrigger()

    -- insertTestRow()
    _server:addMessage({type='changeRequest'},change)
end