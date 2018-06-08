local table,index

local function _upsert(userId,projectId,approachId,args)
    table:upsert({userId,projectId,approachId,args},{{"=",4,args}});
end

local function _query(userId,projectId,approachId)
    local query = {userId,projectId}
    if(approachId) then 
        query[3] = approachId
    end
    local result = index:select(query)
    local list = {}
    for k, v in pairs(result) do
        list[k] = {userId=v[1],projectId=v[2],approachId=v[3],args=v[4]}
    end
    return list;
end

local function query(self)
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

local function singleQuery(self)
    local data = self.data

    local result = _query(data.userId,data.projectId,data.approachId)

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

    local result = _query(data.userId,data.projectId,data.approachId)

    if #result == 0 then 
        _upsert(data.userId,data.projectId,data.approachId,data.args)
    else
        for k, v in pairs(result) do
            local args = data.args;
            for key, value in pairs(v.args) do
                if not (args[key]) then
                    args[key] = value
                end
            end
            _upsert(data.userId,data.projectId,data.approachId,args)
        end
    end

    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

local function insertTestRow()
    local test_data = {
        {'ty',2,0,{a=1,b=2,c=3,d=4}},
        {'cc',2,0,{a=1,b=2,c=3,d=4}},
        {'ty',3,0,{a=1,b=2,c=3,d=4}},
        {'cc',3,0,{a=1,b=2,c=3,d=4}},
        {'ty',4,0,{a=1,b=2,c=3,d=4}},
        {'cc',4,0,{a=1,b=2,c=3,d=4}},
    }
    for k,v in pairs(test_data) do
        table:insert(v)
    end
    return true
end


return function(server)
    table = box.space["js_approaches"];
    index = box.space["js_approaches"].index["un_approaches"];
    -- insertTestRow()
    server:addMessage({type='queryApproach'},singleQuery)
    server:addMessage({type='queryApproaches'},query)
    server:addMessage({type='changeApproach'},change)
end