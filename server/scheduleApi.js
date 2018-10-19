const { redis, pubsub } = require('redis')
const wss = require('./webSocket')
const userConcurrentRestrict = [0, 1, 1, 5, 999999]

const setSchedule = (schedule) => {
  const pipeline = redis.pipeline()
  pipeline.set(`schedule:${schedule.id}`, JSON.stringify(schedule))

  // for getTimeUpSchedules
  pipeline.zrem(`scheduleTimeline`, schedule.id)
  schedule.status === 'waiting' && pipeline.zadd(`scheduleTimeline`, schedule.estimatedTime, schedule.id)

  // for getLastWaitingSchedule
  pipeline.zrem(`deployment:${schedule.deploymentId}:scheduleTimeline:type:${schedule.type}`, schedule.id)
  schedule.status === 'waiting' && pipeline.zadd(`deployment:${schedule.deploymentId}:scheduleTimeline:type:${schedule.type}`, schedule.estimatedTime, schedule.id)

  // for init users' all schedules
  pipeline.sadd(`user:${schedule.userId}:schedules`, schedule.id)

  // for getScheduleCount
  pipeline.sadd(`deployment:${schedule.deploymentId}:schedules:type:${schedule.type}`, schedule.id)
  return pipeline
}

const api = {
  getTimeUpSchedules: (unixTime) => {
    const pipeline = redis.pipeline()
    return redis.zrangebyscore('scheduleTimeline', '-inf', unixTime).then(list => {
      list.map(id => pipeline.get(`schedule:${id}`))
      return pipeline.exec().then(result => result.map(([error, deployment]) => error || JSON.parse(deployment)))
    })
  },
  upsertSchedule: (schedule) => api.getDeployment(schedule.deploymentId).then(deployment => {
    if (!deployment) return
    if (!schedule.userId) schedule.userId = deployment.userId
    if (schedule.id)
      return setSchedule(schedule).exec().then(() => wss.publish(`user:${schedule.userId}:schedules`, `upsert schedule:${schedule.id}`))
    redis.incr('scheduleId').then(id => {
      schedule.id = id
      return setSchedule(schedule).exec().then(() => wss.publish(`user:${schedule.userId}:schedules`, `upsert schedule:${schedule.id}`))
    })
  }),
  getDeployment: (deploymentId) => redis.get(`deployment:${deploymentId}`).then(deployment => JSON.parse(deployment)),
  deleteDeploymentSchedules: (deploymentId) => {
    let _deployment;
    return api.getDeployment(deploymentId).then(deployment => {
      _deployment = deployment
      const pipeline = redis.pipeline()
      pipeline.smembers(`deployment:${deploymentId}:schedules:type:performance`)
      pipeline.smembers(`deployment:${deploymentId}:schedules:type:deployment`)
      return pipeline.exec().then(result => result.reduce((prev, curr) => prev.concat(curr[1]), []))
    }).then(scheduleIds => {
      if (scheduleIds.length === 0) return
      const pipeline = redis.pipeline()
      const delKeys = [
        `deployment:${deploymentId}:schedules:type:performance`,
        `deployment:${deploymentId}:schedules:type:deployment`,
        `deployment:${deploymentId}:scheduleTimeline:type:performance`,
        `deployment:${deploymentId}:scheduleTimeline:type:deployment`,
        ...(scheduleIds.map(id => `schedule:${id}`))
      ]
      _deployment && pipeline.srem(`user:${_deployment.userId}:schedules`, ...scheduleIds)
      pipeline.zrem(`scheduleTimeline`, ...scheduleIds)
      pipeline.del(delKeys)
      return pipeline.exec()
    })
  },
  getScheduleCount: (deploymentId, type) => redis.scard(`deployment:${deploymentId}:schedules:type:${type}`),
  getLastWaitingSchedule: (deploymentId, type) =>
    redis.zrevrangebyscore(`deployment:${deploymentId}:scheduleTimeline:type:${type}`, '+inf', '-inf', 'LIMIT', 0, 1)
      .then(result => result[0] && redis.get(`schedule:${result[0]}`).then(JSON.parse)),
  getAllSchedule: (userId) => redis.smembers(`user:${userId}:schedules`).then(list => {
    const pipeline = redis.pipeline()
    list.map(id => pipeline.get(`schedule:${id}`))
    return pipeline.exec()
  }).then(result => result.map(([error, schedule]) => JSON.parse(schedule))),
  getFile: (id) => redis.get(`file:${id}`).then(JSON.parse),
  isExceedConcurrent: (deploymentId) => new Promise((resolve, reject) => api.getDeployment(deploymentId).then(deployment => {
    const pipeline = redis.pipeline()
    pipeline.get(`user:${deployment.userId}:concurrent`)
    pipeline.hmget(`user:${id}`, 'level')
    return pipeline.exec()
  }).then(result => {
    if (result[0][0] || result[1][0]) resolve(true)
    const concurrent = result[0][1]
    const level = result[1][1][0]
    concurrent >= userConcurrentRestrict[level] ? resolve(true) : resolve(false)
  })),
  startDeploy: (deploymentId) =>
    new Promise((resolve, reject) =>
      api.getDeployment(deploymentId).then(deployment =>
        redis.incr(`user:${deployment.userId}:concurrent`).then(resolve))),
  finishDeploy: (deploymentId) => new Promise((resolve, reject) =>
    new Promise((resolve, reject) =>
      api.getDeployment(deploymentId).then(deployment =>
        redis.incrby(`user:${deployment.userId}:concurrent`, -1).then(resolve))))
}

module.exports = api
