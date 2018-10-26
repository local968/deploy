const { redis, pubsub } = require('redis')
const wss = require('./webSocket')
const moment = require('moment')
const userDeployRestrict = [0, 20000, 20000, 200000, 999999999]

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
  checkUserFileRestriction: async (deploymentId, type) => {
    const deployment = await api.getDeployment(deploymentId)
    const userId = deployment.userId
    const [level, createdTime] = await redis.hmget(`user:${userId}`, 'level', 'createdTime')
    const duration = moment.duration(moment().unix() - createdTime)
    const restrictQuery = `user:${userId}:duration:${duration.years()}-${duration.months()}:deploy`
    const fileId = deployment[`${type}Options`].fileId
    if (!fileId) return restrictQuery
    const count = await redis.get(restrictQuery)
    const file = await api.getFile(fileId)
    if (parseInt(count) + parseInt(file.lineCount) > userDeployRestrict[level]) return false
    await redis.incrby(restrictQuery, file.lineCount)
    return restrictQuery
  },
  decreaseLines: async (restrictQuery, lineCount) => {
    await redis.incrby(restrictQuery, -lineCount)
  }
}

module.exports = api
