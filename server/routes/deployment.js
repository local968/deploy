const { redis, pubsub } = require('redis')
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')

wss.register('watchSchedule', (message, socket) => {
  return { list: [] }
})

wss.register('watchDeployments', (message, socket) => {
  const userId = socket.session.userId
  const fetchDeployments = () => redis.zrange(`user:${userId}:deployments:createdDate`, 0, -1).then(deploymentIds => {
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

  wss.subscribe(`user:${userId}:deployments`, fetchDeployments, socket)
  return fetchDeployments()
})

wss.register('addDeployment', (message, socket) => {
  const userId = socket.session.userId
  const createdDate = moment().unix()
  return redis.incr('deploymentId').then(id => {
    const pipeline = redis.pipeline();
    const data = message.data
    data.id = id
    data.userId = userId
    pipeline.set('deployment:' + id, JSON.stringify(data))
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

wss.register('deploySchedule', (message, socket) => {

})

wss.register('suspendDeployment', (message, socket) => {

})

wss.register('removeDeployment', (message, socket) => {

})

wss.register('updateDeployment', (message, socket) => {
  const data = message.data
  return redis.set(`deployment:${data.id}`, JSON.stringify(data)).then(result => {
    return { status: 200, message: 'ok' }
  }, error => {
    console.error(error)
    return { status: 500, message: 'update deployment error', error }
  })
})
