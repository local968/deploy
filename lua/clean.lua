local function delete(userId, projectId)
    local tuple = {userId, projectId};

    -- 删除所有project
    box.space.js_projects:delete({userId, projectId});

    -- -- 删除所有approach
    -- local approaches = box.space.js_approaches:select({userId, projectId});
    -- for k, v in pairs(approaches) do
    --     box.space.js_approaches:delete({v[1], v[2], v[3]});
    -- end

    -- 删除所有model
    box.space.models_info:delete({userId, projectId});

    return
end

return {
    delete = delete
}