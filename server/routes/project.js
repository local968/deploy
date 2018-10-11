const { redis, pubsub } = require('redis')
const config = require("../../config")
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')
const command = require('../command')

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

wss.register("addProject", (message, socket) => {
  const userId = socket.session.userId;

  return redis.incr("node:user:" + userId).then(id => {
    // return command({ command: "create", projectId: id.toString(), userId, requestId: message._id }).then(result => {
      // console.log(result)
      const params = mapObjectToArray({ id, userId });
      return createOrUpdate(id, userId, params, true)
    // })
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
  return createOrUpdate(id, userId, params)
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

wss.register("queryProject", message => {
  const id = message.id;
  const key = `project:${id}`;

  return redis.hgetall(key).then(result => {
    for (let key in result) {
      try {
        result[key] = JSON.parse(result[key])
      } catch (e) { }
    }
    return {
      status: 200,
      message: 'ok',
      data: result
    }
  })
})

wss.register('etl', (message, socket) => {
  const data = { ...message, userId: socket.session.userId, requestId: message._id }
  return command(data, (result) => {
    const status = result.status===100 ? command.FINISH : command.SEND
    return { ...result, progressStatus: status } // command.FINISH
  })
  // .then(result => ({ status: 200, message: 'ok', result })).catch(error => ({status:}))
})

// wss.register("changeRequest", (message, socket) => {
//   const userId = socket.session.userId;
//   const id = message.id;
//   const params = message.params;

//   const data = JSON.stringify(Object.assign({}, params, { requestId: id, userId }))
//   console.log(data, "changeRequest")
//   return command(data)
//   // redis.select(0).then(() => {
//   pubsub.lpush(config.requestQueue, data)
//   // })

//   return {
//     status: 200,
//     message: "ok"
//   }
// })

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
  const userId = socket.session.userId;
  wss.publish("user:" + userId + "projects", { a: 1 })
  return { status: 200, message: "ok" }
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

// function watchResult() {
//   // console.log(redis)
//   // redis.select(0).then(() => {
//   pubsub.rpop(config.resultQueue).then(data => {
//     if (data) {
//       try {
//         data = JSON.parse(data)
//       } catch (e) { }
//       console.log(data, "result")
//       try {
//         const userId = data.userId
//         let isActive = false
//         wss.clients.forEach(c => {
//           if (c.session.userId === userId) isActive = true;
//         })
//         if (!isActive) throw new Error("user:" + userId + " is not active")
//         wss.publish("user:" + userId + ":projects", data)
//       } catch (err) {
//         console.log(err.message)
//         pubsub.lpush(config.resultQueue, JSON.stringify(data))
//       }

//     }
//   })
//   // })

// }

// setInterval(watchResult, 2000)
