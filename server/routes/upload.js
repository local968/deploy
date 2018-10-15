const { Router } = require('express')
const formidable = require('formidable')
const { redis } = require('redis')
const config = require('config')
const uuid = require('uuid')
const crypto = require('crypto');
const moment = require('moment')

const router = new Router()

router.post('/check', (req, res) => {
  const fileSize = req.body.fileSize
  const userId = req.session.userId
  if (!fileSize || !userId) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  const token = crypto.createHash('md5').update(userId + fileSize + config.secret).digest('hex')
  res.json({
    status: 200,
    message: 'ok',
    token
  })
})

router.post('/', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    const params = req.query
    if (!params || !params.token || !params.userId) return res.json({
      status: 404,
      message: 'missing params',
      error: 'missing params'
    })
    const validationToken = crypto.createHash('md5').update(params.userId + params.fileSize + config.secret).digest('hex')
    if (validationToken !== params.token) return res.json({
      status: 401,
      message: 'token error',
      error: 'token error'
    })
    if (error) return res.json({
      status: 500,
      message: 'upload error',
      error
    })
    const fileId = uuid.v4()
    fields.createdTime = moment().unix()
    fields.params = params
    redis.set('file:' + fileId, JSON.stringify(fields))
    res.json({ fileId, status: 200, message: 'ok' })
  });

})

module.exports = router
