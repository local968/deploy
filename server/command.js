const { redis, pubsub } = require('redis')
const config = require("../config")
const FINISH = 1
const SEND = 2

const command = (command, callback) => {
  const returnPromise = new Promise((resolve, reject) => {
    const requestId = command.requestId
    if (!requestId) return reject(new Error('no request id'))
    if (command.command === 'create') {
      pubsub.lpush(config.requestQueue, JSON.stringify(command)).then(console.log.bind(console, 'create:'))
    } else {
      pubsub.lpush(config.requestQueue, JSON.stringify(command))
    }
    if (!callback) return pubsub.once(requestId, resolve)

    const _callback = async (result) => {
      const returnValue = await callback(result)
      if (returnValue) {
        pubsub.removeListener(requestId, _callback)
        return resolve(returnValue)
      }
      // if (returnValue.progressStatus === SEND) return returnPromise.progress(returnValue)
    }
    pubsub.on(requestId, _callback)
  })
  return returnPromise
}

const watchQueue = () => {
  pubsub.rpop(config.resultQueue).then(result => {
    if (result === null) return
    result = JSON.parse(result)
    const requestId = result.requestId
    // const interval = setInterval(() => {
    //   pubsub.emit(requestId, result)
    // }, 500)
    // setTimeout(clearInterval.bind(null, interval), 10000)
    pubsub.emit(requestId, result)
  })
}

setInterval(watchQueue, 1000)

command.FINISH = FINISH
command.SEND = SEND

module.exports = command
