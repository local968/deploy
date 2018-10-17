const { Router } = require('express')
const formidable = require('formidable')
const { redis } = require('redis')
const config = require('config')
const uuid = require('uuid')
const crypto = require('crypto');
const moment = require('moment')
const path = require('path')
const fs = require('fs')

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
    console.log(fields)
    redis.set('file:' + fileId, JSON.stringify(fields))
    res.json({ fileId, status: 200, message: 'ok' })
  });
})

router.post('/sample', (req, res) => {
  const id = req.body.id
  const userId = req.session.userId
  if (!id || !userId) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  redis.get('file:sample:' + id, (err, data) => {
    if (err) return res.json({ status: 201, message: 'file error' })
    if (!data) return res.json({ status: 202, message: 'file not exist' })
    res.json({ status: 200, message: 'ok', fileId: data })
  })
})

function saveSample() {
  const array = [
    {
      name: 'bank.train.csv',
      path: '/r2/sample/1',
      createdTime: 1539757558
    },
    {
      name: 'titanic.train.csvv',
      path: '/r2/sample/2',
      createdTime: 1539757558
    },
    {
      name: 'dma1c_dirty.csv',
      path: '/r2/sample/3',
      createdTime: 1539757558
    },
    {
      name: 'givemecredit_dirty.csv',
      path: '/r2/sample/4',
      createdTime: 1539757558
    },
    {
      name: 'regression.house.csv',
      path: '/r2/sample/5',
      createdTime: 1539757558
    },
    {
      name: 'game.csv',
      path: '/r2/sample/6',
      createdTime: 1539757558
    }
  ]

  const ids = ["1539759771", "1539759772", "1539759773", "1539759774", "1539759775", "1539759776"]

  const pipeline = redis.pipeline();
  array.forEach((v, k) => {
    const fileId = 
    pipeline.set('file:sample:' + (k + 1), ids[k])
    pipeline.set('file:' + ids[k], JSON.stringify(v))
  })
  pipeline.exec().then(console.log)
}

// saveSample()

module.exports = router
