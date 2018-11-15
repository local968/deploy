const { redis } = require('redis')
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')
const command = require('../command')

const { userProjectRestriction, userConcurrentRestriction } = require('restriction')

function setDefaultData(id, userId) {
  const data = {
    correlationMatrixImg: '',
    univariatePlots: {},
    histgramPlots: {},
    preImportance: null,
    dataViews: null
  }
  return createOrUpdate(id, userId, data)
}

function query(key, params) {
  const Field = ["id", "name", "createTime", "curStep", "host"]
  const pipeline = redis.pipeline();
  pipeline.zcard(key)
  pipeline.zrevrangebyscore(key, params)
  return pipeline.exec()
    .then(([countResult, dataResult]) => {
      if (countResult[0] || dataResult[0]) return { count: 0, list: [] }
      const count = countResult[1]
      const data = dataResult[1]
      const result = { count, list: [] }
      if (!Array.isArray(data)) return result
      if (data.length === 0) return result

      const promiseArray = data.map(r => {
        return redis.hmget("project:" + r, Field)
      })
      return Promise.all(promiseArray).then(array => {
        result.list = array.map(item => {
          const obj = {}
          item.forEach((v, k) => {
            try {
              v = JSON.parse(v)
            } catch (e) { }
            obj[Field[k]] = v
          })
          return obj
        })
        return result
      })
    })
}

function createOrUpdate(id, userId, data, isCreate = false) {
  const params = mapObjectToArray(data)
  const time = moment().unix();
  params.push("updateTime", time)
  if (isCreate) params.push("createTime", time)
  const pipeline = redis.pipeline();
  pipeline.hmset("project:" + id, params)
  pipeline.zadd(`user:${userId}:projects:updateTime`, time, id)
  if (isCreate) pipeline.zadd(`user:${userId}:projects:createTime`, time, id)
  return pipeline.exec()
    .then(result => {
      const err = result.find(([error]) => !!error);
      const returnValue = err ? { status: 411, message: (isCreate ? "create" : "update") + " project error" } : { status: 200, message: "ok", result: data, id }
      wss.publish("user:" + userId + ":projects", returnValue)
      return returnValue
    })
}

function createModel(id, params) {
  const modelId = uuid.v4()
  const pipeline = redis.pipeline();
  pipeline.hmset("project:" + id + ":model:" + modelId, mapObjectToArray({ ...params, id: modelId }))
  pipeline.sadd("project:" + id + ":models", modelId)
  return pipeline.exec().then(result => {
    const err = result.find(([error]) => !!error);
    const data = err ? { status: 412, message: "create model error" } : { status: 200, message: "ok" }
    return { ...data, model: { ...params, id: modelId }, id }
  })
}

function updateModel(id, mid, params) {
  return redis.hmset("project:" + id + ":model:" + mid, mapObjectToArray(params)).then(() => {
    return { status: 200, message: "ok", model: { ...params, id: mid }, id }
  })
}

function moveModels(id) {
  return redis.smembers("project:" + id + ":models").then(ids => {
    const pipeline = redis.pipeline();
    ids.forEach(mid => {
      pipeline.sadd("project:" + id + ":models:previous", mid)
    })
    pipeline.del("project:" + id + ":models")
    return pipeline.exec().then(list => {
      const error = list.find(i => !!i[0])
      if (error) return { status: 414, message: "delete models error", error }
      return {
        status: 200,
        message: 'ok'
      }
    })
  })
}

function deleteModels(id) {
  const selPipeline = redis.pipeline();
  selPipeline.smembers("project:" + id + ":models")
  selPipeline.smembers("project:" + id + ":models:previous")

  return selPipeline.exec().then(([[nowError, nowIds], [oldError, oldIds]]) => {
    if (nowError || oldError) return { status: 414, message: "delete models error", error: nowError || oldError }
    const pipeline = redis.pipeline();
    [...nowIds, ...oldIds].forEach(mid => {
      pipeline.del("project:" + id + ":model:" + mid)
    })
    pipeline.del("project:" + id + ":models")
    pipeline.del("project:" + id + ":models:previous")
    return pipeline.exec().then(list => {
      const error = list.find(i => !!i[0])
      if (error) return { status: 414, message: "delete models error", error }
      return {
        status: 200,
        message: 'ok'
      }
    })
  })
}

