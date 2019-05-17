const { Router } = require('express')
const formidable = require('formidable')
const { redis } = require('redis')
const config = require('config')
const uuid = require('uuid')
const crypto = require('crypto');
const fs = require('fs');
const path = require('path')
const moment = require('moment')
const axios = require('axios')
const Papa = require('papaparse')
const command = require('../command')
const { userModelingRestriction, userStorageRestriction } = require('restriction')
const http = require('http')
const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'
const router = new Router()


router.post('/check', async (req, res) => {
  const { fileSize, type, projectId } = req.body
  const { userId } = req.session
  const host = JSON.parse(await redis.hget(`project:${projectId}`, 'host'))
  if (!fileSize || !userId || !type) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  if (type === 'modeling' && +fileSize >= userModelingRestriction[req.session.user.level]) return res.json({
    status: 416,
    message: 'Your usage of modeling data size has reached the max restricted by your current license.',
    error: 'modeling file too large'
  })
  const size = await redis.get(`user:${userId}:upload`)
  if (+size + +fileSize >= userStorageRestriction[req.session.user.level]) return res.json({
    status: 417,
    message: 'Your usage of storage space has reached the max restricted by your current license.',
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
  // console.log('upload nginx callback')
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
      computeLines: params.type === 'deploy',
      ext
    }, (result) => (result.status < 0 || result.status === 100) && result)
      .then(result => {
        const { lines: lineCount = 0 } = result.result
        fields.name = decodeURIComponent(fields.name)
        fields.createdTime = moment().unix()
        fields.lineCount = lineCount
        fields.from = 'upload'
        fields.type = params.type
        fields.params = params
        fields.userId = params.userId
        redis.set(`file:${fileId}`, JSON.stringify(fields))
        redis.incrby(`user:${params.userId}:upload`, +params.fileSize)
        res.json({ fileId, status: 200, message: 'ok' })
      })
  });
})

router.post('/sample', (req, res) => {
  const { filename } = req.body
  const { userId } = req.session
  if (!filename || !userId) return res.json({
    status: 404,
    message: 'missing params',
    error: 'missing params'
  })
  redis.get(`file:sample:${filename}`, (err, data) => {
    if (err) return res.json({ status: 201, message: 'file error' })
    if (!data) return res.json({ status: 202, message: 'file not exist' })
    res.json({ status: 200, message: 'ok', fileId: data })
  })
})

router.get('/dataDefinition', async (req, res) => {
  const { userId } = req.session
  const { projectId } = req.query
  if (!userId) return res.json({ status: 401, message: 'need login', error: 'need login' })
  const rank = await redis.zrank(`user:${userId}:projects:createTime`, projectId)
  if (rank === null) return res.json({ status: 404, message: 'project not found.', error: 'project not found.' })
  const data = JSON.parse(await redis.hget(`project:${projectId}`, 'dataHeader'))
  const target = JSON.parse(await redis.hget(`project:${projectId}`, 'target'))
  res.attachment('definition.csv');
  res.type('csv')
  res.send(data.filter(h => h !== target).join(','))
})

router.get('/test', async (req, res) => {
  const { userId } = req.session
  const { id: projectId } = req.query
  const host = await redis.hget(`project:${projectId}`, 'host')
  res.json(host)
})

router.get('/reload', (req, res) => {
  saveSample()
  res.json({
    status: 100,
    msg: 'ok'
  })
})

function saveSample() {
  const root = process.cwd()
  const samplePath = path.join(root, config.samplePath || "sample")
  const sampleFilePath = config.sampleFilePath || '/r2/sample'

  if (!fs.existsSync(samplePath)) return console.log("sample not exist")

  // if (fs.existsSync(sampleFilePath)) {
  //   console.log("sample already exist")
  // } else {
  //   try {
  //     fs.symlinkSync(samplePath, sampleFilePath)
  //   } catch (e) { return console.log(e.message) }
  //   console.log("symlink create")
  // }
  const files = fs.readdirSync(samplePath)

  const pipeline = redis.pipeline();
  pipeline.del(`file:C:samples`)
  pipeline.del(`file:R:samples`)
  try {
    files.forEach(f => {
      const [type, target, name] = f.split("__")
      const filePath = path.join(sampleFilePath, f)
      const s = fs.statSync(filePath)
      const id = uuid.v4()
      const data = {
        id,
        name,
        path: filePath,
        createdTime: +new Date(),
        size: s.size,
        ext: '.csv'
      }
      pipeline.sadd(`file:${type}:samples`, JSON.stringify({ name, target, size: s.size }))
      pipeline.set(`file:sample:${name}`, id)
      pipeline.set(`file:${id}`, JSON.stringify(data))
    })
  } catch (e) { console.error(e) }

  pipeline.exec()
}

