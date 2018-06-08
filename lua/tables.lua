local queue = require('queue')

local tables = {
    --  userId,projectId,{...args}
    {
        table = "js_projects",
        indexs = {
            {
                name = "un_projects",
                parts = {1,"string",2,"unsigned"}
            }
        }
    },
    --  userId,projectId,approachId,{...args}
    {
        table = "js_approaches",
        indexs = {
            {
                name = "un_approaches",
                parts = {1,"string",2,"unsigned",3,"unsigned"}
            }
        }
    },
    {
        table = "modeling_request",
        indexs = {
            {
                name = "pk_request",
                parts = {1,"string"}
            }
        }
    },
    {
        table = "modeling_result",
        indexs = {
            {
                name = "pk_result",
                parts = {1,"string"}
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
                table:create_index(v2.name, {type=v2.type, parts=v2.parts});
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

return function()
    cleanTables()
    initTables()
    
end