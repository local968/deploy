local table, index, server
local userSetting = require('deploy2.lua.usersetting')
local clean = require('deploy2.lua.clean')
local conn = require('deploy2.lua.conn')

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

local function query(self)
    local data = self.data

    local result = _query(data.userId)
    local setting = userSetting.query(data.userId)

    return self:render{
        data = {
            list = result,
            setting = setting,
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

local function delete(self)
    local data = self.data

    for k, v in pairs(data.ids) do
        clean.delete(data.userId, v)
    end

    return self:render{
        data = {
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
        userSetting.upsert(data.userId,data.projectId)
    else
        for k, v in pairs(result) do
            local args = data.args;
            for key, value in pairs(v.args) do
                if args[key] == nil then
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

local function changeProblemType(self)
    local data = self.data;
    clean.backToProblemType(data.userId, data.projectId)

    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

local function train(self)
    return self:render{
        data = {
            status = 200,
            msg = "ok"
        }
    }
end

local function onProjectChange(old, new)
    new = new or {}
    local userId = new[1] or old[1]
    local projectId = new[2] or old[2]
    local data = new[3]
    local connids = conn.getConnids(userId);
    for k, connid in pairs(connids) do
        local connect = server._r2wsd:get_conn(connid[1]);
        if connect then
            server:sendMessageTo(connid[1], "onProjectChange", {
                projectId = projectId,
                data = data
            })
        end
    end
end

local function initTrigger() 
    table:on_replace(onProjectChange)
end

return function(_server)
    table = box.space["js_projects"]
    index = box.space["js_projects"].index["primary"]
    server = _server

    initTrigger()
    -- insertTestRow()
    server:addMessage({type='queryProject'},singleQuery)
    server:addMessage({type='queryProjects'},query)
    server:addMessage({type='deleteProjects'},delete)
    server:addMessage({type='changeProject'},change)
    server:addMessage({type='changeProblemType'},changeProblemType)
    server:addMessage({type='train'},train)
end