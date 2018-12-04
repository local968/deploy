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
    dataViews: null,
    rawDataViews: null
  }
  return createOrUpdate(id, userId, data)
}

function query(key, params) {
  const Field = ["id", "name", "createTime", "curStep", "host", "uploadFileName"]
  const pipeline = redis.pipeline();
  pipeline.zcard(key)
  pipeline.zrevrangebyscore(key, params)
  return pipeline.exec()
    .then(([countResult, dataResult]) => {
      if (countResult[0] || dataResult[0]) return { count: 0, list: [] }
      const count = countResult[1]
      const data = dataResult[1]
      const result = { count, list: [] }
      if(!Array.isArray(data)||!data.length){
        return result
      }

      const promiseArray = data.map(r => {
        return redis.hmget(`project:${r}`, Field)
      })
      return Promise.all(promiseArray).then(array => {
        return Promise.all(array.map(item => {
          const obj = {}
          item.forEach((v, k) => {
            try {
              v = JSON.parse(v)
            } catch (e) { }
            obj[Field[k]] = v
          })
          if (obj.uploadFileName) {
            return getFileInfo(obj.uploadFileName).then(files => {
              obj.fileNames = files.fileNames
              return obj
            })
          }
          return Promise.resolve(obj)
        })).then(list => {
          result.list = list
          return result
        })
      })
    })
}

