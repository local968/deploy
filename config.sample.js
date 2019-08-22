const BACKEND_PORT = process.env.BACKEND_PORT || "8080";
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
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1:6379";
const REDIS_TYPE = process.env.REDIS_TYPE || "1"; // 1 standalone 2 sentinel
const PASSWORD = process.env.PASSWORD || "7788414";
const BACKEND = process.env.REACT_APP_NGINX_BACKEND || "1";
const HOST = process.env.R2HOST || "//127.0.0.1:3000/";

const APP_LOGIN_BFF = process.env.APP_LOGIN_BFF || "//192.168.0.88:4001";
const AUTH_SERVICE = process.env.AUTH_SERVICE || "//192.168.0.88:4002";
const DEPLOYMENT_SERVICE =
  process.env.DEPLOYMENT_SERVICE || "//192.168.0.88:4003";
const DSL_SERVICE = process.env.DSL_SERVICE || "//192.168.0.88:4004";
const ETL_SERVICE = process.env.ETL_SERVICE || "//192.168.0.88:4005";// //127.0.0.1:9201  //192.168.0.23:9200
const GRAPHIC_SERVICE =
  process.env.GRAPHIC_SERVICE || "//192.168.0.88:4006";
const JOB_SERVICE = process.env.JOB_SERVICE || "//192.168.0.88:4007";
const MODEL_SERVICE = process.env.MODEL_SERVICE || "//192.168.0.88:4008";
const PLAN_SERVICE = process.env.PLAN_SERVICE || "//192.168.0.88:4009";
const PROJECT_SERVICE =
  process.env.PROJECT_SERVICE || "//192.168.0.88:4010";
const PROPELLER_BFF = process.env.PROPELLER_BFF || "//192.168.0.88:4011";
const SAAS_BFF = process.env.SAAS_BFF || "//192.168.0.88:4012";
const SAAS_LOGIN_BFF =
  process.env.SAAS_LOGIN_BFF || "//192.168.0.88:4013";
const SCHEDULE_SERVICE =
  process.env.SCHEDULE_SERVICE || "//192.168.0.88:4014";
const SCHEMA_SERVICE =
  process.env.SCHEMA_SERVICE || "//192.168.0.88:4015";
const TASK_SERVICE = process.env.TASK_SERVICE || "//192.168.0.88:4016";
const USER_SERVICE = process.env.USER_SERVICE || "//192.168.0.88:4017";
const R2LEARN_API = process.env.R2LEARN_API || "http://192.168.0.120:8085";

const AMQPLIB_PROTOCOL = process.env.AMQPLIB_PROTOCOL || "amqp.ts";
const AMQPLIB_HOSTNAME = process.env.AMQPLIB_HOSTNAME || "127.0.0.1";
const AMQPLIB_PORT = process.env.AMQPLIB_PORT || "5672";
const AMQPLIB_USERNAME = process.env.AMQPLIB_USERNAME || "admin";
const AMQPLIB_PASSWORD = process.env.AMQPLIB_PASSWORD || "admin";
const AMQPLIB_LOCALE = process.env.AMQPLIB_LOCALE || "en_US";
const AMQPLIB_FRAMEMAX = process.env.AMQPLIB_FRAMEMAX || "0";
const AMQPLIB_HEARTBEAT = process.env.AMQPLIB_HEARTBEAT || "0";
const AMQPLIB_VHOST = process.env.AMQPLIB_VHOST || "/";

const QUEUE_RESULT = process.env.QUEUE_RESULT || "result.top.pipeline;result.top.ping;result.top.listCommand;result.top.histgramPlot;result.top.etlBase;result.top.dataView;result.top.createNewVariable;result.top.correlationMatrix;result.top.univariatePlot;result.outlier.train;result.outlier.preTrainImportance;result.outlier.ping;result.outlier.outlierPlot;result.outlier.listCommand;result.outlier.etl;result.outlier.deploy;result.outlier.applyWeights;result.clustering.train;result.clustering.ssPlot;result.clustering.preTrainImportance;result.clustering.ping;result.clustering.listCommand;result.clustering.etlOutlier;result.clustering.etl;result.clustering.doOutlier;result.clustering.deploy;result.clustering.applyWeights;result.clfreg.univariatePlot;result.clfreg.train;result.clfreg.preTrainImportance;result.clfreg.permutationImportance;result.clfreg.etl;result.clfreg.deploy;result.correlation.train;result.multi.etl;result.multi.train;result.correlation.dataView;result.multi.deploy;result.multi.univariatePlot;result.multi.preTrainImportance;result.clfreg.pmml;";
const BACK_API_SERVICE = process.env.BACK_API_SERVICE || '//192.168.0.88:8081';
const IS_EN = process.env.IS_EN || false;
const YOUR_AGE = process.env.YOUR_AGE || '部署行数已达到出当前权限最大限制。';
const YOUR_MODEL = process.env.YOUR_MODEL || '您的建模数据量超出当前权限最大限制。';
const YOUR_USAGE = process.env.YOUR_USAGE || '您的并发项目数量已达到当前许可证的最大限制。。';
const SPLIT_COMMAND = process.env.SPLIT_COMMAND || false;
const STRAPI = process.env.STRAPI || '//192.168.0.23';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
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
  isEN: IS_EN,
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
  yourAge: YOUR_AGE,
  yourModel: YOUR_MODEL,
  yourUsage: YOUR_USAGE,
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
    USER_SERVICE,
    BACK_API_SERVICE,
    R2LEARN_API
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
  },
  splitCommand: SPLIT_COMMAND,
  STRAPI,
  STRAPI_TOKEN,
};

module.exports = config;
