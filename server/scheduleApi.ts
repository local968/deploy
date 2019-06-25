import { redis } from './redis';
import wss from './webSocket';
import moment from 'moment';
import axios from 'axios';
import config from '../config';
import restriction from './restriction';
const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'
const { userDeployRestriction, userStorageRestriction } = restriction;
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
        ? await api.getDatabaseData(options, async ({ count }) => {
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
          } catch (e) {}
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
          } catch (e) {}
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
        } catch (e) {}
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
    const result = await redis.hmget(
      `project:${projectId}:model:${modelName}`,
      'stats',
    );
    let [stats] = result;
    stats = JSON.parse(stats);

    return await etl(schedule, index, stats);
  },

  getDatabaseData: async (message, onProgress) => {
    const databaseConfig = {
      type: message.databaseType,
      host: message.sqlHostName,
      port: parseInt(message.sqlPort),
      user: message.sqlUserName,
      password: message.sqlPassword,
      database: message.sqlDatabase,
      table: message.sqlTable,
      sql: message.sqlQueryStr,
      encode: message.sqlEncoding,
    };

    const indexResponse = await axios.get(`${esServicePath}/etls/createIndex`);
    if (indexResponse.data.status !== 200) return indexResponse.data;
    const index = indexResponse.data.index;

    const uploadResponse = await axios.post(
      `${esServicePath}/etls/database/${index}/upload`,
      databaseConfig,
    );
    if (uploadResponse.data.status !== 200) return uploadResponse.data;
    const opaqueId = uploadResponse.data.opaqueId;

    return await new Promise((resolve, reject) => {
      let emptyCount = 0;
      const interval = setInterval(async () => {
        const countReponse = await axios.get(
          `${esServicePath}/etls/${index}/count`,
        );
        if (countReponse.data.status === 200)
          onProgress({ count: countReponse.data.count });
        const { data } = await axios.get(
          `${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`,
        );
        if (data.task) emptyCount = 0;
        else {
          emptyCount++;
          if (emptyCount > 10) {
            clearInterval(interval);
            // await redis.incrby(`user:${userId}:upload`, parseInt(size))
            resolve(index);
          }
        }
      }, 1000);
    });
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

const etl = async (schedule, index, stats) => {
  if (schedule.type === 'deployment') {
    Object.keys(stats).forEach(key => {
      if (stats[key].isTarget) delete stats[key];
    });
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
        schedule.status = `ETL: ${progress.toFixed(2)}%`;
        await api.upsertSchedule(schedule);
      } else {
        schedule.status = `Progressing`;
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
