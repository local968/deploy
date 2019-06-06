const { redis } = require('redis')
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')
const axios = require('axios')
const command = require('../command')
const _ = require('lodash');
const config = require('config')
const qs = require('querystring')
// const mq = require('../amqp')

const { userProjectRestriction, userConcurrentRestriction } = require('restriction')

async function parseNewChartData(url) {
  try {
    const result = await axios.get(url)
    const data = result.data

    let fitIndex = -1;
    let initialFitIndex = -1;
    if (data.roc) {
      const { Youden } = data.roc
      if (Youden) {
        let max = -Infinity;
        initialFitIndex = 0;
        for (let i = 1; i < Object.keys(Youden).length; i++) {
          if (Youden[i] > max) {
            initialFitIndex = i;
            max = Youden[i];
          }
        }
        fitIndex = initialFitIndex
      }
    }

    return { chartData: data, fitIndex, initialFitIndex }
  } catch (e) {
    console.log(e, "error")
    return { chartData: url }
  }
}

function parseChartData(result) {
  if (!result) return { chart: null, fitIndex: null, initialFitIndex: null };
  let fitIndex = -1;
  let initialFitIndex = -1;
  const charts = ['density', 'lift', 'roc', 'rocHoldout'];
  charts.forEach(chart => {
    try {
      result[chart] = JSON.parse(result[chart])
    } catch (e) {
      result[chart] = null
    }
  });
  if (result.roc) {
    const { Youden } = result.roc
    if (Youden) {
      let max = -Infinity;
      initialFitIndex = 0;
      for (let i = 1; i < Object.keys(Youden).length; i++) {
        if (Youden[i] > max) {
          initialFitIndex = i;
          max = Youden[i];
        }
      }
      fitIndex = initialFitIndex
    }
  }
  return { chartData: result, fitIndex, initialFitIndex };
}

function setDefaultData(id, userId) {
  const data = {
    correlationMatrixHeader: null,
    correlationMatrixData: null,
    univariatePlots: {},
    histgramPlots: {},
    preImportance: null,
    dataViews: null,
    informativesLabel: [],
    settings: [],
    settingId: ''
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
      if (!Array.isArray(data) || !data.length) {
        return result
      }

      const promiseArray = data.map(r => {
        return redis.hgetall("project:" + r)
        // return redis.hmget("project:" + r, Field)
      })
      return Promise.all(promiseArray).then(array => {
        return Promise.all(array.map(item => {
          Object.keys(item).forEach(key => {
            try {
              item[key] = JSON.parse(item[key])
            } catch (e) {
            }
          })
          if (item.uploadFileName) {
            return getFileInfo(item.uploadFileName).then(files => {
              item.fileNames = files.fileNames
              return item
            })
          }
          return Promise.resolve(item)
          // for (let key in item) {
          //   try {
          //     result[key] = JSON.parse(result[key])
          //   } catch (e) { }
          //   if (result.uploadFileName) {
          //     return getFileInfo(obj.uploadFileName).then(files => {
          //       obj.fileNames = files.fileNames
          //       return obj
          //     })
          //   }
          // }
          // const obj = {}
          // item.forEach((v, k) => {
          //   try {
          //     v = JSON.parse(v)
          //   } catch (e) { }
          //   obj[Field[k]] = v
          // })
          // if (obj.uploadFileName) {
          //   return getFileInfo(obj.uploadFileName).then(files => {
          //     obj.fileNames = files.fileNames
          //     return obj
          //   })
          // }
          // return Promise.resolve(obj)
        })).then(list => {
          result.list = list
          return result
        })
      })
    })
}

function createOrUpdate(id, userId, data, isCreate = false) {
  const promise = isCreate ? Promise.resolve({ status: 200, message: 'ok' }) : checkProject(userId, id)
  return promise.then(checked => {
    if (checked.status !== 200) return checked
    const time = moment().unix();
    data.updateTime = time
    if (isCreate) data.createTime = time
    const params = mapObjectToArray(data)
    const pipeline = redis.pipeline();
    pipeline.hmset(`project:${id}`, params)
    pipeline.zadd(`user:${userId}:projects:updateTime`, time, id)
    if (isCreate) pipeline.zadd(`user:${userId}:projects:createTime`, time, id)
    return pipeline.exec()
      .then(result => {
        const err = result.find(([error]) => !!error);
        const returnValue = err ? {
          status: 411,
          message: (isCreate ? "create" : "update") + " project error"
        } : { status: 200, message: "ok", result: data, id }
        wss.publish(`user:${userId}:projects`, returnValue)
        return returnValue
      })
  })

}

