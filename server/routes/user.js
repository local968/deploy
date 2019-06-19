const { Router } = require('express')
const uuid = require('uuid')
const { redis, pubsub } = require('redis')
const { register } = require('../webSocket')
const moment = require('moment')
const crypto = require('crypto')
const config = require('config')
const nodemailer = require('nodemailer')
const api = require('../scheduleApi')
const userService = require('../apis/service/userService');
const planService = require('../apis/service/planService');

const checkPassword = password => !!/[a-zA-Z0-9]{6,16}$/.test(password)
const sha256 = password => crypto.createHmac('sha256', config.secret).update(password).digest('hex');
const passwordError = "The password consists of uppercase letters, lowercase letters, and 6-16 digits!"
const sendCodeMail = (code, to) => {
  const transport = nodemailer.createTransport(config.mail)
  const mailConfig = {
    from: 'report@r2.ai',
    to,
    subject: 'Reset your password for R2.ai',
    html: '<div style="padding: 0 5%;font-family: Microsoft YaHei;font-size: 12px;color: #151515">' +
      '  <p style="color: #5B77A9;font-family: Microsoft YaHei;font-size: 24px;text-align:center;font-weight: bold">Reset your password for R2.ai</p >' +
      '  <p>Dear R2.ai user,</p >' +
      '  <p>Please set your new password from url below(expiring in one hour).</p >' +
      '  <p>Your password reset url: ' + config.host + 'resetpassword?code=' + code + '</p >' +
      '  <p>Thank you for your interests in our community and products.</p >' +
      '</div>'
  }
  transport.sendMail(mailConfig)
}

const router = new Router()

router.post('/login', async(req, res) => {
  const { email, password } = req.body;
  
  const had = await userService.exist(email);
  
  if(!had){
    return res.send({ status: 404, message: 'user not exists.' })
  }
  const result = await userService.login(email,sha256(password));
  
  if(!result[0]){
    return res.send({ status: 400, message: 'incorrect password.'})
  }
  const {level,id,create_time} = result[0];
  
  if(!level){
    return res.send({ status:302, message: 'Your account is not available'})
  }
  
  req.session.userId = id;
  req.session.user = {
    id,
    email,
    level,
    createdTime: create_time,
  };
  res.send({
    status: 200,
    message: 'ok',
    info: {
      id,
      email
    }});
  
  
  
  // redis
  //   .get(`userEmail:${email}`)
  //   .then(id => id
  //     ? redis.hmget(`user:${id}`, 'id', 'email', 'password', 'level', 'createdTime')
  //     : Promise.reject({ status: 404, message: 'user not exists.' }))
  //   .then(info => {
  //     if (sha256(password) === info[2]) {
  //       if (info[3] === 0 || !info[3]) return Promise.reject({ status: 302, message: 'Your account is not available' })
  //       req.session.userId = info[0]
  //       req.session.user = { id: info[0], email: info[1], level: info[3], createdTime: info[4] }
  //       res.send({ status: 200, message: 'ok', info: { id: info[0], email: info[1] } })
  //     } else {
  //       return Promise.reject({ status: 400, message: 'incorrect password.' })
  //     }
  //   })
  //   .catch(error => res.send(error))
});

router.delete('/logout', (req, res) => {
  // console.log('Destroying session');
  req.session.destroy();
  res.send({ status: 200, message: 'ok' });
});

router.get('/status', async (req, res) => {
  if (!req.session || !req.session.userId) return res.send({ status: 401, message: 'not login' });
  const {userId} = req.session;
  
  const result = await userService.status(userId);
  
  if(result.id){
    const {id,email,create_time} = result;
    return res.send({
      status: 200,
      message: 'ok',
      info: {
        id,
        email,
        createdTime:create_time,
      }
    });
  }
  
  res.send({ status: 500, message: 'get status failed', error:result.error });
  
  //
  // redis.hmget('user:' + req.session.userId, 'id', 'email', 'createdTime').then(info =>
  //   res.send({
  //     status: 200,
  //     message: 'ok',
  //     info: { id: info[0], email: info[1], createdTime: info[2] }
  //   })
  // ).catch(error => res.send({ status: 500, message: 'get status failed', error }))
});

register('status', (data) => {
  return data
});


router.get('/plans',async (req,res)=>{
   const list = await planService.list();
  const result = list.map(itm=>({
    id:itm.id,
    name:itm.name,
    // level:itm.level,
  }));
  res.send({
    status: 200,
    message: 'ok',
    info: result,
  })
});

