import { redis } from '../redis';
import wss from '../webSocket';
import moment from 'moment';
import scheduleApi from '../scheduleApi';
import deploy from '../schedule';
import _ from 'lodash';
import config = require('../../config');
import axios from 'axios';
import { originalStats } from './etl'
const esServicePath = config.services.ETL_SERVICE;

const fetchDeployments = userId => () =>
  redis
    .zrange(`user:${userId}:deployments:createdDate`, 0, -1)
    .then(deploymentIds => {
      const pipeline = redis.pipeline();
      _.map(deploymentIds, deploymentId =>
        pipeline.get(`deployment:${deploymentId}`),
      );
      return pipeline.exec();
    })
    .then(
      results => {
        const list = _.map(results, result => JSON.parse(result[1]));
        return { list, status: 200, message: 'ok', type: 'watchDeployments' };
      },
      error => {
        console.error(error);
        return {
          status: 500,
          message: 'search deployments error',
          error,
          type: 'watchDeployments',
        };
      },
    );

wss.register('watchSchedule', (message, socket) => {
  const { userId } = socket.session;
  const callback = list => ({
    status: 200,
    message: 'ok',
    list,
    type: 'watchSchedule',
  });
  wss.subscribe(
    `user:${userId}:schedules`,
    () => scheduleApi.getAllSchedule(userId).then(callback),
    socket,
  );
  return scheduleApi.getAllSchedule(userId).then(callback);
});

wss.register('watchDeployments', (message, socket) => {
  const { userId } = socket.session;
  wss.subscribe(`user:${userId}:deployments`, fetchDeployments(userId), socket);
  return fetchDeployments(userId)();
});

wss.register('addDeployment', (message, socket) => {
  const { userId } = socket.session;
  const createdDate = moment().unix();
  return redis.incr('deploymentId').then(id => {
    const pipeline = redis.pipeline();
    const data = {
      ...message.data,
      id,
      userId,
      createdDate,
    };
    pipeline.set(`deployment:${id}`, JSON.stringify(data));
    pipeline.zadd(`user:${userId}:deployments:createdDate`, createdDate, id);
    return pipeline.exec().then(
      () => {
        wss.publish(`user:${userId}:deployments`, { type: 'add', data });
        return { id, status: 200, message: 'ok' };
      },
      error => {
        console.error(error);
        return { status: 500, message: 'add deployment error', error };
      },
    );
  });
});

wss.register('deploySchedule', message =>
  scheduleApi
    .getDeployment(message.deploymentId)
    .then(deployment => deploy(deployment, message.threshold))
    .then(() => ({ status: 200, message: 'ok' })),
);

wss.register('suspendDeployment', (message, socket) => { });

wss.register('removeDeployment', (message, socket) => {
  const pipeline = redis.pipeline();
  pipeline.zrem(
    `user:${socket.session.userId}:deployments:createdDate`,
    message.id,
  );
  pipeline.del(`deployment:${message.id}`);
  return pipeline
    .exec()
    .then(result => {
      wss.publish(
        `user:${socket.session.userId}:deployments`,
        `remove deployment:${message.id}`,
      );
      return scheduleApi.deleteDeploymentSchedules(message.id);
    })
    .then(() => ({ status: 200, message: 'ok' }));
});

wss.register('updateDeployment', (message, socket) => {
  const { userId } = socket.session;
  const { data } = message;
  scheduleApi.getDeployment(data.id).then(deployment =>
    redis
      .set(`deployment:${data.id}`, JSON.stringify({ ...deployment, ...data }))
      .then(
        () => {
          wss.publish(`user:${userId}:deployments`, { type: 'add', data });
          return { status: 200, message: 'ok' };
        },
        error => {
          console.error(error);
          return { status: 500, message: 'update deployment error', error };
        },
      ),
  );
});