router.get('/download/model', async (req, res) => {
  const { filename, projectId, mid, etlIndex } = req.query
  // http://192.168.0.83:8081/blockData?uid=1c40be8a70c711e9b6b391f028d6e331
  const model = await redis.hgetall(`project:${projectId}:model:${mid}`)
  const { featureImportance, deployData } = model
  const header = Object.keys(JSON.parse(featureImportance))
  const url = JSON.parse(deployData)

  downloadCsv(url, decodeURIComponent(filename), etlIndex, header, res)

  // let temp = {}
  // let counter = 0
  // let resultHeader
  // // let start = Math.min(...nos, row['__on'])
  // // let end = Math.max(...nos, row['__on'])
  // res.attachment(filename);
  // res.type('csv')
  // http.get(url, (response) => {
  //   Papa.parse(response, {
  //     download: true,
  //     header: true,
  //     step: async (results, parser) => {
  //       const row = results.data[0]
  //       if (!resultHeader) {
  //         resultHeader = [...header, ...Object.keys(row).filter(key => key !== '__no')]
  //         res.write(Papa.unparse([resultHeader, []], { header: false }))
  //       }
  //       const nos = Object.keys(temp)
  //       const _start = Math.min(...nos, row['__no'])
  //       const _end = Math.max(...nos, row['__no'])
  //       if (counter >= 500 || _end - _start >= 10000) {
  //         const start = Math.min(...nos)
  //         const end = Math.max(...nos)
  //         parser.pause()
  //         counter = 0
  //         const response = await axios.get(`${esServicePath}/etls/${etlIndex}/preview?start=${start}&end=${end}`)
  //         const result = response.data.result.map(esRow => resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])))
  //         result.push([])
  //         res.write(Papa.unparse(result, { header: false }))
  //         temp = {}
  //         parser.resume()
  //       }
  //       temp[row['__no']] = row
  //       counter++
  //     },
  //     complete: async (results, file) => {
  //       counter = 0
  //       const nos = Object.keys(temp)
  //       const response = await axios.get(`${esServicePath}/etls/${etlIndex}/preview?start=${Math.min(...nos)}&end=${Math.max(...nos)}`)
  //       const result = response.data.result.map(esRow => resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])))
  //       result.push([])
  //       res.write(Papa.unparse(result, { header: false }))
  //       temp = {}
  //       res.end()
  //     }
  //   })
  // })
})

router.get('/download/outlier', async (req, res) => {
  const { filename, mid, rate, etlIndex, projectId } = req.query
  const { userId } = req.session
  const requestId = uuid.v4()

  const model = await redis.hgetall(`project:${projectId}:model:${mid}`)
  const { featureImportance } = model
  const header = Object.keys(JSON.parse(featureImportance))

  let _rate = rate
  try {
    _rate = parseFloat(rate)
  } catch (e) { }

  try {
    const deployResult = await command({
      command: 'outlier.deploy',
      requestId,
      projectId,
      userId,
      csvLocation: [etlIndex],
      ext: ['csv'],
      solution: mid,
      actionType: 'deployment',
      frameFormat: 'csv',
      rate: _rate
    }, processData => {
      const { status, result } = processData
      if (status === 1) return
      if (status === 100) return result
      throw new Error(result[processError])
    })

    downloadCsv(deployResult.deployData, decodeURIComponent(filename), etlIndex, header, res)
  } catch (e) {
    return res.status(500).send(e)
  }
})