function deleteProject(userId, id) {
  return checkProject(userId, id).then(err => {
    if (err) return err
    const pipeline = redis.pipeline();
    pipeline.del("project:" + id)
    pipeline.zrem(`user:${userId}:projects:updateTime`, id)
    pipeline.zrem(`user:${userId}:projects:createTime`, id)
    return pipeline.exec().then(list => {
      const error = list.find(i => !!i[0])
      if (error) return { status: 415, message: "delete project error", error }
      return deleteModels(id)
    })
  })
}

function checkProject(userId, id) {
  return redis.hgetall("project:" + id).then(result => {
    for (let key in result) {
      try {
        result[key] = JSON.parse(result[key])
      } catch (e) { }
    }
    if (result.userId !== userId) return { status: 421, message: "project error" }
    return null
  })
}

const checkTraningRestriction = (user) => {
  return new Promise((resolve, reject) => {
    let level
    try {
      level = parseInt(user.level, 10)
    } catch (e) {
      return reject({ message: "modeling error", status: -2 })
    }
    const duration = moment.duration(moment().unix() - user.createdTime)
    const restrictQuery = `user:${user.id}:duration:${duration.years()}-${duration.months()}:training`
    return redis.get(restrictQuery).then(count => {
      if (count >= userProjectRestriction[level]) return reject({
        status: -4,
        message: 'Your usage of number of training has reached the max restricted by your current lisense.',
        error: 'project number exceed'
      })
      redis.incr(restrictQuery)
      resolve()
    })
  })
}

function sendToCommand(data, progress) {
  return command(data, (result) => {
    return (result.status < 0 || result.status === 100) ? result : progress(result)
  })
}

function getFileInfo(files) {
  if (!files) return Promise.resolve({
    status: 200,
    message: "ok",
    csvLocation: null,
    ext: null
  })
  const pipeline = redis.pipeline();
  files.forEach(f => {
    pipeline.get("file:" + f)
  })
  return pipeline.exec().then(list => {
    const error = list.find(i => !!i[0])
    if (error) return error
    const csvLocation = []
    const ext = []
    for (let n = 0; n < list.length; n++) {
      let file = list[n][1]
      if (!file) continue;
      try {
        file = JSON.parse(file)
      } catch (e) { }
      if (!file.path || !file.name) continue
      csvLocation.push(file.path)
      const fileext = file.name.split(".").pop()
      ext.push("." + fileext)
    }
    if (!csvLocation.length) return { status: 416, message: "file not exist" }
    return {
      status: 200,
      message: "ok",
      csvLocation,
      ext
    }
  })
}

wss.register("addProject", async (message, socket) => {
  const userId = socket.session.userId;
  const createdTime = socket.session.user.createdTime
  const duration = moment.duration(moment().unix() - createdTime)
  const startTime = moment.unix(createdTime).add({ years: duration.years(), months: duration.months() })
  const endTime = moment.unix(createdTime).add({ years: duration.years(), months: duration.months() + 1 })
  const projects = await redis.zrevrangebyscore(`user:${userId}:projects:createTime`, endTime.unix(), startTime.unix())
  if (projects.length >= userConcurrentRestriction[socket.session.user.level]) throw {
    status: 408,
    message: 'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
    error: 'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
  }
  const id = await redis.incr("node:project:count")
  const { result } = await command({ command: "create", projectId: id.toString(), userId, requestId: message._id })
  return createOrUpdate(id, userId, { id, userId, host: result.host }, true)
})

wss.register("updateProject", (message, socket) => {
  const userId = socket.session.userId;
  const data = Object.assign({}, message);
  const { id } = data
  delete data.id
  delete data._id
  delete data.type
  data.userId = userId

  return checkProject(userId, id).then(err => {
    if (err) return err
    return createOrUpdate(id, userId, data)
  })
})

wss.register("deleteProjects", (message, socket) => {
  const userId = socket.session.userId;
  const ids = message.ids;
  const array = []
  ids.map(id => {
    array.push(deleteProject(userId, id))
  })
  return Promise.all(array).then(list => {
    const error = list.find(i => !!i.status !== 200)
    if (error) return error
    return {
      status: 200,
      message: 'ok'
    }
  })
})

wss.register("queryProjectList", (message, socket) => {
  const userId = socket.session.userId;
  const { limit, offset, sort } = message;

  const key = `user:${userId}:projects:${sort === 'createTime' ? 'createTime' : 'updateTime'}`;

  const params = ["+inf", "-inf"]

  if (limit) params.push('limit', offset, limit)

  return query(key, params).then(result => {
    return {
      status: 200,
      message: 'ok',
      ...result
    }
  })
})

