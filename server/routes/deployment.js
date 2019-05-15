const { redis, pubsub } = require('redis')
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')
const scheduleApi = require('../scheduleApi')
const deploy = require('../schedule')

const fetchDeployments = (userId) => () => redis.zrange(`user:${userId}:deployments:createdDate`, 0, -1).then(deploymentIds => {
  const pipeline = redis.pipeline()
  deploymentIds.map(deploymentId => pipeline.get(`deployment:${deploymentId}`))
  return pipeline.exec()
}).then(results => {
  const list = results.map(result => JSON.parse(result[1]))
  return { list, status: 200, message: 'ok', type: 'watchDeployments' }
}, error => {
  console.error(error)
  return { status: 500, message: 'search deployments error', error, type: 'watchDeployments' }
})

wss.register('watchSchedule', (message, socket) => {
  const { userId } = socket.session
  const callback = list => ({ status: 200, message: 'ok', list, type: 'watchSchedule' })
  wss.subscribe(`user:${userId}:schedules`, () => scheduleApi.getAllSchedule(userId).then(callback), socket)
  return scheduleApi.getAllSchedule(userId).then(callback)
})

wss.register('watchDeployments', (message, socket) => {
  const { userId } = socket.session;
  wss.subscribe(`user:${userId}:deployments`, fetchDeployments(userId), socket)
  return fetchDeployments(userId)()
})

wss.register('addDeployment', (message, socket) => {
  const { userId } = socket.session
  const createdDate = moment().unix()
  return redis.incr('deploymentId').then(id => {
    const pipeline = redis.pipeline();
    const data = {
      ...message.data,
      id,
      userId,
      createdDate
    }
    pipeline.set(`deployment:${id}`, JSON.stringify(data))
    pipeline.zadd(`user:${userId}:deployments:createdDate`, createdDate, id)
    return pipeline.exec().then(result => {
      wss.publish(`user:${userId}:deployments`, { type: 'add', data })
      return { id, status: 200, message: 'ok' }
    }, error => {
      console.error(error)
      return { status: 500, message: 'add deployment error', error }
    })
  })
})

wss.register('deploySchedule', (message, socket) =>
  scheduleApi.getDeployment(message.deploymentId)
    .then(deployment => deploy(deployment, message.threshold))
    .then(() => ({ status: 200, message: 'ok' }))
)

wss.register('suspendDeployment', (message, socket) => {

})

wss.register('removeDeployment', (message, socket) => {
  const pipeline = redis.pipeline()
  pipeline.zrem(`user:${socket.session.userId}:deployments:createdDate`, message.id)
  pipeline.del(`deployment:${message.id}`)
  return pipeline.exec().then(result => {
    wss.publish(`user:${socket.session.userId}:deployments`, `remove deployment:${message.id}`)
    return scheduleApi.deleteDeploymentSchedules(message.id)
  }).then(() => ({ status: 200, message: 'ok' }))
})

wss.register('updateDeployment', (message, socket) => {
  const { userId } = socket.session
  const { data } = message
  scheduleApi.getDeployment(data.id).then(deployment =>
    redis.set(`deployment:${data.id}`, JSON.stringify({ ...deployment, ...data })).then(result => {
      wss.publish(`user:${userId}:deployments`, { type: 'add', data })
      return { status: 200, message: 'ok' }
    }, error => {
      console.error(error)
      return { status: 500, message: 'update deployment error', error }
    }))
})

wss.register('getAllModels', async (message, socket) => {
  const { projectId } = message
  const currModelIds = await redis.smembers(`project:${projectId}:models`)
  const prevModelIds = await redis.smembers(`project:${projectId}:models:previous`)
  const modelIds = [...currModelIds, ...prevModelIds]
  const pipeline = redis.pipeline()
  modelIds.map(modelId => {
    pipeline.hmget(`project:${projectId}:model:${modelId}`, 'modelName', 'score')
  })
  const modelsResult = await pipeline.exec()
  const models = modelsResult.reduce((prev, curr, index) => {
    const _result = [...prev]
    if (curr[0]) throw { status: 500, message: 'model query failed', error: curr[0] }
    if (!curr[1] || curr[1].length < 2) return
    const score = JSON.parse(curr[1][1])
    _result.push({
      name: JSON.parse(curr[1][0]),
      score,
      modelId: modelIds[index],
      performance: Object.entries(score.validateScore || score).map(([k, v]) => `${k}:${v && v.toFixed && v.toFixed(3)}`).join("\r\n")
    })
    return _result
  }, [])
  const settings = JSON.parse(await redis.hget(`project:${projectId}`, 'settings'))
  const result = settings && settings.reduce((prev, curr) => {
    const _result = { ...prev }
    _result[curr.name] = curr.models.map(name => models.find(model => model.name === name))
    return _result
  }, {})
  return { modelList: result || {} }
})

wss.register('getProjectDeployment', async (message, socket) => {
  const { projectId } = message
  return fetchDeployments(socket.session.userId)().then(response => {
    if (response.status !== 200) return response
    const deployment = response.list.find(d => d.projectId === projectId)
    if (deployment) return { ...response, deploymentId: deployment.id }
    return response
  })
})

wss.register('updateDeploymentModel', async (message, socket) => {
  const { userId } = socket.session
  const { deploymentId, modelName } = message
  const deployment = JSON.parse(await redis.get(`deployment:${deploymentId}`))
  deployment.modelName = modelName
  await redis.set(`deployment:${deploymentId}`, JSON.stringify(deployment))
  wss.publish(`user:${userId}:deployments`, { type: 'update model name' })
})
