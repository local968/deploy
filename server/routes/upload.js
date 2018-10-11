const { Router } = require('express')
const formidable = require('formidable')
const { redis } = require('redis')
const config = require('config')
const uuid = require('uuid')
const crypto = require('crypto');
const md5 = crypto.createHash('md5');

const router = new Router()

router.post('/check', (req, res) => {
  const fileSize = req.body.fileSize
  const userId = req.session.userId
  if (!fileSize || !userId) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  const token = md5.update(userId + fileSize + config.secret).digest('hex')
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
    if (error) return res.json({
      status: 500,
      message: 'upload error',
      error
    })
    const fileId = uuid.v4()
    redis.set('file:' + fileId, JSON.stringify(fields))
    res.json({ fileId, status: 200, message: 'ok' })
  });

})

module.exports = router
