const { redis, pubsub } = require('redis')
const config = require("../config")

module.exports = (command) => {
  return new Promise((resolve, reject) => {
    const requestId = command.requestId
    if (!requestId) return reject(new Error('no request id'))
    pubsub.lpush(config.requestQueue, JSON.stringify(command))
    pubsub.once(requestId, resolve)
  })
}

const watchQueue = () => {
  pubsub.rpop(config.resultQueue).then(result => {
    if(result === null) return
    result = JSON.parse(result)
    const requestId = result.requestId
    pubsub.emit(requestId, result)
  })
}

setInterval(watchQueue, 1000)
