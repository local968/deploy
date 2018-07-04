local conn = require('deploy2.lua.conn')
local authlog = require('deploy2.lua.authlog')
local auth = require('authman').api({})
local Expired = 14*24*60*60
local BadDomain = require('deploy2.lua.domain')
local _init, _server

local function bindConnid(userId, connid)
    local result = conn.getConnid(connid);
    if not result then
        conn.save(userId, connid)
    end
end

local function formatError(error)
    for k, v in pairs(error) do
        return v
    end
end

local function checkInfo(email, password)
    if not email then 
        return {
            status = false,
            err = "email required"
        }
    else
        local name, domain = email:match("^([%w%_%.%-]+)@([%.%w%-]*)$")
        if not name or not domain then
            return {
                status = false,
                err = "email invaild"
            }
        end
        for k, v in pairs(BadDomain) do
            local isBad = domain:find(v)
            if isBad then
                return {
                    status = false,
                    err = "Please use your business email address to register"
                }
            end
        end
    end

    if not password then 
        return {
            status = false,
            err = "password required"
        }
    end

    return {
        status = true
    }
end

local function _loginByEmail(email, password)
    local check = checkInfo(email, password);

    if not check.status then
        return {
            err = check.err
        }
    end

    local ok, user = auth.auth(email, password)

    if ok then
        if user.profile and user.profile ~= box.NULL then
            local time = os.time()
            local lastName = user.profile.last_name
            if lastName.type == 'free' and time > lastName.expired then
                return {
                    err = 'Your account is expired. Please upgrade to paid account.'
                }
            else
                user.expired = lastName.expired
                user.type = lastName.type
            end
        else
            -- 不存在设置为空table
            user.profile = {}
        end

        return {
            user = {
                id = user.session,
                profile = user.profile.first_name,
                email = user.email,
                expired = user.expired,
                type = user.type
            } 
        }
    else
        return {
            err = formatError(user)
        }
    end
end

local function _loginBySession(sessionId)
    local ok, user = auth.check_auth(sessionId)

    if ok then
        if user.profile and user.profile ~= box.NULL then
            local time = os.time()
            local lastName = user.profile.last_name
            if lastName.type == 'free' and time > lastName.expired then
                return {
                    err = 'Your account is expired. Please upgrade to paid account.'
                }
            else
                user.expired = lastName.expired
                user.type = lastName.type
            end
        else
            -- 不存在设置为空table
            user.profile = {}
        end
        
        return {
            user = {
                id = user.session,
                profile = user.profile.first_name,
                email = user.email,
                expired = user.expired,
                type = user.type
            } 
        }
    else
        return {
            err = formatError(user)
        }
    end
end

local function _setExpired(id, type)
    local data = {
        type = type
    }

    if type ~= 'free' then
        data.expired = 0
    else
        data.expired = os.time() + Expired
    end

    local ok3, result = auth.set_profile(id, {last_name={data}})

    if ok3 then
        return {
            user = result
        }
    else
        return {
            err = formatError(result)
        }
    end
end

local function _register(email, password)
    box.begin()
    local s = box.savepoint()
    local ok, reg = auth.registration(email)
    if ok then
        local ok2, user = auth.complete_registration(email, reg.code, password)
        if ok then
            local result = _setExpired(user.id, "free")

            if result.err then
                box.rollback_to_savepoint(s)
                box.commit()
                return {
                    err = result.err
                }
            else
                box.commit()
                return {
                    user = result.user
                }
            end
        else
            box.rollback_to_savepoint(s)
            box.commit()
            return {
                err = formatError(user)
            }
        end
    else
        box.rollback_to_savepoint(s)
        box.commit()
        return {
            err = formatError(reg)
        }
    end
end

local function login(self)
    local data = self.data

    local result
    if data.token then
        result = _loginBySession(data.token)
    else
        result = _loginByEmail(data.email, data.password)
    end
    if result.err then
        return self:render{
            data = {
                status = 201,
                msg = 'login err',
                err = result.err   
            }
        }
    else
        local connects = conn.getConnids(result.user.email)

        -- 如果该用户没有任何链接   
        -- 认为用户登陆
        if #connects == 0 then
            authlog.login(result.user.email)
        end

        -- 登陆后  userId 绑定 connid
        bindConnid(result.user.email, self.connid)

        return self:render{
            data = {
                status = 200,
                msg = 'ok',
                user = result.user 
            }
        }
    end
end

local function register(self)
    local email = self.data.email
    local password = self.data.password

    local check = checkInfo(email, password);

    if not check.status then
        return self:render{
            data = {
                status = 202,
                msg = 'register err',
                err = check.err
            }
        }
    end

    local reg = _register(email, password)

    if reg.err then
        return self:render{
            data = {
                status = 202,
                msg = 'register err',
                err = reg.err
            }
        }
    else
        local result = _loginByEmail(email, password)

        local connects = conn.getConnids(result.user.email)

        -- 如果该用户没有任何链接   
        -- 认为用户登陆
        if #connects == 0 then
            authlog.login(result.user.email)
        end

        -- 登陆后  userId 绑定 connid
        bindConnid(result.user.email, self.connid)

        if result.err then
            return self:render{
                data = {
                    status = 202,
                    msg = 'register err',
                    err = result.user
                }
            }
        else 
            return self:render{
                data = {
                    status = 200,
                    msg = 'ok',
                    user = result.user
                }
            }
        end
    end
end

local function setProfile(self)
    local token = self.data.token
    local profile = self.data.profile

    if not token then
        return self:render{
            data = {
                status = 203,
                msg = 'set profile err',
                err = "token error"
            }
        }
    end

    local ok, user = auth.check_auth(token)

    if ok then
        local _profile = user.profile.first_name
        for k, v in pairs(profile) do
            _profile[k] = v
        end
        local ok2, result = auth.set_profile(user.id, {first_name=_profile, last_name=user.profile.last_name})

        if ok2 then
            return self:render{
                data = {
                    status = 200,
                    msg = 'ok',
                    user = {
                        id = token,
                        profile = result._profile.first_name,
                        email = user.email
                    }   
                }
            }
        else
            return self:render{
                data = {
                    status = 202,
                    msg = 'set profile err',
                    err = formatError(result)
                }
            }
        end
    else
        return self:render{
            data = {
                status = 203,
                msg = 'token expired',
                err = formatError(user)
            }
        }
    end
end

local function logout(self)
    logout_handler(nil, self)
end

local function logout_handler(self, req)
    local result = conn.getConnid(req.connid)

    if result then
        local userId = result[2]
        -- 删除当前用户链接数据
        conn.delete(req.connid)

        -- 如果当前用户没有任何链接  认为用户下线
        local connects = conn.getConnids(userId)

        if #connects == 0 then
            authlog.logout(userId)
        end
    end
end

return function(server)
    server:setEventHandler(server.EVENT_HANDLER_TYPE.ONCLOSE, "logout_log", logout_handler)
    server:addMessage({type='login'},login)
    server:addMessage({type='register'},register)
    server:addMessage({type='setProfile'},setProfile)
    server:addMessage({type='logout'},logout)
end