function addSettingModel(userId, projectId) {
  return function (result) {
    const { modelName } = result.model
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

function createModel(userId, id, modelId, params) {
  const mid = uuid.v4()
  const pipeline = redis.pipeline();
  const saveData = { ...params, id: modelId, mid, createTime: moment().unix() }
  pipeline.hmset(`project:${id}:model:${modelId}`, mapObjectToArray(saveData))
  pipeline.sadd(`project:${id}:models`, modelId)
  return pipeline.exec().then(list => {
    const err = list.find(([error]) => !!error);
    const data = err ? { status: 412, message: "create model error" } : { status: 200, message: "ok" }
    const result = { ...data, model: saveData, id }
    wss.publish(`user:${userId}:projects`, result)
    return result
  })
}

function updateModel(userId, id, mid, params) {
  return redis.hmset(`project:${id}:model:${mid}`, mapObjectToArray(params)).then(() => {
    const result = { status: 200, message: "ok", modelResult: { ...params, id: mid }, id }
    wss.publish(`user:${userId}:projects`, result)
    return result
  })
}

function getModelCount(id) {
  return redis.scard(`project:${id}:models`)
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
      pipeline.del(`project:${id}:model:${mid}`)
    })
    pipeline.del(`project:${id}:models`)
    pipeline.del(`project:${id}:models:previous`)
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
    if (err.status !== 200) return err
    const pipeline = redis.pipeline();
    pipeline.del(`project:${id}`)
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
      } catch (e) {
      }
    }
    if (result.userId !== userId) {
      console.error(`user:${userId}, project:${id} ${!result.userId ? 'delete' : 'error'}`)
      return { status: 421, message: "project error" }
      // return {}
    }
    return { status: 200, message: 'ok', data: result }
  })
}

const checkTraningRestriction = (user) => {
  return new Promise((resolve, reject) => {
    // let level
    // try {
    //   level = parseInt(user.level, 10)
    // } catch (e) {
    //   return reject({ message: "modeling error", status: -2 })
    // }
    const duration = moment.duration(moment().unix() - user.createdTime)
    const restrictQuery = `user:${user.id}:duration:${duration.years()}-${duration.months()}:training`
    return redis.get(restrictQuery).then(count => {
      if (count >= userProjectRestriction[user.level]) return reject({
        status: -4,
        message: 'Your usage of "Number of Training" has reached the max restricted by your current license.',
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
  }, null)
}

function getFileInfo(files) {
  if (!files) return Promise.resolve({
    status: 200,
    message: "ok",
    csvLocation: null,
    ext: null
  })
  const pipeline = redis.pipeline();
  files.forEach(f => pipeline.get(`file:${f}`))
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
      } catch (e) {
      }
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
    } catch (e) {
    }
    if (Array.isArray(data) || Array.isArray(result)) {
      data = [...new Set([...(result || []), ...(data || [])])]
    } else if (typeof data === 'object' || typeof result === 'object') {
      data = Object.assign({}, (result || {}), (data || {}))
    }
    return redis.hset(key, field, JSON.stringify(data)).then(() => {
      const returnValue = {
        status: 200,
        message: "ok",
        id,
        result: { [field]: data }
      }
      wss.publish(`user:${userId}:projects`, returnValue)
      return returnValue
    })
  })
}

function getProjectField(id, field) {
  const key = "project:" + id
  return redis.hget(key, field).then(result => {
    try {
      result = JSON.parse(result)
    } catch (e) {
    }
    return result
  })
}

function getProjectFields(id, fields) {
  const key = "project:" + id
  return redis.hmget(key, fields).then(result => {
    const res = _.chain(fields).map((value, index) => {
      return [value, JSON.parse(result[index])]
    }).fromPairs().value()
    return res
  })
}

async function getBaseEtl(id) {
  const data = await getProjectFields(id, ['etlIndex', 'target', 'problemType', 'dataHeader', 'colType', 'stats']);
  const { etlIndex, target, problemType, dataHeader, colType, stats } = data;
  const colMap = Object.entries(stats).filter(([key, metric]) => metric.type === 'Categorical').reduce((prev, [key, metric]) => {
    prev[key] = metric.categoricalMap.reduce((p, r, index) => {
      p[r.key] = index
      return p
    }, {})
    return prev
  }, {})
  return {
    command: 'top.etlBase',
    csvLocation: [etlIndex],
    targetLabel: [target],
    problemType,
    featureLabel: dataHeader,
    colType,
    colMap,
  }
}