wss.register("queryProject", (message, socket) => {
  const userId = socket.session.userId;
  const id = message.id;
  const key = `project:${id}`;

  return redis.hgetall(key).then(result => {
    for (let key in result) {
      try {
        result[key] = JSON.parse(result[key])
      } catch (e) { }
    }
    if (result.userId !== userId) return { status: 420, message: 'error' }
    return {
      status: 200,
      message: 'ok',
      data: result
    }
  })
})

wss.register("queryModelList", message => {
  const id = message.id;
  const key = `project:${id}:models`;

  return redis.smembers(key).then(ids => {
    const pipeline = redis.pipeline();
    ids.forEach(modelId => {
      pipeline.hgetall("project:" + id + ":model:" + modelId)
    })
    return pipeline.exec().then(list => {
      const error = list.find(i => !!i[0])
      if (error) return { status: 413, message: "query models error", error }
      const result = list.map(item => {
        let data = item[1]
        for (let key in data) {
          try {
            data[key] = JSON.parse(data[key])
          } catch (e) { }
        }
        return data
      })
      return {
        status: 200,
        message: 'ok',
        list: result
      }
    })
  })
})

wss.register('etl', (message, socket, progress) => {
  const files = message.csvLocation
  const userId = socket.session.userId
  const { firstEtl, noCompute, projectId: id } = message

  return setDefaultData(id, userId).then(setResult => {
    if (setResult.status !== 200) return setResult
    return getFileInfo(files).then((fileInfo) => {
      if (fileInfo.status !== 200) return fileInfo
      const { csvLocation, ext } = fileInfo
      const data = { ...message, userId: userId, requestId: message._id, csvLocation, ext, noCompute: firstEtl || noCompute }
      delete data.firstEtl
      if (!csvLocation) delete data.csvLocation
      if (!ext) delete data.ext
      return sendToCommand(data, progress).then(returnValue => {
        let { result, status } = returnValue;
        if (status < 0) return {
          status: 418,
          message: result['process error']
        }
        Object.keys(result).forEach(k => {
          if (k === "name") {
            delete result[k];
          }
          if (k.includes("FillMethod")) {
            Object.keys(result[k]).forEach(key => {
              if (result[k][key] === "ignore") delete result[k][key]
            })
          }
        })
        result.dataViews = null;
        result.firstEtl = false;
        if (!files) delete result.totalRawLines
        // 最终ETL 小于1W行  使用cross
        if (result.totalLines < 10000) result.runWith = 'cross'

        const steps = {}
        // if (firstEtl) {
        //   steps.subStepActive = 2
        //   steps.lastSubStep = 2
        // } else {
        //   if (noCompute) {
        //     steps.curStep = 3
        //     steps.mainStep = 3
        //     steps.subStepActive = 1
        //     steps.lastSubStep = 1
        //   } else {
        //     steps.subStepActive = 3
        //     steps.lastSubStep = 3
        //   }
        // }

        return createOrUpdate(id, userId, { ...result, ...steps }).then(updateResult => {
          if (updateResult.status !== 200) return updateResult
          return {
            status: 200,
            message: 'ok',
            result: result
          }
        })
      })
    })
  })
})

wss.register('dataView', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress).then(returnValue => {
  const { status, result } = returnValue
  if (status === 100) {
    createOrUpdate(message.projectId, socket.session.userId, { dataViews: result.data })
  }
  return returnValue
}))

wss.register('correlationMatrix', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress).then(returnValue => {
  const { status, result } = returnValue
  if (status === 100) {
    createOrUpdate(message.projectId, socket.session.userId, { correlationMatrixImg: result.imageSavePath })
  }
  return returnValue
}))

wss.register('preTrainImportance', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress).then(returnValue => {
  const { status, result } = returnValue
  if (status === 100) {
    result.informativesLabel = result.informativesLabel || []
    createOrUpdate(message.projectId, socket.session.userId, { preImportance: result.data, informativesLabel: result.informativesLabel || [] })
  }
  return returnValue
}))

