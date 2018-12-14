// const uuid = require('uuid/v4')
const { redis } = require('redis')
const { Router } = require('express')
const config = require('../config');
const router = new Router()
const crypto = require('crypto')

// const nodeId = uuid()
const nodeId = 1

// fake socket
const fakeSocket = {
  send: () => { },
  session: { userId: 1 }
}

const saveMessage = async (message, user) => {
  message.user = user
  message = JSON.stringify(message)
  const id = crypto.createHash('md5').update(message).digest('hex')
  const key = `message:${id}`
  const pipeline = redis.pipeline()
  pipeline.set(key, message)
  pipeline.sadd(`node:${nodeId}:messages`, key)
  return pipeline.exec()
}

const removeMessage = async (message, user) => {
  message.user = user
  message = JSON.stringify(message)
  const id = crypto.createHash('md5').update(message).digest('hex')
  const key = `message:${id}`
  const pipeline = redis.pipeline()
  pipeline.del(key)
  pipeline.srem(`node:${nodeId}:messages`, key)
  return pipeline.exec()
}

const init = async (wss) => {
  // let left = await redis.scard(`node:${nodeId}:messages`)
  // if (left === 0) return
  // while (left > 0) {
  //   try {
  //     const messageId = await redis.spop(`node:${nodeId}:messages`)
  //     const message = JSON.parse(await redis.get(messageId))
  //     console.log(`recovering ${messageId}:`, message)
  //     const user = message.user
  //     const socket = { ...fakeSocket, session: { userId: user.id, user } }
  //     wss.emit('message', socket, JSON.stringify(message))
  //   } catch (e) {
  //     console.error('message recover failed', e)
  //   }
  //   console.log('left:', left)
  //   left = await redis.scard(`node:${nodeId}:messages`)
  // }
}

router.get('/status', async (req, res) => {
  if (req.query.password !== config.PASSWORD) return res.status(404).end()
  const left = await redis.scard(`node:${nodeId}:messages`)
  res.json({ left })
})

router.get('/clear', async (req, res) => {
  if (req.query.password !== config.PASSWORD) return res.status(404).end()
  const keys = await redis.smembers(`node:${nodeId}:messages`)
  const result = await redis.del(...keys, `node:${nodeId}:messages`)
  const left = await redis.scard(`node:${nodeId}:messages`)
  res.json({ result, left, keys })
})

module.exports = { saveMessage, removeMessage, recover: init, messageRouter: router }
