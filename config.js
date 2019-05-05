const BACKEND_PORT = process.env.BACKEND_PORT || "9080";
const REDIS_USERNAME = process.env.REDIS_USERNAME || "redismaster";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "redis123321eq";
const REQUEST_QUEUE = process.env.REQUEST_QUEUE || "task";
const RESULT_QUEUE = process.env.RESULT_QUEUE || "result";
const QUEUE_PERIOD = process.env.QUEUE_PERIOD || "60";
const SCHEDULE_PERIOD = process.env.SCHEDULE_PERIOD || "60";
const MAX_CONCURRENCY_SCHEDULE = process.env.MAX_CONCURRENCY_SCHEDULE || "2";
const SECRET = process.env.SECRET || "FNcidLwifNC902LCC9f2C";
const REDIS_SENTINEL_HOSTS =
  process.env.REDIS_SENTINEL_HOSTS ||
  "192.168.0.23:16390,192.168.0.23:16391,192.168.0.23:16392";
const REDIS_HOST = process.env.REDIS_HOST || "192.168.0.23:6375";
const REDIS_TYPE = process.env.REDIS_TYPE || "1"; // 1 standalone 2 sentinel
const PASSWORD = process.env.PASSWORD || "7788414";
const BACKEND = process.env.REACT_APP_NGINX_BACKEND || "1";
const HOST = process.env.R2HOST || "http://127.0.0.1:3000/";

const APP_LOGIN_BFF = process.env.APP_LOGIN_BFF || "http://192.168.0.134:4001";
const AUTH_SERVICE = process.env.AUTH_SERVICE || "http://192.168.0.134:4002";
const DEPLOYMENT_SERVICE =
  process.env.DEPLOYMENT_SERVICE || "http://192.168.0.134:4003";
const DSL_SERVICE = process.env.DSL_SERVICE || "http://192.168.0.134:4004";
const ETL_SERVICE = process.env.ETL_SERVICE || "http://192.168.0.88:8000";
const GRAPHIC_SERVICE =
  process.env.GRAPHIC_SERVICE || "http://192.168.0.134:4006";
const JOB_SERVICE = process.env.JOB_SERVICE || "http://192.168.0.134:4007";
const MODEL_SERVICE = process.env.MODEL_SERVICE || "http://192.168.0.134:4008";
const PLAN_SERVICE = process.env.PLAN_SERVICE || "http://192.168.0.134:4009";
const PROJECT_SERVICE =
  process.env.PROJECT_SERVICE || "http://192.168.0.134:4010";
const PROPELLER_BFF = process.env.PROPELLER_BFF || "http://192.168.0.134:4011";
const SAAS_BFF = process.env.SAAS_BFF || "http://192.168.0.134:4012";
const SAAS_LOGIN_BFF =
  process.env.SAAS_LOGIN_BFF || "http://192.168.0.134:4013";
const SCHEDULE_SERVICE =
  process.env.SCHEDULE_SERVICE || "http://192.168.0.134:4014";
const SCHEMA_SERVICE =
  process.env.SCHEMA_SERVICE || "http://192.168.0.134:4015";
const TASK_SERVICE = process.env.TASK_SERVICE || "http://192.168.0.134:4016";
const USER_SERVICE = process.env.USER_SERVICE || "http://192.168.0.134:4017";

const AMQPLIB_PROTOCOL = process.env.AMQPLIB_PROTOCOL || "amqp.js.ts";
const AMQPLIB_HOSTNAME = process.env.AMQPLIB_HOSTNAME || "192.168.0.134";
const AMQPLIB_PORT = process.env.AMQPLIB_PORT || "5672";
const AMQPLIB_USERNAME = process.env.AMQPLIB_USERNAME || "admin";
const AMQPLIB_PASSWORD = process.env.AMQPLIB_PASSWORD || "admin";
const AMQPLIB_LOCALE = process.env.AMQPLIB_LOCALE || "en_US";
const AMQPLIB_FRAMEMAX = process.env.AMQPLIB_FRAMEMAX || "0";
const AMQPLIB_HEARTBEAT = process.env.AMQPLIB_HEARTBEAT || "0";
const AMQPLIB_VHOST = process.env.AMQPLIB_VHOST || "/";

const QUEUE_RESULT = process.env.QUEUE_RESULT || "";
const IS_EN = process.env.IS_EN || false;
const YOUR_AGE = process.env.YOUR_AGE || '部署行数已达到出当前权限最大限制。';
const YOUR_MODEL = process.env.YOUR_MODEL || '您的建模数据量超出当前权限最大限制。';
const YOUR_USAGE = process.env.YOUR_USAGE  || '您的并发项目数量已达到当前许可证的最大限制。。';
const redis =
  REDIS_TYPE === "2"
    ? {
        sentinels: REDIS_SENTINEL_HOSTS.split(",").map(host => ({
          host: host.split(":")[0],
          port: host.split(":")[1]
        })),
        name: REDIS_USERNAME,
        password: REDIS_PASSWORD
      }
    : {
        host: REDIS_HOST.split(":")[0],
        port: REDIS_HOST.split(":")[1],
        name: REDIS_USERNAME,
        password: REDIS_PASSWORD
      };

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
  supportMail: "support@r2.ai",
  yourAge:YOUR_AGE,
  yourModel:YOUR_MODEL,
  yourUsage:YOUR_USAGE,
  services: {
    APP_LOGIN_BFF,
    AUTH_SERVICE,
    DEPLOYMENT_SERVICE,
    DSL_SERVICE,
    ETL_SERVICE,
    GRAPHIC_SERVICE,
    JOB_SERVICE,
    MODEL_SERVICE,
    PLAN_SERVICE,
    PROJECT_SERVICE,
    PROPELLER_BFF,
    SAAS_BFF,
    SAAS_LOGIN_BFF,
    SCHEDULE_SERVICE,
    SCHEMA_SERVICE,
    TASK_SERVICE,
    USER_SERVICE
  },
  mq: {
    AMQPLIB_PROTOCOL,
    AMQPLIB_PORT,
    AMQPLIB_HOSTNAME,
    AMQPLIB_USERNAME,
    AMQPLIB_PASSWORD,
    AMQPLIB_LOCALE,
    AMQPLIB_FRAMEMAX,
    AMQPLIB_HEARTBEAT,
    AMQPLIB_VHOST,
    QUEUE_RESULT
  }
};

module.exports = config;