wss.register('histgramPlot', (message, socket, progress) => {
  const id = message.projectId
  const userId = socket.session.userId
  const histgramPlots = {}
  command({ ...message, userId, requestId: message._id }, progressResult => {
    if (progressResult.status < 0 || progressResult.status === 100) {
      createOrUpdate(id, userId, { histgramPlots })
      return progressResult
    }
    const { result } = progressResult
    const { field, imageSavePath, progress: status } = result;
    if (status && status === "start") return
    histgramPlots[field] = imageSavePath
    return progress(progressResult)
  })
})

wss.register('univariatePlot', (message, socket, progress) => {
  const id = message.projectId
  const userId = socket.session.userId
  const univariatePlots = {}
  command({ ...message, userId, requestId: message._id }, progressResult => {
    if (progressResult.status < 0 || progressResult.status === 100) {
      createOrUpdate(id, userId, { univariatePlots })
      return progressResult
    }
    const { result } = progressResult
    const { field, imageSavePath, progress: status } = result;
    if (status && status === "start") return
    univariatePlots[field] = imageSavePath
    return progress(progressResult)
  })
})

wss.register('chartData', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('fitPlotAndResidualPlot', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('createNewVariable', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('abortTrain', (message, socket) => {
  const projectId = message.projectId
  const userId = socket.session.userId
  const isLoading = message.isLoading
  return command({ ...message, userId, requestId: message._id }).then(() => {
    const statusData = {
      train2Finished: true,
      train2ing: false,
      train2Error: false,
      trainModel: null
    }
    if (isLoading) {
      statusData.mainStep = 3,
        statusData.curStep = 3,
        statusData.lastSubStep = 1,
        statusData.subStepActive = 1
    }
    return createOrUpdate(projectId, userId, statusData)
  })
})

wss.register('train', (message, socket, progress) => {
  const userId = socket.session.userId
  const projectId = message.projectId
  const updateData = message.data
  delete message.data
  const data = { ...message, userId, requestId: message._id }
  let num = 0
  return checkTraningRestriction(socket.session.user)
    .then(() => moveModels(message.projectId))
    .then(() => createOrUpdate(projectId, userId, updateData))
    .then(() => command(data, queueValue => {
      const { status, result } = queueValue
      if (status === 100) return queueValue
      if (status < 0) return null
      if (result.name === "progress") {
        const trainId = result.requestId
        delete result.requestId
        return createOrUpdate(projectId, userId, { trainModel: result }).then(() => progress({ ...result, trainId }))
      }
      return createOrUpdate(projectId, userId, { trainModel: null })
        .then(() => createModel(projectId, result).then(model => {
          num++
          wss.publish("user:" + userId + ":projects", model)
          return progress(model)
        }))
    })
      .then(() => {
        const statusData = {
          train2Finished: true,
          train2ing: false,
          train2Error: false,
          selectId: ''
        }
        if (num === 0) statusData.train2Error = true
        return createOrUpdate(projectId, userId, statusData)
      }))
    .catch(err => {
      const statusData = {
        train2Finished: false,
        train2ing: false,
        train2Error: false,
        selectId: '',
        mainStep: 3,
        curStep: 3,
        lastSubStep: 1,
        subStepActive: 1
      }
      createOrUpdate(projectId, userId, statusData)
      return err
    })
})

wss.register("watchProjectList", (message, socket) => {
  const userId = socket.session.userId;
  const key = "user:" + userId + ":projects"
  wss.subscribe(key, (data) => {
    try {
      data = JSON.parse(data)
    } catch (e) { }
    return data
  }, socket)

  return {
    status: 200,
    message: "ok",
    id: key
  }
})

wss.register("testPub", (message, socket) => {
  return Promise.reject({ status: 1, test: "aaa" }).catch(err => err)
})

wss.register("inProject", (message, socket) => {
  const userId = socket.session.userId
  const id = message.id
  const broadcastId = message.broadcastId
  wss.clients.forEach(client => {
    if (client === socket) return
    if (client.session && client.session.userId === userId) client.send(JSON.stringify({ id, broadcastId, type: "inProject" }))
  })
})


wss.register("updateModel", (message, socket) => {
  const projectId = message.projectId
  const mid = message.id
  const data = message.data
  return updateModel(projectId, mid, data)
})

function mapObjectToArray(obj) {
  const arr = [];
  Object.entries(obj).forEach(([k, v]) => {
    if (!k || v === null || v === undefined) return;
    if (typeof k !== 'string') return
    if (typeof v === 'function') return
    arr.push(k, JSON.stringify(v))
  })
  return arr
}
