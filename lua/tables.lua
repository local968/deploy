queue = require('queue')

local tables = {
    --  id,userId,projectId,{...args}
    {
        table = "js_projects",
        indexs = {
            {
                name = "primary",
                parts = {1,"string",2,"unsigned"}
            }
        }
    },
    --  id,userId,projectId,{...args}
    {
        table = "models_info",
        indexs = {
            {
                name = "primary",
                parts = {1,"string",2,"unsigned"}
            }
        }
    },
    {
        table = "js_usersetting",
        indexs = {
            {
                name = "primary",
                parts = {1,"string"}
            }
        }
    },
    {
        table = "modeling_request",
        indexs = {
            {
                name = "primary",
                parts = {1,"string"}
            }
        }
    },
    {
        table = "modeling_result",
        indexs = {
            {
                name = "primary",
                parts = {1,"string"}
            }
        }
    },
    -- userId, timestamp, type 1 login 2 logout
    {
        table = "js_authlog",
        indexs = {
            {
                name = "primary",
                parts = {1, "string", 2, 'unsigned', 3, 'unsigned'}
            }
        }
    }
}

local function initTables()
    for k1, v1 in pairs(tables) do
        local table, created = box.schema.space.create(v1.table,{if_not_exists = true, engine = "vinyl"});
        if(created == 'created') then
            print("table "..v1.table.." created")
            for k2, v2 in pairs(v1.indexs) do
                -- if(box.sequence["pk_"..v1.table]) then
                --     box.sequence["pk_"..v1.table]:drop()
                --     print("sequence ".."pk_"..v1.table.." droped")
                -- end
                -- box.schema.sequence.create("pk_"..v1.table)
                -- table:create_index('id',{sequence="pk_"..v1.table})
                -- print("primary ".."pk_"..v1.table.." created")
                table:create_index(v2.name, {type=v2.type, parts=v2.parts, unique=v2.unique});
                print("index "..v2.name.." created")
            end
        end
    end
    return true
end

local function cleanTables()
    for k, v in pairs(tables) do
        if(box.space[v.table]) then
            box.space[v.table]:drop()
            print("table "..v.table.." droped")
        end
    end
    return true
end

local function cleanQueue() 
    if queue.tube.taskQueue then
        queue.tube.taskQueue:drop()
    end
end

local function initQueue() 
    queue.create_tube('taskQueue','fifo',{if_not_exists=true})
end

return function()
    -- cleanTables()
    initTables()
    
    -- cleanQueue()
    -- initQueue()

end