function createOrUpdate(id, userId, data, isCreate = false) {
  const params = mapObjectToArray(data)
  const time = moment().unix();
  params.push("updateTime", time)
  if (isCreate) params.push("createTime", time)
  const pipeline = redis.pipeline();
  pipeline.hmset(`project:${id}`,params)
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

function addSettingModel(userId, projectId) {
  return function (result) {
    const {name:modelName} = result.model
    redis.hmget(`project:${projectId}`, 'settingId', 'settings')
    .then(([settingId, settings]) => {
      if (settingId && settings) {
        settingId = JSON.parse(settingId)
        settings = JSON.parse(settings)
        settings.find(s => s.id === settingId).models.push(modelName)
        createOrUpdate(projectId, userId, { settings })
      }
    }, console.error)
    return result
  }
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
  return redis.hmset(`project:${id}:model:${mid}`, mapObjectToArray(params)).then(() => {
    return { status: 200, message: "ok", model: { ...params, id: mid }, id }
  })
}

function moveModels(id) {
  return redis.smembers(`project:${id}:models`).then(ids => {
    const pipeline = redis.pipeline();
    ids.forEach(mid => {
      pipeline.sadd(`project:${id}:models:previous`, mid)
    })
    pipeline.del(`project:${id}:models`)
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
  selPipeline.smembers(`project:${id}:models`)
  selPipeline.smembers(`project:${id}:models:previous`)

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
  return redis.hgetall(`project:${id}`).then(result => {
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
    const fileNames = []
    for (let n = 0; n < list.length; n++) {
      let file = list[n][1]
      if (!file) continue;
      try {
        file = JSON.parse(file)
      } catch (e) { }
      if (!file.path || !file.name) continue
      fileNames.push(file.name)
      csvLocation.push(file.path)
      const fileext = file.name.split(".").pop()
      ext.push("." + fileext)
    }
    if (!csvLocation.length) return { status: 416, message: "file not exist" }
    return {
      status: 200,
      message: "ok",
      csvLocation,
      ext,
      fileNames
    }
  })
}

function updateProjectField(id, userId, field, data) {
  const key = "project:" + id
  return redis.hget(key, field).then(result => {
    try {
      result = JSON.parse(result)
    } catch (e) { }
    if (Array.isArray(result)) {
      data = [...result, ...data]
    } else if (typeof result === 'object') {
      data = Object.assign({}, result, data)
    }
    return redis.hset(key, field, JSON.stringify(data)).then(() => {
      const returnValue = {
        status: 200,
        message: "ok",
        id,
        result: { [field]: data }
      }
      wss.publish("user:" + userId + ":projects", returnValue)
      return returnValue
    })
  })
}

wss.register("addProject", async (message, socket) => {
  const {userId,user} = socket.session
  const {createdTime} = user
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
  const {userId} = socket.session
  const data = Object.assign({}, message);
  const { id } = data
  // delete data.id
  Reflect.deleteProperty(data,'id')
  // delete data._id
  Reflect.deleteProperty(data,'_id')
  // delete data.type
  Reflect.deleteProperty(data,'type')
  // data.userId = userId
  Reflect.deleteProperty(data,'userId')


  return checkProject(userId, id).then(err => {
    if (err) return err
    return createOrUpdate(id, userId, data)
  })
})

wss.register("deleteProjects", (message, socket) => {
  const {userId} = socket.session
  const {ids} = message
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
  const {userId} = socket.session
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
  const {userId} = socket.session
  const {id} = message
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
  const {id} = message
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
  const {userId} = socket.session
  const { firstEtl, noCompute, projectId: id,csvLocation:files} = message

  return setDefaultData(id, userId).then(setResult => {
    if (setResult.status !== 200) return setResult
    return getFileInfo(files).then((fileInfo) => {
      if (fileInfo.status !== 200) return fileInfo
      const { csvLocation, ext } = fileInfo
      const data = { ...message, userId, requestId: message._id, csvLocation, ext, noCompute: firstEtl || noCompute }
      // delete data.firstEtl
      Reflect.deleteProperty(data,'firstEtl')
      if (!csvLocation) Reflect.deleteProperty(data,'csvLocation')
      if (!ext) Reflect.deleteProperty(data,'ext')
      return command(data, processData => {
        let { result, status } = processData;
        if (status < 0 || status === 100) return processData
        const { name, path, key, origin_header } = result
        if (name === "progress" && key === 'etl') {
          return progress(processData)
        }
        if (name === "csvHeader") createOrUpdate(id, userId, { originPath: path, rawHeader: origin_header, dataHeader: origin_header })
        if (name === "cleanCsvHeader") createOrUpdate(id, userId, { cleanPath: path })
        return null
      }).then(returnValue => {
        let { result, status,message} = returnValue;
        if (status < 0) return {
          status: 418,
          result,
          message,
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
        result.firstEtl = false;
        if (!files) delete result.totalRawLines
        // 最终ETL 小于1W行  使用cross
        if (result.totalLines > 0 && result.totalLines < 10000) result.runWith = 'cross'

        const steps = {}
        if (firstEtl) {
          steps.subStepActive = 2
          steps.lastSubStep = 2
        } else {
          if (noCompute) {
            steps.curStep = 3
            steps.mainStep = 3
            steps.subStepActive = 1
            steps.lastSubStep = 1
          } else {
            steps.subStepActive = 3
            steps.lastSubStep = 3
          }
        }

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

wss.register('dataView', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
.then(returnValue => {
  const key = message.actionType === 'clean' ? 'dataViews' : 'rawDataViews'
  const { status, result } = returnValue
  if (status === 100) {
    createOrUpdate(message.projectId, socket.session.userId, { [key]: result.data })
  }
  return returnValue
}))

wss.register('correlationMatrix', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
.then(returnValue => {
  const { status, result } = returnValue
  if (status === 100) {
    createOrUpdate(message.projectId, socket.session.userId, { correlationMatrixImg: result.imageSavePath })
  }
  return returnValue
}))

wss.register('preTrainImportance', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
.then(returnValue => {
  const { status, result } = returnValue
  const promise = []
  if (status === 100) {
    result.informativesLabel = result.informativesLabel || []
    result.preImportance = result.data
    promise.push(updateProjectField(message.projectId, socket.session.userId, 'preImportance', result.data))
    promise.push(updateProjectField(message.projectId, socket.session.userId, 'informativesLabel', result.informativesLabel))
  }
  return Promise.all(promise).then(([result1, result2]) => {
    const realResult = Object.assign({}, result, (result1 || {}).result, (result2 || {}).result)
    return Object.assign({}, returnValue, { result: realResult })
  })
}))

wss.register('histgramPlot', (message, socket, progress) => {
  const {projectId:id,_id:requestId} = message
  const {userId} = socket.session
  const histgramPlots = {}
  return command({ ...message, userId, requestId}, progressResult => {
    if (progressResult.status < 0 || progressResult.status === 100) {
      updateProjectField(id, userId, "histgramPlots", histgramPlots)
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
  const {projectId:id,_id:requestId} = message
  const {userId} = socket.session
  const univariatePlots = {}
  return command({ ...message, userId, requestId}, progressResult => {
    if (progressResult.status < 0 || progressResult.status === 100) {
      updateProjectField(id, userId, "univariatePlots", univariatePlots)
      return progressResult
    }
    const { result } = progressResult
    const { field, imageSavePath, progress: status } = result;
    if (status && status === "start") return
    univariatePlots[field] = imageSavePath
    return progress(progressResult)
  })
})

const _sendToCommand = (message, socket, progress)=>sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)

wss.register('chartData', _sendToCommand)
wss.register('fitPlotAndResidualPlot', _sendToCommand)
wss.register('pointToShow', _sendToCommand)
wss.register('createNewVariable', _sendToCommand)

wss.register('abortTrain', (message, socket) => {
  const {projectId,isLoading,_id:requestId} = message
  const {userId} = socket.session
  return command({ ...message, userId, requestId}).then(() => {
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
  const {userId,user} = socket.session
  const {projectId,data:updateData,_id:requestId} = message
  // delete message.data
  Reflect.deleteProperty(message,'data')
  const data = { ...message, userId, requestId}
  let hasModel = false
  return checkTraningRestriction(user)
    // .then(() => moveModels(message.projectId))
    .then(() => createOrUpdate(projectId, userId, updateData))
    .then(() => command(data, queueValue => {
      const { status, result } = queueValue
      if (status < 0 || status === 100) return queueValue
      if (result.name === "progress") {
        const {requestId:trainId} = result
        // delete result.requestId
        Reflect.deleteProperty(result,'requestId')
        return createOrUpdate(projectId, userId, { trainModel: result }).then(() => progress({ ...result, trainId }))
      }
      hasModel = true
      return createOrUpdate(projectId, userId, { trainModel: null })
        .then(() => createModel(projectId, result).then(addSettingModel(userId, projectId)).then(model => {
          wss.publish(`user:${userId}:projects`, model)
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
        if (!hasModel) statusData.train2Error = true
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
  const {userId} = socket.session
  const key = `user:${userId}:projects`
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
  return updateProjectField("1", socket.session.userId, "colType", {})
})

wss.register("inProject", (message, socket) => {
  const {userId} = socket.session
  const {id,broadcastId} = message
  wss.clients.forEach(client => {
    if (client === socket) return
    if (client.session && client.session.userId === userId) client.send(JSON.stringify({ id, broadcastId, type: "inProject" }))
  })
})


wss.register("updateModel", (message, socket) => {
  const {projectId} = message
  const {data,id:mid} = message
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

wss.register('getFiles', (message, socket) => {
  return getFileInfo(message.files)
})
