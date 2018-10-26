const PORT = process.env.PORT || 8080
const BACKEND_PORT = process.env.BACKEND_PORT || PORT
const REDIS_USERNAME = process.env.REDIS_USERNAME || 'redismaster'
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'redis123321eq'
const REQUEST_QUEUE = process.env.REQUEST_QUEUE || 'taskQueue'
const RESULT_QUEUE = process.env.RESULT_QUEUE || 'resultDataQueue'
const QUEUE_PERIOD = process.env.QUEUE_PERIOD || 60
const SCHEDULE_PERIOD = process.env.SCHEDULE_PERIOD || 60
const MAX_CONCURRENCY_SCHEDULE = process.env.MAX_CONCURRENCY_SCHEDULE || 2
const SECRET = process.env.SECRET || 'FNcidLwifNC902LCC9f2C'
const REDIS_SENTINEL_HOSTS = process.env.REDIS_SENTINEL_HOSTS || '192.168.0.3:16390,192.168.0.3:16391,192.168.0.3:16392'

const defaultConfig = {
  port: BACKEND_PORT,
  redis: {
    sentinels: REDIS_SENTINEL_HOSTS.split(',').map(host => ({
      host: host.split(':')[0],
      port: host.split(':')[1]
    })),
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
  localConfig = require('./local_config.js');
} catch (e) { }

module.exports = { ...defaultConfig, ...localConfig };
