import { redis } from './redis';
import wss from './webSocket';
import moment from 'moment';
import axios from 'axios';
import config from '../config';
import database, { uploadDatabase } from './routes/database'
import { DatabaseConfig } from './routes/databases';

const { restriction } = require("./apis/service/planService");
const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'
const setSchedule = schedule => {
  const pipeline = redis.pipeline();
  pipeline.set(`schedule:${schedule.id}`, JSON.stringify(schedule));

  // for getTimeUpSchedules
  pipeline.zrem(`scheduleTimeline`, schedule.id);
  schedule.status === 'waiting' &&
    pipeline.zadd(`scheduleTimeline`, schedule.estimatedTime, schedule.id);

  // for getLastWaitingSchedule
  pipeline.zrem(
    `deployment:${schedule.deploymentId}:scheduleTimeline:type:${schedule.type}`,
    schedule.id,
  );
  schedule.status === 'waiting' &&
    pipeline.zadd(
      `deployment:${schedule.deploymentId}:scheduleTimeline:type:${schedule.type}`,
      schedule.estimatedTime,
      schedule.id,
    );

  // for init users' all schedules
  pipeline.sadd(`user:${schedule.userId}:schedules`, schedule.id);

  // for getScheduleCount
  pipeline.sadd(
    `deployment:${schedule.deploymentId}:schedules:type:${schedule.type}`,
    schedule.id,
  );
  return pipeline;
};

