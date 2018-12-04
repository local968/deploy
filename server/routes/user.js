const { Router } = require('express')
const uuid = require('uuid')
const { redis, pubsub } = require('redis')
const { register } = require('../webSocket')
const moment = require('moment')
const crypto = require('crypto')
const config = require('config')
const api = require('../scheduleApi')

const sha256 = password => crypto.createHmac('sha256', config.secret)
  .update(password)
  .digest('hex');

const router = new Router()

router.post('/login', (req, res) => {
  const {email,password} = req.body
  redis
    .get(`userEmail:${email}`)
    .then(id => id
      ? redis.hmget(`user:${id}`, 'id', 'email', 'password', 'level', 'createdTime')
      : Promise.reject({ status: 404, message: 'user not exists.' }))
    .then(info => {
      if (sha256(password) === info[2]) {
        if (info[3] === 0 || !info[3]) return Promise.reject({ status: 302, message: 'Your account is not available' })
        req.session.userId = info[0]
        req.session.user = { id: info[0], email: info[1], level: info[3], createdTime: info[4] }
        res.send({ status: 200, message: 'ok', info: { id: info[0], email: info[1] } })
      } else {
        return Promise.reject({ status: 400, message: 'incorrect password.' })
      }
    })
    .catch(error => res.send(error))
});

router.delete('/logout', (req, res) => {
  // console.log('Destroying session');
  req.session.destroy();
  res.send({ status: 200, message: 'ok' });
});

router.get('/status', (req, res) => {
  if (!req.session || !req.session.userId) return res.send({ status: 401, message: 'not login' })
  redis.hmget('user:' + req.session.userId, 'id', 'email', 'createdTime').then(info =>
    res.send({
      status: 200,
      message: 'ok',
      info: { id: info[0], email: info[1], createdTime: info[2] }
    })
  ).catch(error => res.send({ status: 500, message: 'get status failed', error }))
})

register('status', (data) => {
  return data
})

router.post('/register', (req, res) => {
  const {email,level} = req.body
  const password = sha256(req.body.password)
  const id = uuid.v4()
  const createdTime = moment().unix()
  // todo verify user info

  redis
    .setnx(`userEmail:${email}`, id)
    .then(success => success
      ? redis.hmset(`user:${id}`, 'id', id, 'email', email, 'password', password, 'level', level || 1, 'createdTime', createdTime)
      : Promise.reject({ status: 400, message: 'email exists.' })
    ).then(ok => {
      req.session.userId = id
      req.session.user = { id, email, level, createdTime }
      if (ok) res.send({
        status: 200,
        message: 'ok',
        info: { id, email }
      })
    }, error => res.send(error))
})

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
module.exports = router