// todo
// 500行分片下载还是有潜在bug
// 可以存在__no 的 end - start > 10000的状况 这个时候es会报错
// 最优方案还是将结果写入进es再下载
router.get('/download/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params
  const { filename } = req.query
  // http://192.168.0.83:8081/blockData?uid=1c40be8a70c711e9b6b391f028d6e331
  const schedule = JSON.parse(await redis.get(`schedule:${scheduleId}`))

  const { data: { header } } = await axios.get(`${esServicePath}/etls/${schedule.index}/headerArray`)

  downloadCsv(schedule.result.deployData, filename, schedule.index, header, res)

  // let temp = {}
  // let counter = 0
  // let resultHeader
  // // let start = Math.min(...nos, row['__on'])
  // // let end = Math.max(...nos, row['__on'])
  // res.attachment(filename);
  // res.type('csv')
  // http.get(schedule.result.deployData, (response) => {
  //   Papa.parse(response, {
  //     download: true,
  //     header: true,
  //     step: async (results, parser) => {
  //       const row = results.data[0]
  //       if (!resultHeader) {
  //         resultHeader = [...header, ...Object.keys(row).filter(key => key !== '__no')]
  //         res.write(Papa.unparse([resultHeader, []], { header: false }))
  //       }
  //       const nos = Object.keys(temp)
  //       const _start = Math.min(...nos, row['__no'])
  //       const _end = Math.max(...nos, row['__no'])
  //       if (counter >= 500 || _end - _start >= 10000) {
  //         const start = Math.min(...nos)
  //         const end = Math.max(...nos)
  //         parser.pause()
  //         counter = 0
  //         const response = await axios.get(`${esServicePath}/etls/${schedule.index}/preview?start=${start}&end=${end}`)
  //         const result = response.data.result.map(esRow => resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])))
  //         result.push([])
  //         res.write(Papa.unparse(result, { header: false }))
  //         temp = {}
  //         parser.resume()
  //       }
  //       temp[row['__no']] = row
  //       counter++
  //     },
  //     complete: async (results, file) => {
  //       counter = 0
  //       const nos = Object.keys(temp)
  //       const response = await axios.get(`${esServicePath}/etls/${schedule.index}/preview?start=${Math.min(...nos)}&end=${Math.max(...nos)}`)
  //       const result = response.data.result.map(esRow => resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])))
  //       result.push([])
  //       res.write(Papa.unparse(result, { header: false }))
  //       temp = {}
  //       res.end()
  //     }
  //   })
  // })

})

function downloadCsv(url, filename, index, header, res) {
  let temp = {}
  let counter = 0
  let resultHeader
  res.attachment(filename);
  res.type('csv')
  http.get(url, (response) => {
    Papa.parse(response, {
      download: true,
      header: true,
      step: async (results, parser) => {
        const row = results.data[0]
        if (!resultHeader) {
          resultHeader = [...header, ...Object.keys(row)].filter(key => key !== '__no')
          res.write(Papa.unparse([resultHeader, []], { header: false }))
        }
        const nos = Object.keys(temp)
        const _start = Math.min(...nos, row['__no'])
        const _end = Math.max(...nos, row['__no'])
        if (counter >= 500 || _end - _start >= 10000) {
          const start = Math.min(...nos)
          const end = Math.max(...nos)
          parser.pause()
          counter = 0
          const response = await axios.get(`${esServicePath}/etls/${index}/preview?start=${start}&end=${end}`)
          const result = response.data.result.map(esRow => resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])))
          result.push([])
          res.write(Papa.unparse(result, { header: false }))
          temp = {}
          parser.resume()
        }
        temp[row['__no']] = row
        counter++
      },
      complete: async (results, file) => {
        counter = 0
        const nos = Object.keys(temp)
        const response = await axios.get(`${esServicePath}/etls/${index}/preview?start=${Math.min(...nos)}&end=${Math.max(...nos)}`)
        const result = response.data.result.map(esRow => resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])))
        result.push([])
        res.write(Papa.unparse(result, { header: false }))
        temp = {}
        res.end()
      }
    })
  })
}

// saveSample()

module.exports = router