const api = {
  getTimeUpSchedules: unixTime => {
    const pipeline = redis.pipeline();
    return redis
      .zrangebyscore('scheduleTimeline', '-inf', unixTime)
      .then(list => {
        list.map(id => pipeline.get(`schedule:${id}`));
        return pipeline
          .exec()
          .then(result =>
            result.map(
              ([error, deployment]) => error || JSON.parse(deployment),
            ),
          );
      });
  },
  upsertSchedule: schedule =>
    api.getDeployment(schedule.deploymentId).then(deployment => {
      if (!deployment) return;
      if (!schedule.userId) schedule.userId = deployment.userId;
      if (schedule.id)
        return setSchedule(schedule)
          .exec()
          .then(() =>
            wss.publish(
              `user:${schedule.userId}:schedules`,
              `upsert schedule:${schedule.id}`,
            ),
          );
      redis.incr('scheduleId').then(id => {
        schedule.id = id;
        return setSchedule(schedule)
          .exec()
          .then(() =>
            wss.publish(
              `user:${schedule.userId}:schedules`,
              `upsert schedule:${schedule.id}`,
            ),
          );
      });
    }),
  getDeployment: deploymentId =>
    redis
      .get(`deployment:${deploymentId}`)
      .then(deployment => JSON.parse(deployment)),
  updateDeployment: deployment => {
    redis.set(`deployment:${deployment.id}`, JSON.stringify(deployment)).then(
      result => {
        wss.publish(`user:${deployment.userId}:deployments`, {
          type: 'update',
        });
      },
      error => {
        console.error(error);
      },
    );
  },
  deleteDeploymentSchedules: deploymentId => {
    let _deployment;
    return api
      .getDeployment(deploymentId)
      .then(deployment => {
        _deployment = deployment;
        const pipeline = redis.pipeline();
        pipeline.smembers(
          `deployment:${deploymentId}:schedules:type:performance`,
        );
        pipeline.smembers(
          `deployment:${deploymentId}:schedules:type:deployment`,
        );
        return pipeline
          .exec()
          .then(result =>
            result.reduce((prev, curr) => prev.concat(curr[1]), []),
          );
      })
      .then(scheduleIds => {
        if (scheduleIds.length === 0) return;
        const pipeline = redis.pipeline();
        const delKeys = [
          `deployment:${deploymentId}:schedules:type:performance`,
          `deployment:${deploymentId}:schedules:type:deployment`,
          `deployment:${deploymentId}:scheduleTimeline:type:performance`,
          `deployment:${deploymentId}:scheduleTimeline:type:deployment`,
          ...scheduleIds.map(id => `schedule:${id}`),
        ];
        _deployment &&
          pipeline.srem(`user:${_deployment.userId}:schedules`, ...scheduleIds);
        pipeline.zrem(`scheduleTimeline`, ...scheduleIds);
        pipeline.del(delKeys);
        return pipeline.exec();
      });
  },
  getScheduleCount: (deploymentId, type) =>
    redis.scard(`deployment:${deploymentId}:schedules:type:${type}`),
  getLastWaitingSchedule: (deploymentId, type) =>
    redis
      .zrevrangebyscore(
        `deployment:${deploymentId}:scheduleTimeline:type:${type}`,
        '+inf',
        '-inf',
        'LIMIT',
        0,
        1,
      )
      .then(
        result =>
          result[0] && redis.get(`schedule:${result[0]}`).then(JSON.parse),
      ),
  getAllSchedule: userId =>
    redis
      .smembers(`user:${userId}:schedules`)
      .then(list => {
        const pipeline = redis.pipeline();
        list.map(id => pipeline.get(`schedule:${id}`));
        return pipeline.exec();
      })
      .then(result => result.map(([error, schedule]) => JSON.parse(schedule))),
  checkUserFileRestriction: async schedule => {
    const { deploymentId, type } = schedule;
    const deployment = await api.getDeployment(deploymentId);
    const userId = deployment.userId;
    const [level, createdTime] = await redis.hmget(
      `user:${userId}`,
      'level',
      'createdTime',
    );
    const duration = moment.duration(moment().unix() - createdTime);
    const restrictQuery = `user:${userId}:duration:${duration.years()}-${duration.months()}:deploy`;
    const options = deployment[`${type}Options`].sourceOptions;
    const source = deployment[`${type}Options`].source;
    const fileId =
      source === 'database'
        ? await api.getDatabaseData(options, schedule, async ({ count }) => {
          schedule.status = `${count} downloaded.`;
          await api.upsertSchedule(schedule);
        })
        : deployment[`${type}Options`].fileId;
    schedule.status = `checking user limitation.`;
    await api.upsertSchedule(schedule);
    const lineCount = await api.getLineCount(fileId);
    if (source === 'database') {
      deployment[`${type}Options`].fileId = fileId;
      deployment[`${type}Options`].file = `${
        options.databaseType
        }-${moment().unix()}`;
      await redis.set(`deployment:${deploymentId}`, JSON.stringify(deployment));
    }
    if (!fileId) return restrictQuery;
    const count = await redis.get(restrictQuery);
    const { userDeployRestriction } = await restriction();
    if (parseInt(count) + parseInt(lineCount) >= userDeployRestriction[level])
      return false;
    await redis.incrby(restrictQuery, lineCount);
    return restrictQuery;
  },
  decreaseLines: async (restrictQuery, lineCount) => {
    await redis.incrby(restrictQuery, -lineCount);
  },
  getCutOff: async (projectId, modelName) => {
    return redis.smembers(`project:${projectId}:models`).then(ids => {
      const pipeline = redis.pipeline();
      ids.forEach(mid => {
        pipeline.hmget(
          `project:${projectId}:model:${mid}`,
          'modelName',
          'fitIndex',
          'chartData',
        );
      });
      return pipeline.exec().then(list => {
        const models = list.map(row => {
          let [name, fitIndex, chartData] = row[1] || ([] as any);
          try {
            name = JSON.parse(name);
            fitIndex = JSON.parse(fitIndex);
            chartData = JSON.parse(chartData);
          } catch (e) { }
          return { name, fitIndex, chartData };
        });
        const model = models.find(m => m.name === modelName) || {};
        const cutoff = model.chartData.roc.Threshold[model.fitIndex || 0];
        return cutoff;
      });
    });
  },
  getRate: async (projectId, modelName) => {
    return redis.smembers(`project:${projectId}:models`).then(ids => {
      const pipeline = redis.pipeline();
      ids.forEach(mid => {
        pipeline.hmget(
          `project:${projectId}:model:${mid}`,
          'modelName',
          'rate',
        );
      });
      return pipeline.exec().then(list => {
        const models = list.map(row => {
          let [name, rate] = row[1] || ([] as any);
          try {
            name = JSON.parse(name);
            rate = JSON.parse(rate);
          } catch (e) { }
          return { name, rate };
        });
        const model = models.find(m => m.name === modelName) || {};
        const rate = model.rate;
        return rate;
      });
    });
  },
  getFeatureLabel: async projectId => {
    try {
      const newFeatureLabel = {};
      const fields = ['target', 'targetArray', 'colMap', 'renameVariable'];
      const values = await redis.hmget('project:' + projectId, fields);
      const obj: any = fields.reduce((start, k, index) => {
        let value = values[index];
        try {
          value = JSON.parse(value);
        } catch (e) { }
        start[k] = value;
        return start;
      }, {});
      const { target, targetArray, colMap, renameVariable } = obj;
      if (!target) return newFeatureLabel;
      const arr = !targetArray.length
        ? Object.keys((colMap || {})[target])
        : targetArray;
      if (!arr.length) return newFeatureLabel;
      arr.slice(0, 2).forEach((k, index) => {
        const rename = (renameVariable || {})[k];
        if (!!rename) newFeatureLabel[rename] = index;
      });
      return newFeatureLabel;
    } catch (e) {
      return {};
    }
  },
  getCleanIndex: async (schedule, index, projectId, modelName) => {


    return await etl(schedule, index, projectId, modelName);
  },

  getDatabaseData: async (message, schedule, progress) => {
    const databaseConfig: DatabaseConfig = {
      type: message.databaseType,
      host: message.sqlHostName,
      port: parseInt(message.sqlPort),
      user: message.sqlUserName,
      password: message.sqlPassword,
      database: message.sqlDatabase,
      table: message.sqlTable,
      sql: message.sqlQueryStr,
      encode: message.sqlEncoding,
      mapHeader: message.mapHeader
    };

    const { rawHeader, originalIndex } = await uploadDatabase(databaseConfig, progress)
    schedule.mapHeader = rawHeader
    api.upsertSchedule(schedule)
    return originalIndex
  },
  getLineCount: async index => {
    const { data } = await axios.get(`${esServicePath}/etls/${index}/count`);
    if (data.status !== 200) throw data;
    return data.count;
  },
  getFile: (id: any) => {
    return Promise.resolve(true);
  },
};

