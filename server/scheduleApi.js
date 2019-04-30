const { redis, pubsub } = require('redis')
const wss = require('./webSocket')
const uuid = require('uuid')
const command = require('./command')
const moment = require('moment')
const { userDeployRestriction, userStorageRestriction } = require('restriction')

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
  updateDeployment: (deployment) => {
    redis.set(`deployment:${deployment.id}`, JSON.stringify(deployment)).then(result => {
      wss.publish(`user:${deployment.userId}:deployments`, { type: 'update' })
    }, error => {
      console.error(error)
    })
  },
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
  getDatabaseFile: async (options, userId, projectId, level) => {
    const resp = await command({
      ...options,
      projectId,
      requestId: uuid.v4(),
      command: 'sqlData',
      userId
    }, (result) => (result.status < 0 || result.status === 100) ? result : false)
    if (resp.result['process error']) throw {
      status: 420,
      message: resp.result.msg,
      error: resp.result['process error']
    }
    const path = resp.result.csvLocation
    const name = resp.result.filename
    const size = resp.result.size.toString()
    const lineCount = resp.result.totalLines
    if (!path) throw new Error('no path')
    const previewSize = await redis.get(`user:${userId}:upload`)
    if (parseInt(previewSize) + parseInt(size) >= userStorageRestriction[level]) throw {
      status: 417,
      message: 'Your usage of storage space has reached the max restricted by your current license.',
      error: 'storage space full'
    }
    const fileId = uuid.v4()
    await redis.set('file:' + fileId, JSON.stringify({
      name,
      content_type: "application/octet-stream",
      path,
      md5: '',
      size,
      from: 'sql',
      type: 'deploy',
      createdTime: moment().unix(),
      lineCount,
      userId,
      options
    }))
    await redis.incrby(`user:${userId}:upload`, parseInt(size))
    return fileId
  },
  checkUserFileRestriction: async (deploymentId, type) => {
    const deployment = await api.getDeployment(deploymentId)
    const userId = deployment.userId
    const [level, createdTime] = await redis.hmget(`user:${userId}`, 'level', 'createdTime')
    const duration = moment.duration(moment().unix() - createdTime)
    const restrictQuery = `user:${userId}:duration:${duration.years()}-${duration.months()}:deploy`
    const options = deployment[`${type}Options`].sourceOptions
    const source = deployment[`${type}Options`].source
    const fileId = source === 'database' ? await api.getDatabaseFile(options, userId, deployment.projectId, level) : deployment[`${type}Options`].fileId
    if (source === 'database') {
      deployment[`${type}Options`].fileId = fileId
      deployment[`${type}Options`].file = `${options.databaseType}-${moment().unix()}`
      await redis.set(`deployment:${deploymentId}`, JSON.stringify(deployment))
    }
    if (!fileId) return restrictQuery
    const count = await redis.get(restrictQuery)
    if (parseInt(count) + parseInt(deployment.lineCount) >= userDeployRestriction[level]) return false
    await redis.incrby(restrictQuery, deployment.lineCount)
    return restrictQuery
  },
  decreaseLines: async (restrictQuery, lineCount) => {
    await redis.incrby(restrictQuery, -lineCount)
  },
  getCutOff: async (projectId, modelName) => {
    return redis.smembers(`project:${projectId}:models`).then(ids => {
      const pipeline = redis.pipeline();
      ids.forEach(mid => {
        pipeline.hmget(`project:${projectId}:model:${mid}`, "name", 'fitIndex', 'chartData')
      })
      return pipeline.exec().then(list => {
        const models = list.map(row => {
          let [name, fitIndex, chartData] = row[1] || []
          try {
            name = JSON.parse(name)
            fitIndex = JSON.parse(fitIndex)
            chartData = JSON.parse(chartData)
          } catch (e) { }
          return { name, fitIndex, chartData }
        })
        const model = models.find(m => m.name === modelName) || {}
        const cutoff = model.chartData.roc.Threshold[model.fitIndex || 0]
        return cutoff
      })
    })
  },
  getFeatureLabel: async projectId => {
    try {
      const newFeatureLabel = {}
      const fields = ['target', 'targetArray', 'colMap', 'renameVariable']
      const values = await redis.hmget("project:" + projectId, fields)
      const obj = fields.reduce((start, k, index) => {
        let value = values[index]
        try {
          value = JSON.parse(value)
        } catch (e) { }
        start[k] = value
        return start
      }, {})
      const { target, targetArray, colMap, renameVariable } = obj
      if (!target) return newFeatureLabel
      const arr = !targetArray.length ? Object.keys((colMap || {})[target]) : targetArray
      if (!arr.length) return newFeatureLabel
      arr.slice(0, 2).forEach((k, index) => {
        const rename = (renameVariable || {})[k]
        if (!!rename) newFeatureLabel[rename] = index
      })
      return newFeatureLabel
    } catch (e) {
      return {}
    }
  }
}

module.exports = api