async function checkEtl(projectId, userId) {

  const hasSendEtl = await getProjectField(projectId, 'hasSendEtl');

  if (!hasSendEtl) {

    const etl = await getBaseEtl(projectId);

    await command({
      ...etl,
      ...{
        projectId,
        userId,
        requestId: uuid.v4()
      }
    }).then(() => {
      return createOrUpdate(projectId, userId, { hasSendEtl: true })
    })
  }
}

wss.register("addProject", async (message, socket) => {
  // const { userId, user } = socket.session
  // const { createdTime } = user
  // const duration = moment.duration(moment().unix() - createdTime)
  // const startTime = moment.unix(createdTime).add({ years: duration.years(), months: duration.months() })
  // const endTime = moment.unix(createdTime).add({ years: duration.years(), months: duration.months() + 1 })
  // const projects = await redis.zrevrangebyscore(`user:${userId}:projects:createTime`, endTime.unix(), startTime.unix())
  const { userId } = socket.session
  const counts = await redis.zcard(`user:${userId}:projects:createTime`)
  if (counts >= userConcurrentRestriction[socket.session.user.level]) return {
    status: 408,
    message: 'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
    error: 'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
  }
  const id = await redis.incr("node:project:count")
  // const { result } = await command({ command: "create", projectId: id.toString(), userId, requestId: message._id }, null, true)
  return createOrUpdate(id, userId, { id, userId }, true)
})

wss.register("updateProject", (message, socket) => {
  const { userId } = socket.session
  const data = Object.assign({}, message);
  const { id } = data
  // delete data.id
  Reflect.deleteProperty(data, 'id')
  // delete data._id
  Reflect.deleteProperty(data, '_id')
  // delete data.type
  Reflect.deleteProperty(data, 'type')
  // data.userId = userId
  Reflect.deleteProperty(data, 'userId')


  return checkProject(userId, id).then(err => {
    if (err.status !== 200) return err
    return createOrUpdate(id, userId, data)
  })
})

