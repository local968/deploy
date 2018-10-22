const PORT = 8080 || process.env.PORT
const BACKEND_PORT = PORT || process.env.BACKEND_PORT
const REDIS_HOST = '192.168.0.3' || process.env.REDIS_HOST
const REDIS_PORT_1 = 16390 || process.env.REDIS_PORT_1
const REDIS_PORT_2 = 16391 || process.env.REDIS_PORT_2
const REDIS_PORT_3 = 16392 || process.env.REDIS_PORT_3
const REDIS_USERNAME = 'redismaster' || process.env.REDIS_USERNAME
const REDIS_PASSWORD = 'redis123321eq' || process.env.REDIS_PASSWORD
const REQUEST_QUEUE = 'taskQueue' || process.env.REQUEST_QUEUE
const RESULT_QUEUE = 'resultDataQueue' || process.env.RESULT_QUEUE
const QUEUE_PERIOD = 60 || process.env.QUEUE_PERIOD
const SCHEDULE_PERIOD = 60 || process.env.SCHEDULE_PERIOD
const MAX_CONCURRENCY_SCHEDULE = 2 || process.env.MAX_CONCURRENCY_SCHEDULE

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
}

let localConfig = {};
try {
  localConfig = require('./local_config.js').server;
} catch (e) { }

module.exports = { ...defaultConfig, ...localConfig };
