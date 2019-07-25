import express from 'express';
import { redis } from '../redis';
import moment from 'moment';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import config from '../../config';
import api from '../scheduleApi';
import wss from '../webSocket';
import uuid from 'uuid';
const {userService,planService,groupService} = require('../apis/service');

const { register } = wss;

const checkPassword = password => !!/[a-zA-Z0-9]{6,16}$/.test(password);
const sha256 = password =>
  crypto
    .createHmac('sha256', config.secret)
    .update(password)
    .digest('hex');
const passwordError =
  'The password consists of uppercase letters, lowercase letters, and 6-16 digits!';
const sendCodeMail = (code, to) => {
  const transport = nodemailer.createTransport(config.mail);
  const mailConfig = {
    from: 'report@r2.ai',
    to,
    subject: 'Reset your password for R2.ai',
    html:
      '<div style="padding: 0 5%;font-family: Microsoft YaHei;font-size: 12px;color: #151515">' +
      '  <p style="color: #5B77A9;font-family: Microsoft YaHei;font-size: 24px;text-align:center;font-weight: bold">Reset your password for R2.ai</p >' +
      '  <p>Dear R2.ai user,</p >' +
      '  <p>Please set your new password from url below(expiring in one hour).</p >' +
      '  <p>Your password reset url: ' +
      config.host +
      'resetpassword?code=' +
      code +
      '</p >' +
      '  <p>Thank you for your interests in our community and products.</p >' +
      '</div>',
  };
  transport.sendMail(mailConfig);
};

const router = express.Router();

/**
 * 数尊 获取token
 */
router.post('/login/token', async(req, res) => {
  const { email,password } = req.body;

  if(!email||!password){
    return res.send({ status: 500, message: 'please send email and password.' })
  }

  let user = await userService.findByEmail(email);

  if(!user){
    return res.send({ status: 404, message: 'user not exists.' })
  }

  if(user.update_password){
    const result = await userService.firstLogin(email,password,sha256(password));

    if(result&&!user.plan){
      const plan = await planService.detail('');
      await userService.update(user.id,{
        plan:plan._id,
      });
      user = await userService.findByEmail(email);
    }else if(!result){
      user = null;
    }
  }else{
    const _result = await userService.login(email,sha256(password));
    user = _result[0];
  }

  if(!user){
    return res.send({ status: 400, message: 'incorrect password.'})
  }
  const {plan,id} = user;

  if(!(plan&&plan.level)){
    return res.send({ status:302, message: 'Your account is not available'})
  }

  const token = uuid.v4();

  const token_overdue_time = moment().add(1,'year').format('llll');


  await userService.update(id,{
    token,
    token_overdue_time,
  });

  return res.send({
    token,
    token_overdue_time,
  })
});

/**
 * 数尊 使用token登录
 */
router.get('/login/:token',async(req, res) => {
    const {token} = req.params;
    const user = await userService.loginByToken(token);
    if(user&&moment()<moment(user.token_overdue_time)){
      const {plan,id,createdAt,email} = user;

      if(!(plan&&plan.level)){
        return res.send({ status:302, message: 'Your account is not available'})
      }
      await userService.update(id,{token:''});

      req.session.userId = id;
      req.session.user = {
        id,
        email,
        level:plan.level,
        createdTime: createdAt,
      };
      return res.redirect('/');
    }
    return res.send({ status:500, message: 'token is Unavailable!'})
});

router.post('/login', async(req, res) => {
  const { email, password } = req.body;

  let user = await userService.findByEmail(email);

  if(!user){
    return res.send({ status: 404, message: 'user not exists.' })
  }
  if(user.update_password){
    const result = await userService.firstLogin(email,password,sha256(password));
    if(result&&!user.plan){
      const plan = await planService.detail('');
      await userService.update(user.id,{
        plan:plan._id,
      });
      user = await userService.findByEmail(email);
    }else if(!result){
      user = null;
    }
  }else{
    const _result = await userService.login(email,sha256(password));
    user = _result[0];
  }

  if(!user){
    return res.send({ status: 400, message: 'incorrect password.'})
  }
  const {plan,id,createdAt,drole:role={}} = user;

  if(!(plan&&plan.level)){
    return res.send({ status:302, message: 'Your account is not available'})
  }

  req.session.userId = id;
  req.session.user = {
    id,
    email,
    level:plan.level,
    createdTime: createdAt,
  };
  return res.send({
    status: 200,
    message: 'ok',
    info: {
      id,
      email,
      role:role === null ? {}:role,
    }});
});

router.delete('/logout', (req, res) => {
  req.session.destroy(() => {});
  res.send({ status: 200, message: 'ok' });
});

