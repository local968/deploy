const { Router } = require('express')
const uuid = require('uuid')
const { redis, pubsub } = require('redis')
const moment = require('moment')
const axios = require('axios')
const crypto = require('crypto')
const config = require('config')
const command = require('../command')
const api = require('../scheduleApi')
const { userDeployRestriction } = require('restriction')

const router = new Router()

router.post('/deploy', async (req, res) => {
  const errorRes = error(res)

  // deployment
  const deploymentId = req.body.deploymentId
  if (!deploymentId) return errorRes(10001)
  const deployment = await api.getDeployment(deploymentId);
  if (!deployment) return errorRes(10001)
  const { projectId, modelName, modelType, userId } = deployment
  const host = JSON.parse(await redis.hget(`project:${projectId}`, 'host'))
  let lineCount = 0

  // token
  const token = req.body.token
  if (!token) return errorRes(10003)
  const validToken = crypto.createHash('md5').update(userId + projectId + deploymentId + config.secret).digest('hex')
  if (token !== validToken) return errorRes(10010)

  // data format
  if (!req.body.data) return errorRes(10002)
  let data
  try {
    data = JSON.parse(req.body.data)
    lineCount = data.length
  } catch (e) {
    return errorRes(10004)
  }
  if (!data || !Array.isArray(data) || data.length === 0) return errorRes(10005)
  data = array2csv(data)
  if (lineCount > 100 || data.length > 1024 * 1024 * 100) return errorRes(10012)

  const name = `api-deploy-${uuid.v4()}`

  // upload
  let fileId
  try {
    const uploadResponse = await uploadData(data, name, userId, projectId, `http://${host}/upload`)
    if (uploadResponse.data.status === 200) fileId = uploadResponse.data.fileId
    else return errorRes(10007, uploadResponse.data && uploadResponse.data.message)
  } catch (e) {
    console.error(e)
    return errorRes(10006)
  }
  const file = await api.getFile(fileId)

  // check user level usage
  const [level, createdTime] = await redis.hmget(`user:${userId}`, 'level', 'createdTime')
  const duration = moment.duration(moment().unix() - createdTime)
  const restrictQuery = `user:${userId}:duration:${duration.years()}-${duration.months()}:deploy`
  const count = await redis.get(restrictQuery)
  const left = userDeployRestriction[level] - parseInt(count)
  if (parseInt(lineCount) >= left)
    return errorRes(10011, `Your remaining number of predictions this month: ${left} \nNumber of predictions you are attempting: ${lineCount} \nSorry but your attempt is refused.`)
  await redis.incrby(restrictQuery, lineCount)

  // generate request
  const request = {
    requestId: name,
    projectId: projectId,
    userId: userId,
    csvLocation: [file.path],
    ext: ['.csv'],
    command: "deploy2",
    solution: deployment.modelName
  }
  if (modelType !== "Regression") request.cutoff = await api.getCutOff(projectId, modelName)
  if (deployment.csvScript && deployment.csvScript !== '') request.csvScript = deployment.csvScript
  let result = {}
  await command(request, data => {
    result = { ...result, ...data.result }
    return data.status === 100 || data.status < 0
  })

  // handle result
  if (result['process error']) {
    api.decreaseLines(restrictQuery, lineCount)
    return errorRes(10008, result['process error'])
  }
  if (!result.resultPath || result.resultPath.length === 0) {
    return errorRes(10009, result.message)
  }
  let resultData
  try {
    resultData = await axios.get(`http://${host}/download/${result.resultPath}`)
  } catch (e) {
    console.error(e)
    return errorRes(10013)
  }
  if (!resultData.data) return errorRes(10014)

  res.json({
    result: csv2array(resultData.data),
    code: 10000,
    message: 'ok'
  })
})

