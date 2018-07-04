local function query(id)
    local index = box.space["model_user_setting"].index["primary"]
    local result = index:select({id})

    if #result == 1 then
        return {userId = result[1][1], projectId = result[1][2]}
    else
        return nil
    end
end

local function upsert(userId, projectId)
    local table = box.space["model_user_setting"]
    local newProjectId = projectId + 1;
    local tuple = {userId, newProjectId}
    table:upsert(tuple,{{'=',2,newProjectId}})
    return
end

return {
    query = query,
    upsert = upsert
}