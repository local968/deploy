const { redis, pubsub } = require('redis')
const config = require("../../config")
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')
const command = require('../command')

const userProjectRestrict = [0, 15, 15, 150, 999999]

function query(key, params) {
  const Field = ["id", "name", "createTime", "curStep"]
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

function createOrUpdate(id, userId, params, isCreate = false) {
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
      const data = err ? { status: 411, message: (isCreate ? "create" : "update") + " project error" } : { status: 200, message: "ok", id: id }
      wss.publish("user:" + userId + ":projects", data)
      return data
    })
}

function createModel(id, params) {
  const modelId = uuid.v4()
  const pipeline = redis.pipeline();
  pipeline.hmset("model:" + modelId, mapObjectToArray({ ...params, id: modelId }))
  pipeline.sadd("project:" + id + ":models", modelId)
  return pipeline.exec().then(result => {
    const err = result.find(([error]) => !!error);
    const data = err ? { status: 412, message: "create model error" } : { status: 200, message: "ok" }
    return { ...data, result: { ...params, id: modelId } }
  })
}

function deleteModels(id) {
  return redis.smembers("project:" + id + ":models").then(ids => {
    const pipeline = redis.pipeline();
    ids.forEach(modelId => {
      pipeline.del("model:" + modelId)
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
    const max = (level === 0 && 0) || (level < 3 && 1) || (level === 3 && 5) || Infinity
    const duration = moment.duration(moment().unix() - user.createdTime)
    const restrictQuery = `user:${user.id}:duration:${duration.years()}-${duration.months()}:training`
    return redis.get(restrictQuery).then(count => {
      if (count > userProjectRestrict[user.level]) return reject({
        status: -4,
        message: 'Your usage of number of training has reached the max restricted by your current lisense.',
        error: 'project number exceed'
      })

      return redis.get(`user:${user.id}:concurrent`).then(num => {
        if (num >= max) return reject({ error: 'project concurrent exceed', message: "Number of your concurrent projects has reached the max restricted by your current lisense.", status: -3 })
        redis.incr(restrictQuery)
        redis.incr(`user:${user.id}:concurrent`)
        return resolve()
      })
    })
  })
}

function sendToCommand(data, progress) {
  return command(data, (result) => {
    return (result.status < 0 || result.status === 100) ? result : progress(result)
  })
}

wss.register("addProject", (message, socket) => {
  const userId = socket.session.userId;
  return redis.incr("node:project:count").then(id => {
    console.log('new project id:', id)
    return command({ command: "create", projectId: id.toString(), userId, requestId: message._id }).then(result => {
      const params = mapObjectToArray({ id, userId });
      return createOrUpdate(id, userId, params, true)
    })
  })
})

wss.register("updateProject", (message, socket) => {
  const userId = socket.session.userId;
  const data = Object.assign({}, message);
  const { id } = data
  delete data.id
  delete data._id
  delete data.type
  data.userId = userId

  const params = mapObjectToArray(data)
  return checkProject(userId, id).then(err => {
    if (err) return err
    return createOrUpdate(id, userId, params)
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
      pipeline.hgetall("model:" + modelId)
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
  const pipeline = redis.pipeline();
  const files = message.csvLocation || []
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
    const data = { ...message, userId: socket.session.userId, requestId: message._id, csvLocation, ext }
    return sendToCommand(data, progress)
  })
})

wss.register('dataView', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('correlationMatrix', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('preTrainImportance', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('histgramPlot', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('univariatePlot', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('chartData', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('fitPlotAndResidualPlot', (message, socket, progress) => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress))

wss.register('train', (message, socket, progress) => {
  const data = { ...message, userId: socket.session.userId, requestId: message._id }
  return checkTraningRestriction(socket.session.user)
    .then(() => deleteModels(message.projectId))
    .then(() => command(data, queueValue => {
      const isFinish = queueValue.status < 0 || queueValue.status === 100
      if (isFinish) return queueValue
      const { result, projectId } = queueValue
      if (result.progress === "start") return progress(result)
      return createModel(projectId, result).then(progress)
    }))
    .then(result => {
      redis.incrby(`user:${userId}:concurrent`, -1)
      return result
    })
    .catch(err => err)
})

wss.register("watchProject", (message, socket) => {
  const userId = socket.session.userId;
  const id = message.id;
  if (!id) return { status: 500, message: "empty id" }
  const key = "user:" + userId + ":project:" + id
  wss.subscribe(key, (data) => {
    try {
      data = JSON.parse(data)
    } catch (e) { }
    return data
  }, socket)
  return { status: 200, message: "ok", id: key }
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
