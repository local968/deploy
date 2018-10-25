const config = require('../config')
const Redis = require('ioredis')
const redis = new Redis({...config.redis, db: 10})
const pubsub = new Redis({...config.redis, db: 0})

redis.on('connect', () => {
  console.log('redis connected')
})
pubsub.on('connect', () => {
  console.log('pubsub redis connected')
})
redis.on('error', console.log.bind(console,'redis error:'))

module.exports = { redis, pubsub }
