const BACKEND_PORT = process.env.BACKEND_PORT || '9080'
const REDIS_USERNAME = process.env.REDIS_USERNAME || 'redismaster'
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'redis123321eq'
const REQUEST_QUEUE = process.env.REQUEST_QUEUE || 'taskQueue'
const RESULT_QUEUE = process.env.RESULT_QUEUE || 'resultDataQueue'
const QUEUE_PERIOD = process.env.QUEUE_PERIOD || '60'
const SCHEDULE_PERIOD = process.env.SCHEDULE_PERIOD || '60'
const MAX_CONCURRENCY_SCHEDULE = process.env.MAX_CONCURRENCY_SCHEDULE || '2'
const SECRET = process.env.SECRET || 'FNcidLwifNC902LCC9f2C'
const REDIS_SENTINEL_HOSTS = process.env.REDIS_SENTINEL_HOSTS || '192.168.0.23:16390,192.168.0.23:16391,192.168.0.23:16392'
const REDIS_HOST = process.env.REDIS_HOST || '192.168.0.23:6375'
const REDIS_TYPE = process.env.REDIS_TYPE || '1' // 1 standalone 2 sentinel
const PASSWORD = process.env.PASSWORD || '7788414'
const BACKEND = process.env.REACT_APP_NGINX_BACKEND || '1'
const HOST = process.env.R2HOST || 'http://127.0.0.1:3000/'

const redis = REDIS_TYPE === '2' ?
  {
    sentinels: REDIS_SENTINEL_HOSTS.split(',').map(host => ({
      host: host.split(':')[0],
      port: host.split(':')[1]
    })),
    name: REDIS_USERNAME,
    password: REDIS_PASSWORD
  } : {
    host: REDIS_HOST.split(':')[0],
    port: REDIS_HOST.split(':')[1],
    name: REDIS_USERNAME,
    password: REDIS_PASSWORD
  }

const config = {
  host: HOST,
  port: BACKEND_PORT,
  redis,
  requestQueue: REQUEST_QUEUE,
  resultQueue: RESULT_QUEUE,
  queuePeriod: QUEUE_PERIOD,
  schedulePeriod: SCHEDULE_PERIOD,
  maxConcurrencySchedule: MAX_CONCURRENCY_SCHEDULE,
  secret: SECRET,
  PASSWORD,
  nginxBackend: BACKEND,
  mail: {
    service: "Zoho",
    port: 465,
    secureConnection: true,
    auth: {
      user: "report@r2.ai",
      pass: "IfxMzpWxskXq"
    }
  },
  supportMail: 'support@r2.ai'
}

module.exports = config
