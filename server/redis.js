const config = require('../config')
const Redis = require('ioredis')
const redis = new Redis(config.redisUri)
const pubsub = new Redis(config.pubsubUri)

redis.on('connect', () => {
  console.log('redis connected')
})
pubsub.on('connect', () => {
  console.log('pubsub redis connected')
})
redis.on('error', console.log)

module.exports = { redis, pubsub }