router.post('/register', async (req, res) => {
  const { email, level,plan_id } = req.body;
 
  const password = sha256(req.body.password);
  const createdTime = Date.now();
  
  const result = await userService.register(res,email,level,plan_id,password,createdTime);
  
  const {id} = result;
  
  req.session.userId = id;
  
  req.session.user = { id, email, level, createdTime };
  
  res.send({
    status: 200,
    message: 'ok',
    info: { id, email }
  })
  

  // redis
  //   .setnx(`userEmail:${email}`, id)
  //   .then(success => success
  //     ? redis.hmset(`user:${id}`, 'id', id, 'email', email, 'password', password, 'level', level || 1, 'createdTime', createdTime)
  //     : Promise.reject({ status: 400, message: 'email exists.' })
  //   ).then(ok => {
  //     req.session.userId = id
  //     req.session.user = { id, email, level, createdTime }
  //     if (ok) res.send({
  //       status: 200,
  //       message: 'ok',
  //       info: { id, email }
  //     })
  //   }, error => res.send(error))
});

router.put('/changepassword', async (req, res) => {
  const {userId} = req.session;
  const { current, newPassword } = req.body;

  if (!checkPassword(newPassword)) return res.json({ status: 102, message: passwordError, error: passwordError });
  // const currentPassword = await redis.hget(`user:${userId}`, 'password');
  
  const result = await userService.status(userId);
  const {password:currentPassword} = result;
  
  if (sha256(current) !== currentPassword) return res.json({ status: 101, message: 'current password incorrect.', error: 'current password incorrect.' });
  
 await userService.update(userId,{
    password:sha256(newPassword)
   // level:10,
  });
  
  
  // redis.hset(`user:${userId}`, 'password', sha256(newPassword))
  req.session.destroy();
  return res.json({ status: 200, message: 'ok' })
});

router.post('/forgetpassword', async (req, res) => {
  const { email } = req.body;
  // const userId = await redis.get(`userEmail:${email}`);
  const had = await userService.exist(email);
  
  if (!had) return res.json({ status: 400, message: 'email not exists.', error: 'email not exists.' })
  const code = new Array(6).fill(0).map(() => Math.floor(Math.random() * 10).toString()).join('');
  redis.set(`forgetPassword:${code}`, userId, 'EX', 3600);
  sendCodeMail(code, email);
  return res.json({ status: 200, message: 'ok' })
});

router.put('/resetpassword', async (req, res) => {
  const { code, password } = req.body
  const userId = await redis.get(`forgetPassword:${code}`)
  if (!userId) return res.json({ status: 101, message: 'Your reset password request is invalid or expired.' })
  if (!checkPassword(password)) return res.json({ status: 102, message: passwordError, error: passwordError })
  // redis.hset(`user:${userId}`, 'password', sha256(password))
  
  const result = await userService.update(id,{
    password:sha256(password),
  });
  
  if(result.id){
    redis.del(`forgetPassword:${code}`)
    return res.json({ status: 200, message: 'ok' })
  }
  return res.json({ status: 200, message: result.error })
});

router.get('/schedules', (req, res) => {
  api.getAllSchedule(req.session.userId).then(res.json.bind(res))
})

router.get('/deployment', (req, res) => {
  api.getDeployment(req.query.id).then(res.json.bind(res))
})

router.get('/delete', (req, res) => {
  api.deleteDeploymentSchedules(req.query.id).then(res.json.bind(res))
})

router.get('/file', (req, res) => {
  api.getFile(req.query.id).then(res.json.bind(res))
})

router.get('/session', (req, res) => {
  res.json(req.session)
})

router.post('/report', (req, res) => {
  const { type, text, email } = req.body
  const method = (type === 'Question' && 'we will contact you soon via email.') ||
    (type === 'Bug' && 'we will try to resolve it as soon as possible.') ||
    (type === 'Feature' && 'we will take it into consideration.') ||
    '';
  if (!method) {
    return res.status(500).json({ message: "report error" });
  }

  const transport = nodemailer.createTransport(config.mail)
  // 用户回执
  // const userConfig = {
  //   from: 'report@r2.ai',
  //   to: email,
  //   subject: 'R2 Learn - Your feedback received',
  //   html: `Dear Customer,<br><br>
  //     We have received your ${type.toLowerCase()} as below:<br>
  //     "${text}"<br><br>
  //     Thanks for your ${type === 'Question' ? 'question' : 'valuable feedback'}, ${method}<br><br>
  //     R2 Support Team | <a href="http://www.r2.ai" target="_blank">www.r2.ai</a><br>`
  // }
  // transport.sendMail(userConfig)

  // 提交给support
  const supportConfig = {
    from: 'report@r2.ai',
    to: config.supportMail,
    subject: 'User feedback',
    html: `User feedback,<br><br>
      User ${email}: <br>
      ${type.toLowerCase()} as below:<br>
      "${text}"<br>`
  }
  transport.sendMail(supportConfig)
  res.send({
    message: 'ok'
  })
})
module.exports = router