wss.register('getAllModels', async message => {
  const { projectId, modelType } = message;
  const currModelIds = await redis.smembers(`project:${projectId}:models`);
  // delete models
  // const prevModelIds = await redis.smembers(
  //   `project:${projectId}:models:previous`,
  // );
  const prevModelIds = []
  const modelIds = [...currModelIds, ...prevModelIds];
  const pipeline = redis.pipeline();
  let resultCount = 2;
  _.forEach(modelIds, modelId => {
    if (modelType === 'Classification') {
      pipeline.hmget(
        `project:${projectId}:model:${modelId}`,
        'modelName',
        'score',
        'settingId',
        'chartData',
        'fitIndex',
      );
      resultCount = 4;
    } else {
      pipeline.hmget(
        `project:${projectId}:model:${modelId}`,
        'modelName',
        'score',
        'settingId',
      );
    }
  });
  const modelsResult = await pipeline.exec();
  const models = _.reduce(
    modelsResult,
    (prev, curr, index) => {
      const _result = [...prev];
      if (curr[0])
        throw { status: 500, message: 'model query failed', error: curr[0] };
      if (!curr[1] || curr[1].length < resultCount) return void 0;
      const score = JSON.parse(curr[1][1]);
      const settingId = JSON.parse(curr[1][2]);
      let performance;
      if (modelType === 'Classification') {
        const auc = (score.validateScore || {}).auc;
        const chartData = JSON.parse(curr[1][3]);
        const fitIndex = JSON.parse(curr[1][4]);
        const notShowArr = [
          'AUCROC',
          'AUCPR',
          'FN',
          'FP',
          'FPR',
          'F_BETA',
          'TN',
          'TP',
          'TPR',
          'Youden',
          'Threshold',
        ];
        performance = [
          `AUC:${auc && auc.toFixed && auc.toFixed(3)}`,
          ..._.chain(chartData.roc)
            .entries()
            .filter(d => !notShowArr.includes(d[0]))
            .map(([k, v]) => {
              const value = v[fitIndex];
              return `${k}:${value && value.toFixed && value.toFixed(3)}`;
            })
            .value(),
        ].join('\r\n');
      } else {
        performance = _.chain(score.validateScore || score)
          .entries()
          .map(([k, v]) => `${k}:${v && v.toFixed && v.toFixed(3)}`)
          .join('\r\n')
          .value();
      }
      _result.push({
        name: JSON.parse(curr[1][0]),
        score,
        modelId: modelIds[index],
        performance,
        settingId
      });
      return _result;
    },
    [],
  );
  const settings = JSON.parse(
    await redis.hget(`project:${projectId}`, 'settings'),
  );
  const result = _.reduce(
    settings,
    (prev, curr) => {
      const _result = { ...prev };
      _result[curr.name] = models.filter(m => m.settingId === curr.id)
      // curr.models.map(name =>
      //   _.find(models, model => model.name === name),
      // );
      return _result;
    },
    {},
  );
  return { modelList: result };
});

wss.register('getProjectDeployment', async (message, socket) => {
  const { projectId } = message;
  return fetchDeployments(socket.session.userId)().then(response => {
    if (response.status !== 200) return response;
    const deployment = _.find(response.list, d => d.projectId === projectId);
    if (deployment) return { ...response, deploymentId: deployment.id };
    return response;
  });
});

wss.register('updateDeploymentModel', async (message, socket) => {
  const { userId } = socket.session;
  const { deploymentId, modelName } = message;
  const deployment = JSON.parse(await redis.get(`deployment:${deploymentId}`));
  deployment.modelName = modelName;
  await redis.set(`deployment:${deploymentId}`, JSON.stringify(deployment));
  wss.publish(`user:${userId}:deployments`, { type: 'update model name' });
});


wss.register('getScheduleSummary', async (message) => {
  const { sid, pid } = message
  const result: any = {}
  try {
    const schedule = JSON.parse(await redis.get(`schedule:${sid}`))
    const { index, modelName, type, } = schedule
    const { data } = await axios.get(
      `${esServicePath}/etls/${index}/headerArray`,
    );
    const origin = await originalStats(index, data)
    if (origin.error) throw new Error(origin.message)

    const originResult = origin.result

    const modelStats = JSON.parse(await redis.hmget(`project:${pid}:model:${modelName}`, 'stats'))
    const featureLabel = JSON.parse(await redis.hmget(`project:${pid}:model:${modelName}`, 'featureLabel'))
    const target = JSON.parse(await redis.hmget(`project:${pid}:model:${modelName}`, 'target'))
    // const problemType = JSON.parse(await redis.hmget(`project:${pid}:model:${modelName}`, 'problemType'))

    const stats = featureLabel.reduce((prev, l) => {
      prev[l] = modelStats[l]
      return prev
    }, {})

    if (type === 'performance') {
      target.forEach(t => {
        stats[t] = modelStats[t]
      })
    }

    const {
      data: { totalFixedCount, deletedCount },
    } = await axios.post(
      `${esServicePath}/etls/${index}/fixedLines`,
      stats,
    );

    const { data: { count } } = await axios.get(
      `${esServicePath}/etls/${index}/count`
    );
    result.totalFixedCount = totalFixedCount
    result.deletedCount = deletedCount
    result.featureLabel = featureLabel
    result.colType = originResult.colType
    result.nullLineCounts = originResult.nullLineCounts
    result.mismatchLineCounts = originResult.mismatchLineCounts
    result.outlierLineCounts = originResult.outlierLineCounts
    result.dataView = originResult.rawDataView
    result.totalCount = count
    result.target = target
  } catch (e) {
    console.log(e, 'sss')
  }
  return { result }
})

export default {};