wss.register("deleteProjects", (message, socket) => {
  const { userId } = socket.session
  const { ids } = message
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
  const { userId } = socket.session
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
  const { userId } = socket.session
  const { id } = message
  const key = `project:${id}`;

  return redis.hgetall(key).then(result => {
    for (let key in result) {
      try {
        result[key] = JSON.parse(result[key])
      } catch (e) {
      }
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
  const { id } = message
  const key = `project:${id}:models`;

  return redis.smembers(key).then(ids => {
    const pipeline = redis.pipeline();
    ids.forEach(modelId => {
      pipeline.hgetall(`project:${id}:model:${modelId}`)
    })
    return pipeline.exec().then(list => {
      const error = list.find(i => !!i[0])
      if (error) return { status: 413, message: "query models error", error }
      const result = list.map(item => {
        let data = item[1]
        for (let key in data) {
          try {
            data[key] = JSON.parse(data[key])
          } catch (e) {
          }
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
  const { userId } = socket.session
  const { firstEtl, noCompute, saveIssue, projectId: id, csvLocation: files, _id: requestId } = message

  return setDefaultData(id, userId).then(setResult => {
    if (setResult.status !== 200) return setResult
    return getFileInfo(files).then((fileInfo) => {
      if (fileInfo.status !== 200) return fileInfo
      const { csvLocation, ext } = fileInfo
      const data = {
        ...message,
        userId: userId,
        requestId,
        csvLocation,
        ext,
        noCompute: firstEtl || noCompute,
        stopId: requestId
      }
      // delete data.firstEtl
      Reflect.deleteProperty(data, 'firstEtl')
      Reflect.deleteProperty(data, 'saveIssue')
      if (!csvLocation) Reflect.deleteProperty(data, 'csvLocation')
      if (!ext) Reflect.deleteProperty(data, 'ext')
      return createOrUpdate(id, userId, { etling: true, stopId: requestId })
        .then(() => command(data, processData => {
          let { result, status } = processData;
          if (status < 0 || status === 100) return processData
          const { name, path, key, originHeader, value, fields } = result
          if (name === "progress" && key === 'etl') createOrUpdate(id, userId, { etlProgress: value })
          if (name === "csvHeader") createOrUpdate(id, userId, {
            originPath: path,
            rawHeader: originHeader,
            cleanHeader: fields,
            dataHeader: fields
          })
          if (name === "cleanCsvHeader") createOrUpdate(id, userId, { cleanPath: path })
          return null
        }, true).then(returnValue => {
          let { result, status } = returnValue;
          if (status < 0) {
            return createOrUpdate(id, userId, { etlProgress: 0, etling: false }).then(() => {
              return {
                status: 418,
                result,
                message: returnValue.message
              }
            })
          }

          //赋值给temp
          result.outlierDictTemp = result.outlierDict
          result.nullFillMethodTemp = result.nullFillMethod
          result.mismatchFillMethodTemp = result.mismatchFillMethod
          result.outlierFillMethodTemp = result.outlierFillMethod

          //保存原始错误
          if (saveIssue) {
            result.nullLineCountsOrigin = result.nullLineCounts
            result.mismatchLineCountsOrigin = result.mismatchLineCounts
            result.outlierLineCountsOrigin = result.outlierLineCounts
          }

          result.etling = false
          result.etlProgress = 0
          result.firstEtl = false;
          result.stopId = ''
          // delete result.name
          // delete result.id
          // delete result.userId
          Reflect.deleteProperty(result, 'name')
          Reflect.deleteProperty(result, 'id')
          Reflect.deleteProperty(result, 'userId')
          if (!files) Reflect.deleteProperty(result, 'totalRawLines') //delete result.totalRawLines
          // 最终ETL 小于1W行  使用cross
          if (result.totalLines < 10000) result.runWith = 'cross'
          const steps = {}
          if (firstEtl) {
            steps.curStep = 2
            steps.mainStep = 2
            steps.subStepActive = 2
            steps.lastSubStep = 2
          } else {
            if (noCompute) {
              steps.curStep = 3
              steps.mainStep = 3
              steps.subStepActive = 1
              steps.lastSubStep = 1
            } else {
              steps.curStep = 2
              steps.mainStep = 2
              steps.subStepActive = 3
              steps.lastSubStep = 3
            }
          }
          //重新做ETL后删除所有模型
          deleteModels(id)

          return createOrUpdate(id, userId, { ...result, ...steps }).then(updateResult => {
            if (updateResult.status !== 200) return updateResult
            return {
              status: 200,
              message: 'ok',
              result: result
            }
          })
        }))
    })
  })
})


wss.register('abortEtl', (message, socket) => {
  const projectId = message.projectId
  const userId = socket.session.userId
  return redis.hget("project:" + projectId, 'stopId').then(stopId => {
    try {
      stopId = JSON.parse(stopId)
    } catch (e) {
    }
    if (!stopId) return { status: 200, message: 'ok' }
    return command({ ...message, userId, requestId: message._id, stopId }, null, true).then(() => {
      command.clearListener(stopId)
      const statusData = {
        etling: false,
        etlProgress: 0,
        stopId: ''
      }
      return createOrUpdate(projectId, userId, statusData)
    })
  })
})

wss.register('dataView', (message, socket, progress) => {
  return createOrUpdate(message.projectId, socket.session.userId, { dataViewsLoading: true })
    .then(() => command({ ...message, userId: socket.session.userId, requestId: message._id }, async progressResult => {
      let lock = false
      const { status, result } = progressResult
      if (status === 1) {
        if (!lock) {
          const { name, value } = result
          lock = true
          if (name === "progress") await createOrUpdate(message.projectId, socket.session.userId, { dataViewProgress: value })
          setTimeout(() => lock = false, 500)
        }
      }
      if (status < 0 || status === 100) return progressResult
      return null
    }, true).then(async returnValue => {
      const { status, result } = returnValue
      if (status === 100) {
        const { result: updateResult } = await updateProjectField(message.projectId, socket.session.userId, 'newVariableViews', result)
        await createOrUpdate(message.projectId, socket.session.userId, { dataViewsLoading: false, dataViewProgress: 0 })
        if (updateResult && updateResult.newVariableViews) returnValue.result.data = updateResult.newVariableViews
      }
      return returnValue
    }))


  // sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
})

wss.register('correlationMatrix', (message, socket, progress) => createOrUpdate(message.projectId, socket.session.userId, { correlationMatrixLoading: true })
  .then(() => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
    .then(returnValue => {
      const { status, result } = returnValue
      const data = status === 100 ? {
        correlationMatrixHeader: result.header,
        correlationMatrixData: result.data,
        correlationMatrixLoading: false
      } : { correlationMatrixLoading: false }
      createOrUpdate(message.projectId, socket.session.userId, data)
      return returnValue
    })))


wss.register('preTrainImportance', async (message, socket, progress) => {

  const { userId } = socket.session;
  const { projectId } = message;

  return getProjectField(projectId, 'preImportanceLoading')
    .then(loading => {
      if (loading) return
    })
    .then(() => createOrUpdate(message.projectId, socket.session.userId, { preImportanceLoading: true }))
    .then(() => checkEtl(projectId, userId))
    .then(() => command({ ...message, userId: socket.session.userId, requestId: message._id }, async progressResult => {
      let lock = false
      const { status, result } = progressResult
      if (status === 1) {
        if (!lock) {
          const { name, value } = result
          lock = true
          if (name === "progress") await createOrUpdate(message.projectId, socket.session.userId, { importanceProgress: value })
          setTimeout(() => lock = false, 500)
        }
      }
      if (status < 0 || status === 100) return progressResult
      return null
    }, true)
      // .then(() => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
      .then(returnValue => {
        const { status, result } = returnValue
        const promise = []
        if (status === 100) {
          result.informativesLabel = result.informativesLabel || []
          result.preImportance = result.data
        }
        promise.push(status === 100 ? updateProjectField(message.projectId, socket.session.userId, 'preImportance', result.data) : Promise.resolve({}))
        promise.push(status === 100 ? updateProjectField(message.projectId, socket.session.userId, 'informativesLabel', result.informativesLabel) : Promise.resolve({}))
        promise.push(createOrUpdate(message.projectId, socket.session.userId, {
          preImportanceLoading: false,
          importanceProgress: 0
        }))
        return Promise.all(promise).then(([result1, result2]) => {
          const realResult = Object.assign({}, result, (result1 || {}).result, (result2 || {}).result)
          return Object.assign({}, returnValue, { result: realResult })
        })
      }))
})


wss.register('histgramPlot', (message, socket, progress) => {
  const { projectId: id, _id: requestId, feature_label } = message
  const { userId } = socket.session
  const histgramPlots = feature_label.reduce((start, f) => {
    start[f] = ''
    return start
  }, {})
  return updateProjectField(id, userId, "histgramPlots", histgramPlots)
    .then(() => command({ ...message, userId, requestId }, progressResult => {
      if (progressResult.status < 0 || progressResult.status === 100) {
        updateProjectField(id, userId, "histgramPlots", histgramPlots)
        return progressResult
      }
      const { result } = progressResult
      const { field, Data, progress: status } = result;
      if (status && status === "start") return
      if (histgramPlots.hasOwnProperty(field)) histgramPlots[field] = Data
      return progress(progressResult)
    }, true))
})

wss.register('rawHistgramPlot', (message, socket, progress) => {
  const { projectId: id, _id: requestId, feature_label } = message
  const { userId } = socket.session
  const histgramPlots = feature_label.reduce((start, f) => {
    start[f] = ''
    return start
  }, {})
  return updateProjectField(id, userId, "rawHistgramPlots", histgramPlots)
    .then(() => command({ ...message, userId, requestId }, progressResult => {
      if (progressResult.status < 0 || progressResult.status === 100) {
        updateProjectField(id, userId, "rawHistgramPlots", histgramPlots)
        return progressResult
      }
      const { result } = progressResult
      const { field, imageSavePath, progress: status } = result;
      if (status && status === "start") return
      if (histgramPlots.hasOwnProperty(field)) histgramPlots[field] = imageSavePath
      return progress(progressResult)
    }, true))
})

wss.register('univariatePlot', (message, socket, progress) => {
  const { projectId: id, _id: requestId, feature_label } = message
  const { userId } = socket.session
  const univariatePlots = feature_label.reduce((start, f) => {
    start[f] = ''
    return start
  }, {})
  return updateProjectField(id, userId, "univariatePlots", univariatePlots)
    .then(() => command({ ...message, userId, requestId }, progressResult => {
      if (progressResult.status < 0 || progressResult.status === 100) {
        updateProjectField(id, userId, "univariatePlots", univariatePlots)
        return progressResult
      }
      const { result } = progressResult
      const { field, Data, progress: status = '' } = result;
      if (status === "start") return
      if (univariatePlots.hasOwnProperty(field)) univariatePlots[field] = Data
      return progress(progressResult)
    }, true))
})

const _sendToCommand = (message, socket, progress) => sendToCommand({
  ...message,
  userId: socket.session.userId,
  requestId: message._id
}, progress)

// wss.register('chartData', _sendToCommand)
// wss.register('fitPlotAndResidualPlot', _sendToCommand)
// wss.register('pointToShow', _sendToCommand)
wss.register('createNewVariable', async (message, socket, progress) => {
  const { userId } = socket.session;
  const { projectId } = message;
  await checkEtl(projectId, userId)
  const returnValue = await _sendToCommand(message, socket, progress)
  const { status, result } = returnValue
  if (status === 100) {
    const { resultData } = result
    await createOrUpdate(projectId, userId, { newVariablePath: resultData })
  }
  return returnValue
})

wss.register('etlCleanData', (message, socket, progress) => {
  const { projectId } = message
  const { userId } = socket.session
  return createOrUpdate(projectId, userId, { etlCleanDataLoading: true }).then(() => {
    return sendToCommand({ ...message, userId, requestId: message._id }, progress).then(returnValue => {
      const { result, status } = returnValue
      const saveData = {
        etlCleanDataLoading: false
      }
      if (status === 100) {
        const cleanPath = ((result || {}).result || {}).path || ''
        if (cleanPath) saveData.cleanPath = cleanPath
      }
      return createOrUpdate(projectId, userId, saveData)
    })
  })
})

wss.register('abortTrain', (message, socket) => {
  const { projectId, isLoading, _id: requestId, stopId } = message
  const { userId } = socket.session
  return getProjectField(projectId, 'stopIds').then(stopIds => {
    if (!stopIds.length) return { status: 200, message: 'ok' }
    if (!stopIds.includes(stopId)) return { status: 200, message: 'ok' }
    return axios.get(`${config.services.BACK_API_SERVICE}/putRunTask?data=${JSON.stringify([{ ...message, userId, requestId, stopId }])}`).then(async () => {
      command.clearListener(stopId)
      const trainModel = await getProjectField(projectId, 'trainModel')
      Reflect.deleteProperty(trainModel, stopId);
      const statusData = {
        train2Finished: true,
        train2ing: false,
        train2Error: false,
        trainModel,
        stopIds: stopIds.filter(si => si === stopId)
      }
      if (isLoading) {
        statusData.mainStep = 3
        statusData.curStep = 3
        statusData.lastSubStep = 1
        statusData.subStepActive = 1
        statusData.trainModel = {}
        statusData.stopIds = []
      }
      return createOrUpdate(projectId, userId, statusData)
    })
    // return command(, () => {

    // }, true)
  })
})

wss.register('train', async (message, socket, progress) => {
  const { userId, user } = socket.session;
  const { projectId, data: updateData, version, algorithms } = message;
  // delete message.data
  Reflect.deleteProperty(message, 'data');
  // 拆分algorithms
  Reflect.deleteProperty(message, 'version');
  Reflect.deleteProperty(message, 'algorithms');
  // const stopId = uuid.v4()
  // const data = { ...message, userId, requestId, stopId: requestId };
  // let hasModel = false;
  try {
    await checkTraningRestriction(user)
    await checkEtl(projectId, userId)

    const commandArr = []
    const _stopIds = []

    const splitCommand = config.splitCommand

    if (splitCommand) {
      if (!!version) {
        const versions = (version || '').split(',')
        versions.forEach(_v => {
          if (_v === '3') {
            const stopId = uuid.v4()
            _stopIds.push(stopId)
            commandArr.push({
              ...message,
              version: _v,
              algorithms: algorithms,
              userId,
              stopId,
              requestId: stopId
            })
            // algorithms.forEach(al => {
            //   const stopId = uuid.v4()
            //   _stopIds.push(stopId)
            //   commandArr.push({
            //     ...message,
            //     version: _v,
            //     algorithms: [al],
            //     userId,
            //     stopId,
            //     requestId: stopId
            //   })
            // })
          } else {
            const stopId = uuid.v4()
            _stopIds.push(stopId)
            commandArr.push({
              ...message,
              version: _v,
              userId,
              stopId,
              requestId: stopId
            })
          }
        })
      } else {
        algorithms.forEach(al => {
          const stopId = uuid.v4()
          _stopIds.push(stopId)
          commandArr.push({
            ...message,
            algorithms: [al],
            userId,
            stopId,
            requestId: stopId
          })
        })
      }
    } else {
      const stopId = uuid.v4()
      commandArr.push({ ...message, userId, requestId: stopId, stopId, version, algorithms })
      _stopIds.push(stopId)
    }

    if (!commandArr.length) return { status: 200, msg: 'ok' }
    await createOrUpdate(projectId, userId, { ...updateData, stopIds: _stopIds })
    console.log('finish etl')

    const processFn = async queueValue => {
      const stopIds = await getProjectField(projectId, 'stopIds')
      const { status, result, requestId: trainId } = queueValue;
      if (status < 0 || status === 100) return { ...queueValue, isAbort: false };
      if (!stopIds.includes(trainId)) return { isAbort: true }
      if (!result) return
      let processValue
      if (result.name === "progress") {
        // const { requestId: trainId } = result;
        // delete result.requestId
        // Reflect.deleteProperty(result, 'requestId')
        await updateProjectField(projectId, userId, 'trainModel', { [trainId]: { ...result, requestId: trainId } })

        // const trainModel = await getProjectField(projectId, 'trainModel')
        // await createOrUpdate(projectId, userId, { trainModel: result })
        processValue = { ...result }
      } else if (result.score) {
        const { chartData: chartDataUrl, modelName } = result
        const trainModel = await getProjectField(projectId, 'trainModel')
        Reflect.deleteProperty(trainModel, trainId)
        await createOrUpdate(projectId, userId, { trainModel })
        let chartData = { chartData: chartDataUrl }
        if (chartDataUrl) chartData = await parseNewChartData(chartDataUrl)
        const stats = await getProjectField(projectId, 'stats')
        const modelData = { ...result, ...chartData, stats, featureLabel: message.featureLabel }
        if (message.problemType) modelData.problemType = message.problemType
        if (message.standardType) modelData.standardType = message.standardType
        if (modelData.rate) modelData.initRate = modelData.rate
        const modelResult = await createModel(userId, projectId, modelName, modelData)
        processValue = await addSettingModel(userId, projectId)(modelResult)
        // return progress(model)
      } else if (result.data) {
        const { model: mid, action, data } = result;
        let saveData = {}
        if (action === "chartData") {
          saveData = parseChartData(data)//原始数据
        }
        if (action === "pointToShow") {
          saveData = { qcut: data }
        }
        processValue = await updateModel(userId, projectId, mid, saveData)
        // return progress(model)
      } else if (result.imageSavePath) {
        const { model: mid, action, imageSavePath } = result
        const saveData = { [action]: imageSavePath }
        processValue = updateModel(userId, projectId, mid, saveData)
        // return progress(model)
      }
      return progress(processValue)
    }

    await Promise.all(commandArr.map(_ca => command(_ca, processFn, true)))

    const statusData = {
      train2Finished: true,
      train2ing: false,
      train2Error: false,
      trainModel: {},
      selectId: '',
      stopIds: []
    }
    const modelCounts = await getModelCount(projectId)

    if (modelCounts < 1) {
      statusData.train2Error = true
    }

    return await createOrUpdate(projectId, userId, statusData)

    // return
    // const isAbort = await command({ ...data, stopId: requestId }, , true)
    // if (isAbort === 2) return { status: 200, msg: 'ok' }
    // const statusData = {
    //   train2Finished: true,
    //   train2ing: false,
    //   train2Error: false,
    //   trainModel: [],
    //   selectId: '',
    //   stopId: ''
    // }
    // if (!hasModel) {
    //   console.log('failed')
    //   statusData.train2Error = true
    // }
    // return await createOrUpdate(projectId, userId, statusData)
  } catch (err) {
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
    await createOrUpdate(projectId, userId, statusData)
    return err
  }
  // return checkTraningRestriction(user)
  //   // .then(() => moveModels(message.projectId))
  //   .then(() => createOrUpdate(projectId, userId, { ...updateData, stopId: requestId }))
  //   .then(() => command({ ...data, stopId: requestId }, queueValue => {

  //     const { status, result } = queueValue;
  //     if (status < 0 || status === 100) return queueValue;
  //     if (result.name === "progress") {
  //       const { requestId: trainId } = result;
  //       // delete result.requestId
  //       Reflect.deleteProperty(result, 'requestId')
  //       return createOrUpdate(projectId, userId, { trainModel: result }).then(() => progress({ ...result, trainId }))
  //     }
  //     if (result.score) {
  //       hasModel = true;
  //       return createOrUpdate(projectId, userId, { trainModel: null })
  //         .then(() => createModel(userId, projectId, result.name, result).then(addSettingModel(userId, projectId)).then(model => progress(model)))
  //     }
  //     if (result.data) {
  //       const { model: mid, action, data } = result;
  //       let saveData = {}
  //       if (action === "chartData") {
  //         saveData = parseChartData(data)//原始数据
  //       }
  //       if (action === "pointToShow") {
  //         saveData = { qcut: data }
  //       }
  //       return updateModel(userId, projectId, mid, saveData).then(model => progress(model))
  //     }
  //     if (result.imageSavePath) {
  //       const { model: mid, action, imageSavePath } = result
  //       const saveData = { [action]: imageSavePath }
  //       return updateModel(userId, projectId, mid, saveData).then(model => progress(model))
  //     }
  //   })
  //     .then(() => {
  //   const statusData = {
  //     train2Finished: true,
  //     train2ing: false,
  //     train2Error: false,
  //     selectId: ''
  //   }
  //   if (!hasModel) statusData.train2Error = true
  //   return createOrUpdate(projectId, userId, statusData)
  // }))
  // .catch(err => {
  //   const statusData = {
  //     train2Finished: false,
  //     train2ing: false,
  //     train2Error: false,
  //     selectId: '',
  //     mainStep: 3,
  //     curStep: 3,
  //     lastSubStep: 1,
  //     subStepActive: 1
  //   }
  //   createOrUpdate(projectId, userId, statusData)
  //   return err
  // })
})

wss.register("watchProjectList", (message, socket) => {
  const { userId } = socket.session
  const key = `user:${userId}:projects`
  wss.subscribe(key, (data) => {
    try {
      data = JSON.parse(data)
    } catch (e) {
    }
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
  const { userId } = socket.session
  const { id, broadcastId } = message
  wss.clients.forEach(client => {
    if (client === socket) return
    if (client.session && client.session.userId === userId) client.send(JSON.stringify({
      id,
      broadcastId,
      type: "inProject"
    }))
  })
})


wss.register("updateModel", (message, socket) => {
  const { userId } = socket.session
  const { projectId } = message
  const { data, id: mid } = message
  return updateModel(userId, projectId, mid, data)
})

wss.register("permutationImportance", (message, socket) => {
  const { userId } = socket.session
  const { projectId, id: mid, command: commandText, _id: requestId } = message
  return updateModel(userId, projectId, mid, { importanceLoading: true })
    .then(() => command({
      command: commandText,
      projectId,
      solution: mid,
      userId,
      requestId
    }, progressValue => {
      const { result, status } = progressValue
      if (status < 0 || status === 100) return progressValue
      const { name, model, featureImportance } = result
      if (name === 'progress') return
      if (model === mid) return updateModel(userId, projectId, mid, { featureImportance, importanceLoading: false })
    }, true))
})

wss.register('outlierPlot', (message, socket) => {
  const { userId } = socket.session
  const { projectId, id: mid, command: commandText, _id: requestId, featureList, randomSeed } = message

  return updateModel(userId, projectId, mid, { outlierPlotLoading: true })
    .then(() => command({
      command: commandText,
      projectId,
      solution: mid,
      userId,
      requestId,
      featureList,
      randomSeed
    }, progressValue => {
      const { status, result } = progressValue
      // console.log(progressValue, 'progressValue')
      if (status < 0 || status === 100) return progressValue
      const { name, action } = result
      if (name === 'progress') return
      if (action === 'outlierPlot') {
        const { outlierPlotData, featureList } = result
        return updateModel(userId, projectId, mid, { outlierPlotLoading: false, outlierPlotData, featureList })
      }
    }, true))
  // .then(returnValue => {
  //   const { result, status } = returnValue
  //   if (status < 0) return result
  //   const { outlierPlotData, featureList } = result
  //   return updateModel(userId, projectId, mid, { outlierPlotLoading: false, outlierPlotData, featureList })
  // })
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

wss.register('getSample', (message, socket) => {
  const type = (message.problemType || '')[0]
  if (!type || (type !== 'C' && type !== 'R')) return []
  return redis.smembers(`file:${type}:samples`).then(result => {
    const list = result.map(r => {
      try {
        r = JSON.parse(r)
      } catch (e) {
      }
      return r
    })
    return { list }
  })
})

wss.register("checkProject", (message, socket) => {
  const userId = socket.session.userId
  const id = message.id
  return checkProject(userId, id)
})

wss.register("fetchData", async (message, socket) => {
  // const userId = socket.session.userId
  const path = message.path
  return await axios.get(path)
})

wss.register('preDownload', async (message, socket) => {
  const { mid, rate, etlIndex, projectId, _id: requestId } = message
  const { userId } = socket.session
  // const requestId = uuid.v4()

  // const model = await redis.hgetall(`project:${projectId}:model:${mid}`)
  // const { featureImportance } = model
  // const header = Object.keys(JSON.parse(featureImportance))

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

    return { status: 100, message: 'ok', data: deployResult }
    // downloadCsv(deployResult.deployData, decodeURIComponent(filename), etlIndex, header, res)
  } catch (e) {
    return { status: 500, message: 'error', error: e }
  }
})

module.exports = {
  createOrUpdate,
  deleteModels
}
