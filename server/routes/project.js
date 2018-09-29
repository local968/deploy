const { redis, pubsub } = require('redis')
const ws = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')

ws.register("addProject", (message, socket) => {
  const userId = socket.session.userId;
  const id = uuid.v4()
  const time = moment().unix();

  const params = []
  Object.entries(message).forEach(([k, v]) => {
    if(!k || !v || typeof k !== "string" || typeof v === "function") return;
    params.push(k, JSON.stringify(v))
  })

  params.push("id", id, "createTime", time, "updateTime", time);

  const pipeline = redis.pipeline();
  return pipeline.hmset("project:"+id, params)
    .zadd(`user:${userId}:projects:createTime`, time, id)
    .zadd(`user:${userId}:projects:updateTime`, time, id)
    .exec()
    .then((result) => {
      const err = result.find(([error]) => !!error);

      if(err) return {status: 411, message: "add project error"}
      return {status: 200, message: "ok", id: id}
    })
})

ws.register("queryProjects", (message, socket) => {
  const userId = socket.session.userId;
  const {limit, order, max, withScores} = message;

  const key = `user:${userId}:projects:${order==='createTime'?'createTime':'updateTime'}`;

  const params = [key, (max || "+inf"), "-inf"];
  if(withScores) params.push("withscores");
  if(limit) params.push('limit', 0, limit) 

  return redis.zrevrangebyscore(params).then(data => {
    return new Promise(resolve => {
      if(!Array.isArray(data)) throw new Error({status: 401, message: "query error"})
      if(data.length === 0) return resolve({list: data})
      const promiseArray = formatList(data, withScores).map(r => {
        const Field = ["id"]
        return redis.hmget("project:"+r.value, Field)
      })
      Promise.all(promiseArray).then(list => {
        resolve({list})
      }) 
    })
    .catch(err => {
      console.log(err, "error!!")
    })
  })

  // return redis.zrevrangebyscore("test:cc:1", ["+inf", "-inf", "withscores", 'limit', 1, 2]).then(list => {
  //   const data = formatList(list, true);
  //   return {list: data}
  // })
})

ws.register("test111", (message, socket) => {
  ws.subscribe("test:cc:111", (aaa) => {
    return aaa
  },socket)
  return {
    b:1
  }
})

ws.register("pub111", (message, socket) => {
  ws.publish("test:cc:111", {a:1})
  return {
    c:2
  }
})

function formatList(list, withScores) {
  const returnList = [];
  const length = list.length;
  const n = !!withScores?2:1;
  for(let i = 0; i < length; i += n) {
    const block = list.slice(i, i+n);
    const data = {
      value: block[0]
    }
    if(!!withScores) data.score = block[1];
    returnList.push(data)
  }
  return returnList;
}

