const PORT = process.env.PORT || 8080
const BACKEND_PORT = process.env.BACKEND_PORT || PORT
const REDIS_HOST = process.env.REDIS_HOST || '192.168.0.3'
const REDIS_PORT_1 = process.env.REDIS_PORT_1 || 16390
const REDIS_PORT_2 = process.env.REDIS_PORT_2 || 16391
const REDIS_PORT_3 = process.env.REDIS_PORT_3 || 16392
const REDIS_USERNAME = process.env.REDIS_USERNAME || 'redismaster'
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'redis123321eq'
const REQUEST_QUEUE = process.env.REQUEST_QUEUE || 'taskQueue'
const RESULT_QUEUE = process.env.RESULT_QUEUE || 'resultDataQueue'
const QUEUE_PERIOD = process.env.QUEUE_PERIOD || 60
const SCHEDULE_PERIOD = process.env.SCHEDULE_PERIOD || 60
const MAX_CONCURRENCY_SCHEDULE = process.env.MAX_CONCURRENCY_SCHEDULE || 2
const SECRET = process.env.SECRET || 'FNcidLwifNC902LCC9f2C'

const defaultConfig = {
  port: BACKEND_PORT,
  redis: {
    sentinels: [
      { host: REDIS_HOST, port: REDIS_PORT_1 },
      { host: REDIS_HOST, port: REDIS_PORT_2 },
      { host: REDIS_HOST, port: REDIS_PORT_3 }
    ],
    name: REDIS_USERNAME,
    password: REDIS_PASSWORD
  },
  requestQueue: REQUEST_QUEUE,
  resultQueue: RESULT_QUEUE,
  queuePeriod: QUEUE_PERIOD,
  schedulePeriod: SCHEDULE_PERIOD,
  maxConcurrencySchedule: MAX_CONCURRENCY_SCHEDULE,
  secret: SECRET
}

let localConfig = {};
try {
  localConfig = require('./local_config.js').server;
} catch (e) { }

module.exports = { ...defaultConfig, ...localConfig };
