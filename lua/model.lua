local table, index

local function _upsert(userId, projectId, args)
    table:upsert({userId, projectId, args},{{"=",3,args}});
end

local function _query(userId, projectId)
    local query = {userId, projectId}

    local result = index:select(query)
    
    if #result == 1 then
        return {userId=result[1][1],projectId=result[1][2],args=result[1][3]}
    else
        return {};
    end
end

local function query(self)
    local data = self.data

    local result = _query(data.userId, data.projectId)

    return self:render{
        data = {
            status = 200,
            msg = 'ok',
            data = result
        }
    }
end

local function change(self)
    -- {userId,projectId,args}
    local data = self.data

    local result = _query(data.userId, data.projectId)
    
    if #result == 0 then 
        _upsert(data.userId, data.projectId, data.args)
    else
        for k, v in pairs(result) do
            local args = data.args;
            for key, value in pairs(v.args) do
                if args[key] ~= nil then
                    args[key] = value
                end
            end
            _upsert(data.userId, data.projectId, args)
        end
    end

    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

return function(_server)
    table = box.space["models_info"]
    index = box.space["models_info"].index["primary"]

    -- insertTestRow()
    _server:addMessage({type='queryModels'},query)
    _server:addMessage({type='changeModel'},change)
end