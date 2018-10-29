const { Router } = require('express')
const formidable = require('formidable')
const { redis } = require('redis')
const config = require('config')
const uuid = require('uuid')
const crypto = require('crypto');
const moment = require('moment')
const command = require('../command')
const { userModelingRestriction, userStorageRestriction } = require('restriction')

const router = new Router()

router.post('/check', async (req, res) => {
  const fileSize = req.body.fileSize
  const userId = req.session.userId
  const type = req.body.type
  const projectId = req.body.projectId
  const host = JSON.parse(await redis.hget(`project:${projectId}`, 'host'))
  if (!fileSize || !userId || !type) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  if (type === 'modeling' && parseInt(fileSize) > userModelingRestriction[req.session.user.level]) return res.json({
    status: 416,
    message: 'Your usage of modeling data size has reached the max restricted by your current lisense.',
    error: 'modeling file too large'
  })
  const size = redis.get(`user:${userId}:upload`)
  if (parseInt(size) + parseInt(fileSize) > userStorageRestriction[req.session.user.level]) return res.json({
    status: 417,
    message: 'Your usage of storage space has reached the max restricted by your current lisense.',
    error: 'storage space full'
  })
  const token = crypto.createHash('md5').update(userId + type + fileSize + config.secret).digest('hex')
  res.json({
    status: 200,
    message: 'ok',
    token,
    host
  })
})

router.post('/', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    const params = req.query
    if (!params || !params.token || !params.userId || !params.type) return res.json({
      status: 404,
      message: 'missing params',
      error: 'missing params'
    })
    const validationToken = crypto.createHash('md5').update(params.userId + params.type + params.fileSize + config.secret).digest('hex')
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

    const _filename = fields.name.split('.')
    const fileId = uuid.v4()
    const csvLocation = [fields.path]
    const ext = ['.' + _filename[_filename.length - 1]]
    command({
      command: 'csvMeta',
      requestId: fileId,
      userId: params.userId,
      projectId: params.projectId,
      csvLocation,
      computeLines: true,
      ext
    }, (result) => (result.status < 0 || result.status === 100) && result)
      .then(result => {
        const lineCount = result.result.lines || 0
        fields.createdTime = moment().unix()
        fields.lineCount = lineCount
        fields.params = params
        redis.set('file:' + fileId, JSON.stringify(fields))
        redis.incrby(`user:${params.userId}:upload`, parseInt(params.fileSize))
        res.json({ fileId, status: 200, message: 'ok' })
      })
  });
})

router.post('/sample', (req, res) => {
  const filename = req.body.filename
  const userId = req.session.userId
  if (!filename || !userId) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  redis.get('file:sample:' + filename, (err, data) => {
    if (err) return res.json({ status: 201, message: 'file error' })
    if (!data) return res.json({ status: 202, message: 'file not exist' })
    res.json({ status: 200, message: 'ok', fileId: data })
  })
})

router.get('/test', async (req, res) => {
  const projectId = req.query.id
  const host = await redis.hget(`project:${projectId}`, 'host')
  res.json(JSON.parse(host))
})

function saveSample() {
  const array = [
    {
      name: 'bank.train.csv',
      path: '/r2/sample/bank.train.csv',
      createdTime: 1539757558
    },
    {
      name: 'titanic.train.csv',
      path: '/r2/sample/titanic.train.csv',
      createdTime: 1539757558
    },
    {
      name: 'dma1c_dirty.csv',
      path: '/r2/sample/dma1c_dirty.csv',
      createdTime: 1539757558
    },
    {
      name: 'givemecredit_dirty.csv',
      path: '/r2/sample/givemecredit_dirty.csv',
      createdTime: 1539757558
    },
    {
      name: 'regression.house.csv',
      path: '/r2/sample/regression.house.csv',
      createdTime: 1539757558
    },
    {
      name: 'game.csv',
      path: '/r2/sample/game.csv',
      createdTime: 1539757558
    }
  ]

  const ids = ["1539759771", "1539759772", "1539759773", "1539759774", "1539759775", "1539759776"]

  const pipeline = redis.pipeline();
  array.forEach((v, k) => {
    pipeline.set('file:sample:' + v.name, ids[k])
    pipeline.set('file:' + ids[k], JSON.stringify(v))
  })
  pipeline.exec()
}

saveSample()

module.exports = router
