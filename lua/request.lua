queue = require('queue')
local table, index, server
local temp = {}

local function _upsert(id,params)
    table:upsert({id,params},{{"=",2,params}});
    queue.tube.taskQueue:put(id)
end

local function _query(id)
    local query = {id}

    local result = index:select(query)
    local list = {}
    for k, v in pairs(result) do
        list[k] = {id=v[1],params=v[2]}
    end
    return list;
end

local function change(self)
    -- {id,params}
    local data = self.data

    -- userId 绑定 connid
    temp[data.params.userId] = self.connid

    local result = _query(data.id)

    if #result == 0 then 
        _upsert(data.id,data.params)
    else
        for k, v in pairs(result) do
            local params = data.params;
            for key, value in pairs(v.params) do
                if not (params[key]) then
                    params[key] = value
                end
            end
            _upsert(data.id,params)
        end
    end
 
    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

local function onModelingResult(old, new)
    if new then
        dump(new)
        local userId = new[2].userId
        local connid = temp[userId]

        print(connid)
        print("onModelingResult")
        print(new[1])

        server:sendMessageTo(connid, "onModelingResult", new[1])
        -- app.webServer._r2wsd:writebyid(connid)
    end
end

local function initTrigger() 
    box.space["modeling_result"]:on_replace(onModelingResult)
end

local function initQueue() 
    queue.create_tube('taskQueue','fifo',{if_not_exists=true})
end

local function cleanQueue() 
    if queue.tube.taskQueue then
        queue.tube.taskQueue:drop()
    end
end

return function(_server)
    server = _server;
    table = box.space["modeling_request"]
    index = box.space["modeling_request"].index["pk_request"]

    -- cleanQueue()
    initQueue()
    initTrigger()

    -- insertTestRow()
    _server:addMessage({type='changeRequest'},change)
end