const config = require('../config')
const Redis = require('ioredis')
const redis = new Redis(config.redisUri)
const pubsub = new Redis(config.pubsubUri)

redis.on('connect', () => {
  console.log('111')
})
pubsub.on('connect', () => {
  console.log('111')
})
redis.on('error', console.log)

module.exports = { redis, pubsub }