function array2csv(data) {
  let result = ''
  const keys = [...(data.reduce((prev, curr) => {
    Object.keys(curr).map(prev.add.bind(prev))
    return prev
  }, new Set()))]
  result += keys.join(',')
  result += '\n'
  data.forEach(d => {
    const line = keys.map(k => d[k] || '')
    result += line.join(',')
    result += '\n'
  })
  return result
}

function csv2array(csv) {
  const headers = csv.substring(0, csv.indexOf('\n')).split(',')
  const datas = csv.split('\n').slice(1).map(line => line.split(','))
  return datas.map(line => line.reduce((prev, curr, index) => {
    if (curr && curr.length > 0) prev[headers[index]] = curr
    return prev
  }, {}))
}

const uploadData = (data, name, userId, projectId, path) => {
  const token = crypto.createHash('md5').update(userId + 'deploy' + data.length + config.secret).digest('hex')
  return axios.post(`${path}?token=${token}&userId=${userId}&type=deploy&fileSize=${data.length}&projectId=${projectId}`, data, {
    headers: {
      'content-disposition': `attachment; filename="${name}.csv"`,
      'content-type': 'application/octet-stream',
      'content-range': `bytes 0-${data.length - 1}/${data.length}`,
      'session-id': moment().valueOf(),
      'backend': 1
    },
    onUploadProgress: console.log
  })
}

const error = (res) => (code, error) => {
  if (!res) return
  if (!code) return
  res.json({
    code,
    message: errors[code],
    error: error ? error : errors[code]
  })
}

const errors = {
  10001: 'deployment not found',
  10002: 'data not found',
  10003: 'token not found',
  10004: 'data is not a valid JSON string',
  10005: 'data is empty or not a valid array',
  10006: 'file upload error',
  10007: 'file upload failed',
  10008: 'predict error',
  10009: 'predict failed',
  10010: 'invalid token',
  10011: 'exceed prediction usage limit',
  10012: 'exceed prediction api limit',
  10013: 'download predict result failed',
  10014: 'predict result is empty'
}


module.exports = router

// back data curl test script
// curl -X POST --data "data=[{\"age\":\"300\",\"job\":\"unemployed\",\"marital\":\"married\",\"education\":\"primary\",\"default\":\"no\",\"balance\":\"1787\",\"housing\":\"no\",\"loan\":\"no\",\"contact\":\"cellular\",\"day\":\"19\",\"month\":\"oct\",\"duration\":\"79\",\"campaign\":\"1\",\"pdays\":\"100\",\"previous\":\"3\",\"poutcome\":\"unknown\"},{\"job\":\"services\",\"marital\":\"married\",\"education\":\"secondary\",\"default\":\"no\",\"balance\":\"4789\",\"housing\":\"yes\",\"loan\":\"yes\",\"contact\":\"cellular\",\"day\":\"11\",\"month\":\"may\",\"duration\":\"220\",\"campaign\":\"1\",\"pdays\":\"339\",\"previous\":\"4\",\"poutcome\":\"failure\"},{\"age\":\"35\",\"marital\":\"single\",\"education\":\"tertiary\",\"default\":\"no\",\"balance\":\"1476\",\"housing\":\"yes\",\"loan\":\"no\",\"contact\":\"cellular\",\"day\":\"16\",\"month\":\"apr\",\"duration\":\"185\",\"campaign\":\"1\",\"pdays\":\"330\",\"previous\":\"1\",\"poutcome\":\"failure\"},{\"age\":\"30\",\"job\":\"management\",\"marital\":\"married\",\"education\":\"tertiary\",\"default\":\"no\",\"balance\":\"1476\",\"housing\":\"yes\",\"loan\":\"yes\",\"contact\":\"unknown\",\"day\":\"11\",\"month\":\"jun\",\"duration\":\"199\",\"campaign\":\"4\",\"pdays\":\"100\",\"previous\":\"3\",\"poutcome\":\"unknown\"}]&token=43f6fb59585d9b0722c35b4bbcdfae20&deploymentId=3" localhost:8080/api/deploy
