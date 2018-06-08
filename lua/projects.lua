local table, index

local function _query(userId,projectId)
    local query = {userId}
    if(projectId) then 
        query[2] = projectId
    end
    
    local result = index:select(query)

    local list = {}
    for k, v in pairs(result) do
        list[k] = {userId=v[1],projectId=v[2],args=v[3]}
    end
    return list;
end

local function _upsert(userId,projectId,args)
    table:upsert({userId,projectId,args},{{"=",3,args}});
end

local function insertTestRow()
    local test_data = {
        {'ty',4,{a=1,b=2,c=3,d=4}},
        {'cc',4,{a=1,b=2,c=3,d=4}},
    }
    for k,v in pairs(test_data) do
        table:insert(v)
    end
    return true
end

local function query(self)
    local data = self.data

    local result = _query(data.userId)

    return self:render{
        data = {
            list = result,
            status = 200,
            msg = "ok"
        }
    }
end

local function singleQuery(self)
    local data = self.data

    local result = _query(data.userId,data.projectId)

    return self:render{
        data = {
            list = result,
            status = 200,
            msg = "ok"
        }
    }
end

local function change(self)
    -- {userId,projectId,args}
    local data = self.data

    local result = _query(data.userId,data.projectId)
    
    if #result == 0 then 
        _upsert(data.userId,data.projectId,data.args)
    else
        for k, v in pairs(result) do
            local args = data.args;
            for key, value in pairs(v.args) do
                if not (args[key]) then
                    args[key] = value
                end
            end
            _upsert(data.userId,data.projectId,args)
        end
    end

    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

return function(server)
    table = box.space["js_projects"]
    index = box.space["js_projects"].index["un_projects"]

    -- insertTestRow()
    server:addMessage({type='queryProject'},singleQuery)
    server:addMessage({type='queryProjects'},query)
    server:addMessage({type='changeProject'},change)
end