local exportapi = require("exportapi")
local tables = require("deploy2.lua.tables")
local projects = require("deploy2.lua.projects")
-- local approaches = require('deploy2.lua.approaches')
local request = require("deploy2.lua.request")
local model = require("deploy2.lua.model")
local auth = require("deploy2.lua.auth")
local testInit = require("deploy2.lua.test")
local deploymentsInit = require("deploy2.lua.deployments")
local schedulesInit = require("deploy2.lua.schedules")
local api = {}

-- 更新单个字段
local function updateField(userId, projectId, updateTable)
    local ts = box.space.models_info.index.primary:select {userId, projectId}
    if ts[1] ~= nil then
        local t = ts[1][3]
        for k, v in pairs(updateTable) do
            t[k] = v
        end
        box.space.models_info:update({userId, projectId}, {{"=", 3, t}})
        return t
    else
        box.space.models_info:insert({userId, projectId, updateTable})
        return updateTable
    end
end

local function addToSet(table, query, index, data)
    local result = box.space[table].index.primary:select(query)
    if result[1] ~= nil then
        local tuple = result[1]
        if #tuple + 1 < index - 1 then
            for i = #tuple + 1, index - 1, 1 do
                tuple[i] = nil
            end
        end
        local list = tuple[index]
        if list == nil then
            list = {}
        end
        list[#list + 1] = data
        box.space[table]:update(query, {{"=", index, list}})
    else
        local tuple = query
        if #tuple + 1 < index - 1 then
            for i = #tuple + 1, index - 1, 1 do
                tuple[i] = nil
            end
        end
        tuple[index] = {data}
        box.space[table]:insert(tuple)
    end
end

exportapi.export("deploy2", nil, {updateField = updateField})
exportapi.export("deploy2", nil, {addToSet = addToSet})

-- return function(server)
local server = app.webServer
tables()
auth(server)
projects(server)
-- approaches(server)
request(server)
model(server)

testInit(server, api)
deploymentsInit(server, api)
schedulesInit(server, api)
server:addMessage(
    {type = "api"},
    function(self)
        return self:render({data = api})
    end
)
-- end
