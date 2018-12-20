const { Router } = require('express')
const uuid = require('uuid')
const { redis, pubsub } = require('redis')
const moment = require('moment')
const crypto = require('crypto')
const config = require('config')
const api = require('../scheduleApi')

const router = new Router()

router.post('/deploy', async (req, res) => {
  // deployment
  const deploymentId = req.body.deploymentId
  const deployment = await api.getDeployment(deploymentId);
  if (!deployment) return res.json({ code: 10001, message: 'deployment not found', error: 'deployment not found' })
  const { projectId, modelName, modelType, userId, createdDate } = deployment

  // data format
  if (!req.body.data) return res.json({ code: 10002, message: 'data not found', error: 'data not found' })
  let data
  try {
    data = JSON.parse(req.body.data)
  } catch (e) {
    return res.json({ code: 10004, message: 'data is not a JSON string', error: 'data is not a JSON string' })
  }
  if (!data || !Array.isArray(data) || data.length === 0) return res.json({ code: 10005, message: 'data is empty', error: 'data is empty' })
  data = data2csv(data)

  // upload
  const file = uploadData(data)

  const token = req.body.token
  if (!token) return res.json({ code: 10003, message: 'token not found', error: 'token not found' })
  const name = `api-deploy-${uuid.v4()}`
  const request = {
    requestId: name,
    // projectId: projectId,
    userId: userId,
    // csvLocation: [file.path],
    ext: ['.csv'],
    command: "deploy2",
    // solution: deployment.modelName
  }
  res.send('ok')
})

function data2csv(data) {
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

function uploadData(data) {

}


module.exports = router