router.get('/status', async (req, res) => {
  if (!req.session || !req.session.userId) return res.send({ status: 401, message: 'not login' });
  const {userId} = req.session;

  const result = await userService.status(userId);

  if(result&&result.id){
    const {id,email,createdAt:createdTime,drole={},plan={}} = result;
    const role = drole === null ? {}:drole;
    Reflect.deleteProperty(role,'_id');
    Reflect.deleteProperty(role,'id');
    Reflect.deleteProperty(role,'name');
    Reflect.deleteProperty(role,'createdAt');
    Reflect.deleteProperty(role,'updatedAt');
    Reflect.deleteProperty(role,'__v');

    return res.send({
      status: 200,
      message: 'ok',
      info: {
        id,
        email,
        createdTime,
        role,
        level:plan&&plan.level,
      }
    });
  }

  return res.send({ status: 500, message: 'get status failed', error:(result||{}).error });
});

register('status', data => {
  return data;
});

router.get('/plans',async (req,res)=>{
  const list = await planService.list();
  const result = list.map(itm=>({
    id:itm._id,
    name:itm.name,
  }));
  res.send({
    status: 200,
    message: 'ok',
    info: result,
  })
});

/**
 * 数尊 注册
 */
router.post('/signin', async (req, res) => {
  let { email,password:_password} = req.body;

  if(!email||!_password){
    return res.send({ status: 500, message: 'please send email and password.' })
  }

  const password = sha256(_password);
  const plans = await planService.list()||[{}];
  const plan = plans.reverse()[0];

  const group = await groupService.findByName('数尊');

  await userService.register(res,{
    email,
    plan:plan.id,
    password,
    group:group&&group.id,
  });

  return res.send('success');
});

router.post('/register', async (req, res) => {
  let { email, level,plan_id,password:_password} = req.body;

  if(!email||!_password){
    return res.send({ status: 500, message: 'please send email and password.' })
  }

  const password = sha256(_password);
  const createdTime = moment().unix();
  if(!plan_id){
    const plan = await planService.detail(plan_id);
    plan_id = plan.id;
  }

  const result = await userService.register(res,{
    email,
    plan:plan_id,
    password
  });

  const {id} = result;

  req.session.userId = id;

  req.session.user = { id, email, level, createdTime };

  return res.send({
    status: 200,
    message: 'ok',
    info: { id, email,role:{} }
  })
});

router.put('/changepassword', async (req, res) => {
  const {userId} = req.session;
  const { current, newPassword } = req.body;

  if (!checkPassword(newPassword)) return res.json({ status: 102, message: passwordError, error: passwordError });

  const result = await userService.status(userId);
  const {password:currentPassword} = result;

  if (sha256(current) !== currentPassword) return res.json({ status: 101, message: 'current password incorrect.', error: 'current password incorrect.' });

  await userService.update(userId,{
    password:sha256(newPassword)
  });

  // @ts-ignore
  req.session.destroy();
  return res.json({ status: 200, message: 'ok' })
});

router.post('/forgetpassword', async (req, res) => {
  const { email } = req.body;
  // const userId = await redis.get(`userEmail:${email}`);
  const user = await userService.findByEmail(email);

  if (!user){
    return res.json({ status: 400, message: 'email not exists.', error: 'email not exists.' })
  }
  const code = new Array(6).fill(0).map(() => Math.floor(Math.random() * 10).toString()).join('');

  redis.set(`forgetPassword:${code}`, user.id, 'EX', 3600);
  sendCodeMail(code, email);
  return res.json({ status: 200, message: 'ok' })
});

router.put('/resetpassword', async (req, res) => {
  const { code, password } = req.body;
  const userId = await redis.get(`forgetPassword:${code}`);
  if (!userId) return res.json({ status: 101, message: 'Your reset password request is invalid or expired.' });
  if (!checkPassword(password)) return res.json({ status: 102, message: passwordError, error: passwordError });
  // redis.hset(`user:${userId}`, 'password', sha256(password))

  const result = await userService.update(userId,{
    password:sha256(password),
  });

  if(result.id){
    redis.del(`forgetPassword:${code}`);
    return res.json({ status: 200, message: 'ok' })
  }
  return res.json({ status: 200, message: result.error })
});

router.get('/schedules', (req, res) => {
  api.getAllSchedule(req.session.userId).then(res.json.bind(res));
});

router.get('/deployment', (req, res) => {
  api.getDeployment(req.query.id).then(res.json.bind(res));
});

router.get('/delete', (req, res) => {
  api.deleteDeploymentSchedules(req.query.id).then(res.json.bind(res));
});

router.get('/file', (req, res) => {
  api.getFile(req.query.id).then(res.json.bind(res));
});

router.get('/session', (req, res) => {
  res.json(req.session);
});

router.post('/report', (req, res) => {
  const { type, text, email } = req.body;
  const method =
    (type === 'Question' && 'we will contact you soon via email.') ||
    (type === 'Bug' && 'we will try to resolve it as soon as possible.') ||
    (type === 'Feature' && 'we will take it into consideration.') ||
    '';
  if (!method) {
    return res.status(500).json({ message: 'report error' });
  }

  const transport = nodemailer.createTransport(config.mail);
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
      "${text}"<br>`,
  };
  transport.sendMail(supportConfig);
  return res.send({
    message: 'ok',
  });
});
export default router;
