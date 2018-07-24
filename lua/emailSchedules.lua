local Schedule = require('module.Schedule')

local function getUsers(startTime, endTime) 
    local index = box.space['js_free_user'].index['time_index'];
    for k,v in index:pairs(endTime, {iterator = 'LE'}) do 
        if(v[2] <= startTime) then
            break;
        end
        local userId = v[1]
        local title = 'test';
        local desc = 'test';
        dump('send '..userId.." email")
        -- sendEmail
    end
end

local function sendEmail(old_schedule, new_schedule) 
    local user = getUsers(old_schedule.lasttime, os.time())
end

return function () 
    Schedule.register('free_user_warning', {
        cron = '1 * * * * *'
    }, sendEmail, nil)
end