local config = require('deploy2.lua.config')
local conn = require('deploy2.lua.conn')
local authlog = require('deploy2.lua.authlog')
local auth = require('authman').api(config.authman)
local Expired = 14*24*60*60
local BadDomain = require('deploy2.lua.domain')
local Email = require('module.Email')
local regCode = require('deploy2.lua.regCode')
local userExpired = require('deploy2.lua.userExpired')
local table, index

local function checkLogin(req)
    local connid = req.connid
    local info = conn.getConnid(connid)
    if info == nil then
        return false
    end
    if info[2] == nil then
        return false
    end
    if req.data == box.NULL then
        req.data = {}
    end
    req.data.userId = info[2]
    return true
end

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
        local info = userExpired.find(email)

        if user.profile == box.NULL then
            user.profile = {}
        end

        return {
            user = {
                id = user.session,
                profile = user.profile.first_name,
                email = user.email,
                expired = info.expired,
                type = info.type
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
        local info = userExpired.find(user.email)
        
        if user.profile == box.NULL then
            user.profile = {}
        end

        return {
            user = {
                id = user.session,
                profile = user.profile.first_name,
                email = user.email,
                expired = info.expired,
                type = info.type
            } 
        }
    else
        return {
            err = formatError(user)
        }
    end
end

local function _setExpired(email, type)
    local expired
    if type ~= 'free' then
        expired = 0
    else
        expired = os.time() + Expired
    end

    userExpired.upsert(email, expired, type)

    return {
        expired = expired,
        type= type
    }
end

local function sendRegCode(email, code, id, session)
    local opt = config.email or {}
    opt.subject = '激活邮件'
    regCode.insert(code, id, session, email)
    Email.request('congcong.dai@r2.ai', 'test <br/><a target="_blank" href="localhost:3000/active?'..code..'">点击激活</a>或复制下方链接<br/>localhost:3000/active?'..code..'', opt)
end

local function _register(email, password)
    box.begin()
    local s = box.savepoint()
    local ok, reg = auth.registration(email)
    if ok then
        local code = reg.code
        local ok2, user = auth.complete_registration(email, code, password)
        if ok then
            box.commit()
            local id = user.id
            local result = _loginByEmail(email, password)

            if result.err then
                return {
                    err = result.err
                }
            else
                -- 修改为未激活
                index:update(id, {{'=', 4, false}})

                sendRegCode(email, code, id, result.user.id)

                return {
                    id = id
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
        return self:render{
            data = {
                status = 200,
                msg = 'ok',
            }
        }
    end
end

local function completeReg(self) 
    local code = self.data.code

    local info = regCode.find(code)

    if not info then
        return self:render{
            data = {
                status = 204,
                msg = 'ok',
                err = 'code not find'
            }
        }
    end

    local id = info.id
    local email = info.email
    local session = info.session
    -- 修改为激活
    index:update(id, {{'=', 4, true}})

    _setExpired(email, 'free')

    return self:render{
        data = {
            status = 200,
            msg = 'ok',
            user = {
                id = session,
                email = email
            }
        }
    }
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
        if user.profile == box.NULL then
            user.profile = {}
        end
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

local function logout(self)
    logout_handler(nil, self)
end

local function accessable(self, req)
    if req.type == 'register' or req.type == 'login' or req.type == 'api' or req.type == 'completeReg' then
        return true 
    else
        return checkLogin(req)
    end
 end

return function(server)
    table = box.space['auth_user']
    index = box.space['auth_user'].index['primary']
    server:setEventHandler(server.EVENT_HANDLER_TYPE.ONCLOSE, "logout_log", logout_handler)
    server:setEventHandler(server.EVENT_HANDLER_TYPE.ONMESSAGE_ACCESSABLE, "accessable", accessable)
    server:addMessage({type='login'},login)
    server:addMessage({type='register'},register)
    server:addMessage({type='setProfile'},setProfile)
    server:addMessage({type='logout'},logout)
    server:addMessage({type='completeReg'}, completeReg)
end