const etl = async (schedule, index, projectId, modelName) => {
  const result = await redis.hmget(
    `project:${projectId}:model:${modelName}`,
    'stats',
    'problemType',
    'featureLabel',
    'target'
  );
  const mapHeaderResult = await redis.hmget(`project:${projectId}`,
    'mapHeader')
  let [stats, problemType, featureLabel] = result;
  let [mapHeader] = mapHeaderResult
  mapHeader = JSON.parse(mapHeader)
  stats = JSON.parse(stats);
  featureLabel = JSON.parse(featureLabel)
  problemType = JSON.parse(problemType)

  const mappingResponse = await
    axios.get(`${esServicePath}/etls/${index}/header`)
  const dataHeader = mappingResponse.data.split(',')
  const headerArray = dataHeader.filter(h => h !== '__no')
  Object.keys(stats).forEach(key => {
    if (schedule.type === 'deployment' || problemType === 'Outlier' || problemType === 'Clustering') {
      if (stats[key].isTarget && headerArray.indexOf(key) === -1) return delete stats[key];
    }
    if (!stats[key].isTarget && featureLabel.indexOf(key) === -1) return delete stats[key]
    return true
  });
  const lackHeaders = Object.keys(stats).filter(key => headerArray.indexOf(key)
    === -1)
  if (lackHeaders.length > 0) {
    schedule.status = 'issue';
    schedule.updatedDate = moment().unix();
    schedule.result = {
      ['processError']: `column "${lackHeaders.map(k =>
        mapHeader[k]).join(',')}" not in data`
    };
    await api.upsertSchedule(schedule);
    return false
  }
  const response = await axios.post(
    `${esServicePath}/etls/${index}/etl`,
    stats,
  );
  const { etlIndex, opaqueId } = response.data;
  return await new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const { data } = await axios.get(
        `${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`,
      );
      if (data.task) {
        if (!data.task.status) return;
        const status = data.task.status;
        const progress =
          (100 * (status.created + status.deleted)) / status.total || 0;
        if (progress !== 0) {
          schedule.status = `ETL: ${progress.toFixed(2)}%`;
          await api.upsertSchedule(schedule);
        }
      } else {
        schedule.index = index;
        schedule.etlIndex = etlIndex;
        await api.upsertSchedule(schedule);
        clearInterval(interval);
        resolve(etlIndex);
      }
    }, 1000);
  });
};

export default api;
