import { redis } from '../redis';
import { Router } from 'express'
import uuid from 'uuid';
import moment from 'moment';
import command from '../command';
import _ from 'lodash';
import log4js from 'log4js';
import wss from '../webSocket';
import axios from 'axios';
import config from '../../config';
import { Metric, StatusData, AssociationOption } from '../types';
import { getSampleIndex } from './upload'
import { promised } from 'q';

const router = Router()

const { projectService, planService } = require("../apis/service");

const { restriction } = planService;
const esServicePath = config.services.ETL_SERVICE;

// const { userProjectRestriction, userConcurrentRestriction } = restriction;
const userLogger = log4js.getLogger('user');
const errorLogger = log4js.getLogger('error');

async function getDataByUrl(url) {
  const result = await axios.get(url);
  const data = result.data;

  return data
}

function getChartData(data) {
  let fitIndex = -1;
  let initialFitIndex = -1;
  if (data.roc) {
    const { Youden } = data.roc;
    if (Youden) {
      let max = -Infinity;
      initialFitIndex = 0;
      for (let i = 0; i < Object.keys(Youden).length; i++) {
        if (Youden[i] > max) {
          initialFitIndex = i;
          max = Youden[i];
        }
      }
      fitIndex = initialFitIndex;
    }
  }

  return { chartData: data, fitIndex, initialFitIndex };
}

async function parseNewChartData(url) {
  try {
    const result = await axios.get(url);
    const data = result.data;

    return getChartData(data);
  } catch (e) {
    console.log(e, 'error');
    return { chartData: url };
  }
}

async function query(key, offset, limit, userId) {
  const projectIdList = await projectService.list(userId) || [];
  const count = projectIdList.length;
  const result = { count, list: [] };
  const Field = ['id', 'name', 'createTime', 'updateTime', 'description', 'fileName', 'problemType', 'train2ing'];
  const Array = [];
  for (let r of projectIdList.splice(offset, limit)) {
    const project = await redis.hmget("project:" + r, Field);
    if (project[0] !== null) {
      Array.push(project);
    } else {
      await projectService.remove(r);
    }
  }

  Array.map((item: any) => {
    const obj = {};
    item.forEach((v, k) => {
      try {
        v = JSON.parse(v)
      } catch (e) { }
      obj[Field[k]] = v
    });
    result.list.push(obj)
  });

  return result;

}

export function createOrUpdate(id, userId, data, isCreate = false) {
  const promise = isCreate
    ? Promise.resolve({ status: 200, message: 'ok' })
    : checkProject(userId, id);
  return promise.then(checked => {
    if (checked.status === 444) return {
      status: 200,
      message: 'ok'
    };
    if (checked.status !== 200) return checked;
    const time = moment().unix();
    data.updateTime = time;
    if (isCreate) data.createTime = time;
    const params = mapObjectToArray(data);
    const pipeline = redis.pipeline();
    pipeline.hmset(`project:${id}`, params);
    pipeline.zadd(`user:${userId}:projects:updateTime`, time, id);
    if (isCreate) pipeline.zadd(`user:${userId}:projects:createTime`, time, id);
    return pipeline.exec().then(result => {
      Reflect.deleteProperty(data, 'stats')
      const err = result.find(([error]) => !!error);
      const returnValue = err
        ? {
          status: 411,
          message: (isCreate ? 'create' : 'update') + ' project error',
        }
        : {
          status: 200,
          message: (isCreate ? 'create' : 'update') + ' success',
          result: data,
          id,
        };
      wss.publish(`user:${userId}:projects`, { ...returnValue, isCreate });
      const logData = {
        userId,
        pid: id,
        params: JSON.stringify(data),
        message: `${returnValue.message}: ${id}`,
        time: moment().unix(),
      };
      if (err) errorLogger.error(logData);
      userLogger[err ? 'error' : 'info'](logData);
      return returnValue;
    });
  });
}

function createModel(userId, id, modelId, params) {
  const mid = uuid.v4();
  const pipeline = redis.pipeline();
  const saveData = { ...params, id: modelId, mid, createTime: moment().unix() };
  pipeline.hmset(`project:${id}:model:${modelId}`, mapObjectToArray(saveData));
  pipeline.sadd(`project:${id}:models`, modelId);
  return pipeline.exec().then(list => {
    Reflect.deleteProperty(saveData, 'stats')
    const err = list.find(([error]) => !!error);
    const data = err
      ? { status: 412, message: 'create model error' }
      : { status: 200, message: 'ok' };
    const result = { ...data, model: saveData, id };
    wss.publish(`user:${userId}:projects`, result);
    userLogger.info({
      userId,
      message: `create model: ${id}`,
      mid: id,
      time: moment().unix(),
    });
    return result;
  });
}

function updateModel(userId, id, mid, params) {
  return redis
    .hmset(`project:${id}:model:${mid}`, mapObjectToArray(params))
    .then(() => {
      Reflect.deleteProperty(params, 'stats')
      const result = {
        status: 200,
        message: 'ok',
        modelResult: { ...params, id: mid },
        id,
      };
      wss.publish(`user:${userId}:projects`, result);
      userLogger.info({
        userId,
        params: JSON.stringify(params),
        message: `update model: ${id}`,
        mid: id,
        time: moment().unix(),
      });
      return result;
    });
}

function getModelCount(id) {
  return redis.scard(`project:${id}:models`);
}

//change to move
export function deleteModels(userId, id) {
  return redis.smembers(`project:${id}:models`).then(ids => {
    const pipeline = redis.pipeline();
    ids.forEach(mid => {
      pipeline.sadd(`project:${id}:models:previous`, mid);
    });
    pipeline.del(`project:${id}:models`);
    return pipeline.exec().then(list => {
      const error = list.find(i => !!i[0]);
      if (error) {
        errorLogger.error({
          userId,
          message: 'delete models error',
          pid: id,
          time: moment().unix(),
        });
        userLogger.error({
          userId,
          message: 'delete models error',
          pid: id,
          time: moment().unix(),
        });
        return { status: 414, message: 'delete models error', error };
      }
      userLogger.warn({
        userId,
        message: 'delete models success',
        pid: id,
        time: moment().unix(),
      });
      // if (error) return { status: 414, message: 'delete models error', error };
      return {
        status: 200,
        message: 'ok',
      };
    });
  });
}

// // real delete
// export function deleteModels(userId, id) {
//   const selPipeline = redis.pipeline();
//   selPipeline.smembers(`project:${id}:models`);
//   selPipeline.smembers(`project:${id}:models:previous`);

//   return selPipeline.exec().then(([[nowError, nowIds], [oldError, oldIds]]) => {
//     if (nowError || oldError)
//       return {
//         status: 414,
//         message: 'delete models error',
//         error: nowError || oldError,
//       };
//     const pipeline = redis.pipeline();
//     [...nowIds, ...oldIds].forEach(mid => {
//       pipeline.del(`project:${id}:model:${mid}`);
//     });
//     pipeline.del(`project:${id}:models`);
//     pipeline.del(`project:${id}:models:previous`);
//     return pipeline.exec().then(list => {
//       const error = list.find(i => !!i[0]);
//       if (error) {
//         errorLogger.error({
//           userId,
//           message: 'delete models error',
//           pid: id,
//           time: moment().unix(),
//         });
//         userLogger.error({
//           userId,
//           message: 'delete models error',
//           pid: id,
//           time: moment().unix(),
//         });
//         return { status: 414, message: 'delete models error', error };
//       }
//       userLogger.warn({
//         userId,
//         message: 'delete models success',
//         pid: id,
//         time: moment().unix(),
//       });
//       return {
//         status: 200,
//         message: 'ok',
//       };
//     });
//   });
// }

function deleteProject(userId, id) {
  return checkProject(userId, id).then(err => {
    if (err.status === 444) return {
      status: 200,
      me4ssage: 'ok'
    }
    if (err.status !== 200) return err;

    const oIndexPromise = getProjectField(id, 'originalIndex')
    const eIndexPromise = getProjectField(id, 'etlIndex')

    const promise = Promise.all([oIndexPromise, eIndexPromise]).then(([oIndex, eIndex]) => {
      const arr = []
      if (oIndex) arr.push(deleteEsIndex(oIndex))
      if (eIndex) arr.push(deleteEsIndex(eIndex))
      return Promise.all(arr)
    })

    return promise.then(() => {
      const pipeline = redis.pipeline();
      pipeline.del(`project:${id}`);
      pipeline.zrem(`user:${userId}:projects:updateTime`, id);
      pipeline.zrem(`user:${userId}:projects:createTime`, id);
      return pipeline.exec().then(async list => {
        const error = list.find(i => !!i[0]);
        if (error) {
          errorLogger.error({
            userId,
            message: 'delete project error',
            pid: id,
            time: moment().unix(),
          });
          userLogger.error({
            userId,
            message: 'delete project error',
            pid: id,
            time: moment().unix(),
          });
          return { status: 415, message: 'delete project error', error };
        }
        userLogger.warn({
          userId,
          message: 'delete project success',
          pid: id,
          time: moment().unix(),
        });
        wss.publish(`user:${userId}:projects`, {
          status: 200,
          message: `delete project success`,
          result: { exist: false },
          id,
        });
        await projectService.remove(id);
        return deleteModels(userId, id);
      });
    })
  });
}

function checkProject(userId, id) {
  const Field = ['id', 'userId', 'name', 'createTime', 'updateTime', 'description', 'fileName']
  return redis.hmget(`project:${id}`, Field).then(async result => {
    const data = Field.reduce((prev, value, key) => {
      prev[value] = JSON.parse(result[key])
      return prev
    }, {} as {
      id: string | null,
      userId: string | null,
      name: string | null,
      createTime: string | null,
      updateTime: string | null,
      description: string | null,
      fileName: string | null
    })
    if (!data.id) {
      errorLogger.error({
        userId,
        message: `project:${id} has been deleted`,
        pid: id,
        time: moment().unix(),
      });
      return { status: 444, message: `project:${id} has been deleted` };
    }

    const plist = await projectService.list(userId) || [];

    if (!plist.includes(id)) {
      errorLogger.error({
        userId,
        message: `project:${id} ${!data.userId ? 'delete' : 'error'}`,
        pid: id,
        time: moment().unix(),
      });
      userLogger.error({
        userId,
        message: `project:${id} ${!data.userId ? 'delete' : 'error'}`,
        pid: id,
        time: moment().unix(),
      });
      console.error(
        `user:${userId}, project:${id} ${!data.userId ? 'delete' : 'error'}`,
      );
      return { status: 421, message: 'project error' };
    }

    // if (data.userId !== userId) {
    //   errorLogger.error({
    //     userId,
    //     message: `project:${id} ${!data.userId ? 'delete' : 'error'}`,
    //     pid: id,
    //     time: moment().unix(),
    //   });
    //   userLogger.error({
    //     userId,
    //     message: `project:${id} ${!data.userId ? 'delete' : 'error'}`,
    //     pid: id,
    //     time: moment().unix(),
    //   });
    //   console.error(
    //     `user:${userId}, project:${id} ${!data.userId ? 'delete' : 'error'}`,
    //   );
    //   return { status: 421, message: 'project error' };
    //   // return {}
    // }
    return { status: 200, message: 'ok', data };
  });
}

const checkTraningRestriction = user => {
  return new Promise((resolve, reject) => {
    // let level
    // try {
    //   level = parseInt(user.level, 10)
    // } catch (e) {
    //   return reject({ message: "modeling error", status: -2 })
    // }
    const duration = moment.duration(moment().unix() - user.createdTime);
    const restrictQuery = `user:${
      user.id
      }:duration:${duration.years()}-${duration.months()}:training`;
    return redis.get(restrictQuery).then(async count => {
      const { userProjectRestriction } = await restriction();
      if (count >= userProjectRestriction[user.level]) {
        errorLogger.error({
          userId: user.id,
          message: `Your usage of "Number of Training" has reached the max restricted by your current license.`,
          time: moment().unix(),
        });
        userLogger.error({
          userId: user.id,
          message: `Your usage of "Number of Training" has reached the max restricted by your current license.`,
          time: moment().unix(),
        });
        return reject({
          status: -4,
          message:
            'Your usage of "Number of Training" has reached the max restricted by your current license.',
          error: 'project number exceed',
        });
      }
      redis.incr(restrictQuery);
      resolve();
    });
  });
};

function sendToCommand(data, progress) {
  return command(data, result => {
    return result.status < 0 || result.status === 100
      ? result
      : progress(result);
  });
}

function getFileInfo(files) {
  if (!files)
    return Promise.resolve({
      status: 200,
      message: 'ok',
      csvLocation: null,
      ext: null,
    });
  const pipeline = redis.pipeline();
  files.forEach(f => pipeline.get(`file:${f}`));
  return pipeline.exec().then(list => {
    const error = list.find(i => !!i[0]);
    if (error) return error;
    const csvLocation = [];
    const ext = [];
    const fileNames = [];
    for (let n = 0; n < list.length; n++) {
      let file = list[n][1];
      if (!file) continue;
      try {
        file = JSON.parse(file);
      } catch (e) { }
      if (!file.path || !file.name) continue;
      fileNames.push(file.name);
      csvLocation.push(file.path);
      const fileext = file.name.split('.').pop();
      ext.push('.' + fileext);
    }
    if (!csvLocation.length) return { status: 416, message: 'file not exist' };
    return {
      status: 200,
      message: 'ok',
      csvLocation,
      ext,
      fileNames,
    };
  });
}

function updateProjectField(id, userId, field, data) {
  const key = 'project:' + id;
  return redis.hget(key, field).then(result => {
    try {
      result = JSON.parse(result);
    } catch (e) { }
    if (Array.isArray(data) || Array.isArray(result)) {
      data = [...new Set([...(result || []), ...(data || [])])];
    } else if (typeof data === 'object' || typeof result === 'object') {
      data = Object.assign({}, result || {}, data || {});
    }
    return redis.hset(key, field, JSON.stringify(data)).then(() => {
      const returnValue = {
        status: 200,
        message: 'ok',
        id,
        result: { [field]: data },
      };
      userLogger.info({
        userId,
        pid: id,
        message: 'update project field success',
        params: JSON.stringify({ [field]: data }),
        time: moment().unix(),
      });
      wss.publish(`user:${userId}:projects`, returnValue);
      return returnValue;
    });
  });
}

export function getProjectField(id, field) {
  const key = 'project:' + id;
  return redis.hget(key, field).then(result => {
    try {
      result = JSON.parse(result);
    } catch (e) { }
    return result;
  });
}

function getProjectFields(id, fields) {
  const key = 'project:' + id;
  return redis.hmget(key, fields).then(result => {
    const res = _.chain(fields)
      .map((value, index) => {
        return [value, JSON.parse(result[index])];
      })
      .fromPairs()
      .value();
    return res;
  });
}

async function getBaseEtl(id) {
  const data = await getProjectFields(id, [
    'etlIndex',
    'target',
    'problemType',
    'dataHeader',
    'colType',
    'stats',
    'targetUnique',
  ]);
  const { etlIndex, target, problemType, dataHeader, colType, stats, targetUnique } = data;
  const command = problemType === 'MultiClassification' ? 'multi.etl' : 'top.etlBase'
  const colMap = _.chain(stats)
    .entries()
    .filter(([, metric]: [string, Metric]) =>
      metric.type === 'Categorical'
    )
    .reduce((prev, [key, metric]: [string, Metric]) => {
      prev[key] = _.reduce(
        metric.categoricalMap,
        (p, r, index) => {
          p[r.key] = index;
          return p;
        },
        {},
      );
      return prev;
    }, {})
    .value();
  const classNames = !target ? [] : stats[target].type !== 'Categorical' ? [] : stats[target].categoricalMap.map(v => v.key)
  const etlData: {
    command: string,
    csvLocation: string[],
    problemType: string,
    featureLabel: string[],
    colType: { [key: string]: string },
    colMap: { [key: string]: Metric },
    targetLabel: string[],
    classificationType: number,
    classNames: string[]
  } = {
    command,
    csvLocation: [etlIndex],
    problemType,
    featureLabel: dataHeader,
    colType,
    colMap,
    targetLabel: [],
    classificationType: targetUnique,
    classNames
  };
  if (target) etlData.targetLabel.push(target)
  return etlData
}

async function checkEtl(projectId, userId) {
  const hasSendEtl = await getProjectField(projectId, 'hasSendEtl');

  if (!hasSendEtl) {
    const etl = await getBaseEtl(projectId);

    await command({
      ...etl,
      ...{
        projectId,
        userId,
        requestId: uuid.v4(),
      },
    }).then(() => {
      userLogger.info({
        userId,
        pid: projectId,
        message: 'command etl success',
        time: moment().unix(),
      });
      return createOrUpdate(projectId, userId, { hasSendEtl: true });
    });
  }
}

function getProject(projectId) {
  return redis.hgetall('project:' + projectId).then(p => {
    Reflect.deleteProperty(p, 'stats')
    Object.keys(p).forEach(key => {
      try {
        p[key] = JSON.parse(p[key]);
      } catch (e) { }
    });

    return {
      status: 200,
      message: 'ok',
      project: p
    }
  });
}

function deleteEsIndex(index) {
  const sampleIndex = getSampleIndex()
  if (!sampleIndex.includes(index)) axios.delete(`${esServicePath}/etls/${index}`)
  // return axios.delete(`${esServicePath}/etls/${index}`).then(result => {
  console.log(`delete index: ${index}`)
  return {
    status: 200,
    message: 'ok'
  }
  // })
}

wss.register('initProject', async (message, socket) => {
  const { id } = message
  return getProject(id)
})

wss.register('addProject', async (message, socket) => {
  // const { userId, user } = socket.session
  // const { createdTime } = user
  // const duration = moment.duration(moment().unix() - createdTime)
  // const startTime = moment.unix(createdTime).add({ years: duration.years(), months: duration.months() })
  // const endTime = moment.unix(createdTime).add({ years: duration.years(), months: duration.months() + 1 })
  // const projects = await redis.zrevrangebyscore(`user:${userId}:projects:createTime`, endTime.unix(), startTime.unix())
  const { userId } = socket.session;
  const counts = await redis.zcard(`user:${userId}:projects:createTime`);
  const { userConcurrentRestriction } = await restriction();
  if (counts >= userConcurrentRestriction[socket.session.user.level]) {
    errorLogger.error({
      userId,
      message:
        'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
      time: moment().unix(),
    });
    return {
      status: 408,
      message:
        'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
      error:
        'Your usage of number of concurrent project has reached the max restricted by your current lisense.',
    };
  }
  const id = await redis.incr('node:project:count');

  projectService.add(userId, id);
  // const { result } = await command({ command: "create", projectId: id.toString(), userId, requestId: message._id }, null, true)
  return createOrUpdate(id, userId, { id, userId }, true);
});

wss.register('updateProject', (message, socket) => {
  const { userId } = socket.session;
  const data = Object.assign({}, message);
  const { id } = data;
  // delete data.id
  Reflect.deleteProperty(data, 'id');
  // delete data._id
  Reflect.deleteProperty(data, '_id');
  // delete data.type
  Reflect.deleteProperty(data, 'type');
  // data.userId = userId
  Reflect.deleteProperty(data, 'userId');

  return checkProject(userId, id).then(err => {
    if (err.status === 444) return {
      status: 200,
      me4ssage: 'ok'
    }
    if (err.status !== 200) return err;
    return createOrUpdate(id, userId, data);
  });
});

wss.register('deleteProjects', (message, socket) => {
  const { userId } = socket.session;
  const { ids } = message;
  const array = [];
  ids.map(id => {
    array.push(deleteProject(userId, id));
  });
  return Promise.all(array).then(list => {
    const error = _.find(list, (i = {}) => i.status !== 200);
    if (error) return error;
    return {
      status: 200,
      message: 'ok',
    };
  });
});

wss.register('queryProjectList', (message, socket) => {
  const { userId } = socket.session;
  const { limit = 10, offset = 0, sort } = message;

  const key = `user:${userId}:projects:${
    sort === 'createTime' ? 'createTime' : 'updateTime'
    }`;

  // const params = ['+inf', '-inf'];

  // if (limit) params.push('limit', offset, limit);

  return query(key, offset, limit, userId).then(result => {
    return {
      status: 200,
      message: 'ok',
      ...result,
    };
  });
});

wss.register('queryProject', (message, socket) => {
  const { userId } = socket.session;
  const { id } = message;
  const key = `project:${id}`;

  return redis.hgetall(key).then(result => {
    for (let key in result) {
      try {
        result[key] = JSON.parse(result[key]);
      } catch (e) { }
    }
    if (result.userId !== userId) return { status: 420, message: 'error' };
    return {
      status: 200,
      message: 'ok',
      data: result,
    };
  });
});

wss.register('queryModelList', (message, socket, process) => {
  const { id } = message;
  return queryModelList(id, process);
});

wss.register('dataView', (message, socket, progress) => {
  return createOrUpdate(message.projectId, socket.session.userId, {
    dataViewsLoading: true,
  }).then(() =>
    command(
      { ...message, userId: socket.session.userId, requestId: message._id },
      async progressResult => {
        let lock = false;
        const { status, result } = progressResult;
        if (status === 1) {
          if (!lock) {
            const { name, value } = result;
            lock = true;
            if (name === 'progress')
              await createOrUpdate(message.projectId, socket.session.userId, {
                dataViewProgress: value,
              });
            setTimeout(() => (lock = false), 500);
          }
        }
        if (status < 0 || status === 100) return progressResult;
        return null;
      },
      true,
    ).then(async (returnValue: any) => {
      const { status, result } = returnValue;
      if (status === 100) {
        const { result: updateResult } = await updateProjectField(
          message.projectId,
          socket.session.userId,
          'newVariableViews',
          result,
        );
        await createOrUpdate(message.projectId, socket.session.userId, {
          dataViewsLoading: false,
          dataViewProgress: 0,
        });
        if (updateResult && updateResult.newVariableViews)
          returnValue.result.data = updateResult.newVariableViews;
      }
      return returnValue;
    }),
  );

  // sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
});

wss.register('preTrainImportance', async (message, socket, progress) => {
  const { userId } = socket.session;
  const { projectId } = message;

  return getProjectField(projectId, 'preImportanceLoading')
    .then(loading => {
      if (loading) return;
    })
    .then(() =>
      createOrUpdate(message.projectId, socket.session.userId, {
        preImportanceLoading: true,
      }),
    )
    .then(() => checkEtl(projectId, userId))
    .then(() =>
      command(
        { ...message, userId: socket.session.userId, requestId: message._id },
        async progressResult => {
          let lock = false;
          const { status, result } = progressResult;
          if (status === 1) {
            if (!lock) {
              const { name, value } = result;
              lock = true;
              if (name === 'progress')
                await createOrUpdate(message.projectId, socket.session.userId, {
                  importanceProgress: value,
                });
              setTimeout(() => (lock = false), 500);
            }
          }
          if (status < 0 || status === 100) return progressResult;
          return null;
        },
        true,
      )
        // .then(() => sendToCommand({ ...message, userId: socket.session.userId, requestId: message._id }, progress)
        .then((returnValue: any) => {
          const { status, result } = returnValue;
          const promise = [];
          if (status === 100) {
            result.informativesLabel = result.informativesLabel || [];
            result.preImportance = result.data;
          }
          promise.push(
            status === 100
              ? createOrUpdate(
                message.projectId,
                socket.session.userId,
                {
                  preImportance: result.data
                }
              )
              : Promise.resolve({}),
          );
          promise.push(
            status === 100
              ? createOrUpdate(
                message.projectId,
                socket.session.userId,
                {
                  informativesLabel: result.informativesLabel
                }
              )
              : Promise.resolve({}),
          );
          promise.push(
            createOrUpdate(message.projectId, socket.session.userId, {
              preImportanceLoading: false,
              importanceProgress: 0,
            }),
          );
          return Promise.all(promise).then(() => {
            return returnValue;
          });
        }),
    );
});

wss.register('histgramPlot', (message, socket, progress) => {
  const { projectId: id, _id: requestId, feature_label } = message;
  const { userId } = socket.session;
  const histgramPlots = feature_label.reduce((start, f) => {
    start[f] = '';
    return start;
  }, {});
  return updateProjectField(id, userId, 'histgramPlots', histgramPlots).then(
    () =>
      command(
        { ...message, userId, requestId },
        progressResult => {
          if (progressResult.status < 0 || progressResult.status === 100) {
            updateProjectField(id, userId, 'histgramPlots', histgramPlots);
            return progressResult;
          }
          const { result } = progressResult;
          const { field, Data, progress: status } = result;
          if (status && status === 'start') return;
          if (histgramPlots.hasOwnProperty(field)) histgramPlots[field] = Data;
          return progress(progressResult);
        },
        true,
      ),
  );
});

wss.register('rawHistgramPlot', (message, socket, progress) => {
  const { projectId: id, _id: requestId, feature_label } = message;
  const { userId } = socket.session;
  const histgramPlots = feature_label.reduce((start, f) => {
    start[f] = '';
    return start;
  }, {});
  return updateProjectField(id, userId, 'rawHistgramPlots', histgramPlots).then(
    () =>
      command(
        { ...message, userId, requestId },
        progressResult => {
          if (progressResult.status < 0 || progressResult.status === 100) {
            updateProjectField(id, userId, 'rawHistgramPlots', histgramPlots);
            return progressResult;
          }
          const { result } = progressResult;
          const { field, imageSavePath, progress: status } = result;
          if (status && status === 'start') return;
          if (histgramPlots.hasOwnProperty(field))
            histgramPlots[field] = imageSavePath;
          return progress(progressResult);
        },
        true,
      ),
  );
});

wss.register('univariatePlot', (message, socket, progress) => {
  const { projectId: id, _id: requestId, feature_label } = message;
  const { userId } = socket.session;
  const univariatePlots = feature_label.reduce((start, f) => {
    start[f] = '';
    return start;
  }, {});
  return updateProjectField(
    id,
    userId,
    'univariatePlots',
    univariatePlots,
  ).then(() =>
    command(
      { ...message, userId, requestId },
      progressResult => {
        if (progressResult.status < 0 || progressResult.status === 100) {
          updateProjectField(id, userId, 'univariatePlots', univariatePlots);
          return progressResult;
        }
        const { result } = progressResult;
        const { field, Data, progress: status = '' } = result;
        if (status === 'start') return;
        if (univariatePlots.hasOwnProperty(field))
          univariatePlots[field] = Data;
        return progress(progressResult);
      },
      true,
    ),
  );
});

const _sendToCommand = (message, socket, progress) =>
  sendToCommand(
    {
      ...message,
      userId: socket.session.userId,
      requestId: message._id,
    },
    progress,
  );

// wss.register('chartData', _sendToCommand)
// wss.register('fitPlotAndResidualPlot', _sendToCommand)
// wss.register('pointToShow', _sendToCommand)
wss.register('createNewVariable', async (message, socket, progress) => {
  const { userId } = socket.session;
  const { projectId } = message;
  await checkEtl(projectId, userId);
  const returnValue: any = await _sendToCommand(message, socket, progress);
  const { status, result } = returnValue;
  if (status === 100) {
    const { resultData } = result;
    await createOrUpdate(projectId, userId, { newVariablePath: resultData });
  }
  return returnValue;
});

wss.register('abortTrain', (message, socket) => {
  const { projectId, _id: requestId, stopId, isModeling } = message;
  const { userId } = socket.session;
  return getProjectField(projectId, 'stopIds').then((stopIds = []) => {
    if (!stopIds.length) return { status: 200, message: 'ok' };
    if (!stopIds.includes(stopId)) return { status: 200, message: 'ok' };
    return axios
      .get(
        `${config.services.BACK_API_SERVICE}/putRunTask?data=${JSON.stringify([
          { ...message, userId, requestId, stopId },
        ])}`,
      )
      .then(async () => {
        command.clearListener(stopId);
        userLogger.warn({
          userId,
          pid: projectId,
          params: JSON.stringify({ stopId }),
          message: `abort train: ${stopId}`,
          time: moment().unix(),
        });
        const trainModel = await getProjectField(projectId, 'trainModel');
        Reflect.deleteProperty(trainModel, stopId);
        const curStopIds = stopIds.filter(si => si !== stopId);
        const statusData: StatusData = {
          trainModel,
          stopIds: curStopIds,
        };
        // const modelCounts = await getModelCount(projectId);
        if (!curStopIds.length) {
          statusData.trainModel = {};
          statusData.stopIds = [];
          statusData.train2Finished = true
          statusData.train2ing = false
          // if (isModeling && !modelCounts) {
          //   statusData.mainStep = 3;
          //   statusData.curStep = 3;
          //   statusData.lastSubStep = 1;
          //   statusData.subStepActive = 1;
          // }
        }
        return createOrUpdate(projectId, userId, statusData);
      });
    // return command(, () => {

    // }, true)
  });
});

wss.register('train', async (message, socket, progress) => {
  const { userId, user } = socket.session;
  const { projectId, data: updateData, version, algorithms, algo } = message;
  // delete message.data
  Reflect.deleteProperty(message, 'data');
  // 拆分algorithms
  Reflect.deleteProperty(message, 'version');
  Reflect.deleteProperty(message, 'algorithms');
  // const stopId = uuid.v4()
  // const data = { ...message, userId, requestId, stopId: requestId };
  let curModel = 0;
  try {
    await checkTraningRestriction(user);

    const commandArr = [];
    const _stopIds = [];

    const splitCommand = config.splitCommand;

    if (splitCommand) {
      if (!!version) {
        const versions = (version || '').split(',');
        versions.forEach(_v => {
          if (_v === '3') {
            const stopId = uuid.v4();
            _stopIds.push(stopId);
            commandArr.push({
              ...message,
              version: _v,
              algorithms: algorithms,
              userId,
              stopId,
              requestId: stopId,
            });
            // algorithms.forEach(al => {
            //   const stopId = uuid.v4()
            //   _stopIds.push(stopId)
            //   commandArr.push({
            //     ...message,
            //     version: _v,
            //     algorithms: [al],
            //     userId,
            //     stopId,
            //     requestId: stopId
            //   })
            // })
          } else {
            const stopId = uuid.v4();
            _stopIds.push(stopId);
            commandArr.push({
              ...message,
              version: _v,
              userId,
              stopId,
              requestId: stopId,
            });
          }
        });
      } else {
        if (!!algorithms && !!algorithms.length) algorithms.forEach(al => {
          const stopId = uuid.v4();
          _stopIds.push(stopId);
          commandArr.push({
            ...message,
            algorithms: [al],
            userId,
            stopId,
            requestId: stopId,
          });
        });
        else {
          const stopId = uuid.v4();
          commandArr.push({
            ...message,
            userId,
            requestId: stopId,
            stopId,
            version,
            algorithms,
          });
          _stopIds.push(stopId);
        }
      }
    } else {
      const stopId = uuid.v4();
      commandArr.push({
        ...message,
        userId,
        requestId: stopId,
        stopId,
        version,
        algorithms,
      });
      _stopIds.push(stopId);
    }

    if (!commandArr.length) return { status: 200, msg: 'ok' };

    commandArr.forEach(___co => {
      userLogger.info({
        userId,
        pid: projectId,
        command: JSON.stringify(___co),
        stopId: ___co.stopId,
        message: `start train: ${___co.stopId}`,
        time: moment().unix(),
      });
    });

    await createOrUpdate(projectId, userId, {
      ...updateData,
      stopIds: _stopIds,
    });
    if (!algo) {
      await checkEtl(projectId, userId);
    } else {
      await deleteModels(userId, projectId)
    }
    console.log('finish etl');

    const processFn = async queueValue => {
      const stopIds = await getProjectField(projectId, 'stopIds') || [];
      const { status, result, requestId: trainId, abort } = queueValue;
      if (abort) return { isAbort: true };
      if (status < 0 || status === 100) {
        await createOrUpdate(projectId, userId, { stopIds: stopIds.filter(s => s !== trainId) });
        userLogger.info({
          userId,
          pid: projectId,
          stopId: trainId,
          message: `train finished: ${trainId}`,
          time: moment().unix(),
        });
        return { ...queueValue, isAbort: false };
      }
      // if (!stopIds.includes(trainId)) {
      //   userLogger.warn({
      //     userId,
      //     pid: projectId,
      //     stopId: trainId,
      //     message: `train aborted: ${trainId}`,
      //     time: moment().unix(),
      //   });
      //   return { isAbort: true };
      // }
      if (!result) return;
      let processValue;
      if (result.name === 'progress') {
        // const { requestId: trainId } = result;
        // delete result.requestId
        // Reflect.deleteProperty(result, 'requestId')
        await updateProjectField(projectId, userId, 'trainModel', {
          [trainId]: { ...result, requestId: trainId },
        });

        // const trainModel = await getProjectField(projectId, 'trainModel')
        // await createOrUpdate(projectId, userId, { trainModel: result })
        processValue = { ...result };
      } else if (result.score) {
        curModel++
        const {
          chartData: chartDataUrl,
          holdoutChartData: holdoutChartDataUrl,
          accuracyData: accuracyDataUrl,
          modelName,
        } = result;
        const trainModel = await getProjectField(projectId, 'trainModel');
        Reflect.deleteProperty(trainModel, trainId);
        await createOrUpdate(projectId, userId, { trainModel });
        let chartData = { chartData: chartDataUrl };
        let holdoutChartData = { chartData: holdoutChartDataUrl };
        let accuracyData = accuracyDataUrl;
        if (chartDataUrl) chartData = await parseNewChartData(chartDataUrl);
        if (holdoutChartDataUrl) holdoutChartData = await parseNewChartData(holdoutChartDataUrl);
        if (accuracyData) accuracyData = await getDataByUrl(accuracyData);
        const stats = await getProjectField(projectId, 'stats');
        const modelData = {
          ...result,
          ...chartData,
          ...{ holdoutChartData: holdoutChartData.chartData },
          accuracyData,
          stats,
          featureLabel: message.featureLabel.filter(f => !message.targetLabel.includes(f)),
          target: message.targetLabel,
          esIndex: message.esIndex,
          settingId: message.settingId
        };
        if (message.problemType) modelData.problemType = message.problemType;
        if (message.standardType) modelData.standardType = message.standardType;
        if (modelData.rate) modelData.initRate = modelData.rate;
        processValue = await createModel(
          userId,
          projectId,
          modelName,
          modelData,
        );
      }
      return progress(processValue);
    };
    console.log(`project: ${projectId} train start, command: ${_stopIds.length}`)

    const commandRes = await Promise.all(
      commandArr.map(_ca => command(_ca, processFn, true)),
    );
    const statusData: {
      train2Finished: boolean,
      train2ing: boolean,
      train2Error: boolean,
      trainModel: unknown,
      selectId: string,
      stopIds: string[],
      mainStep?: number,
      curStep?: number,
      lastSubStep?: number,
      subStepActive?: number,
    } = {
      train2Finished: true,
      train2ing: false,
      train2Error: false,
      trainModel: {},
      selectId: '',
      stopIds: [],
    };

    let abortCount = 0, errorCount = 0, finishCount = 0
    commandRes.forEach((cm: any) => {
      if (cm.isAbort) abortCount++
      else cm.status < 0 ? errorCount++ : finishCount++
    })
    const modelCounts = await getModelCount(projectId);

    console.log(`project: ${projectId} train finished, models: ${curModel}\nall command: ${_stopIds.length} ,finish: ${finishCount}, abort: ${abortCount}, error: ${errorCount}`)

    userLogger.info({
      userId,
      pid: projectId,
      message: `train finished, models: ${curModel}\nall command: ${_stopIds.length} ,finish: ${finishCount}, abort: ${abortCount}, error: ${errorCount}`,
      time: moment().unix(),
    });

    if (modelCounts < 1 && curModel < 1) {
      if (errorCount > 0) {
        statusData.train2Error = true;
        commandRes.forEach((cm: any) => {
          if (!cm.isAbort && cm.status < 0) {
            console.error(cm.result['processError'])
            userLogger.error({
              userId,
              pid: projectId,
              message: cm.result['processError'],
              time: moment().unix(),
            })
          }
        })
      } else {
        statusData.mainStep = 3;
        statusData.curStep = 3;
        statusData.lastSubStep = 1;
        statusData.subStepActive = 1;
      }
    }

    return await createOrUpdate(projectId, userId, statusData);
  } catch (err) {
    const statusData = {
      train2Finished: false,
      train2ing: false,
      train2Error: false,
      selectId: '',
      mainStep: 3,
      curStep: 3,
      lastSubStep: 1,
      subStepActive: 1,
    };
    await createOrUpdate(projectId, userId, statusData);
    return err;
  }
});
wss.register('watchProjectList', (message, socket) => {
  const { userId } = socket.session;
  const key = `user:${userId}:projects`;
  wss.subscribe(
    key,
    data => {
      try {
        data = JSON.parse(data);
      } catch (e) { }
      return data;
    },
    socket,
  );

  return {
    status: 200,
    message: 'ok',
    id: key,
  };
});

wss.register('testPub', (message, socket) => {
  return updateProjectField('1', socket.session.userId, 'colType', {});
});

wss.register('inProject', (message, socket) => {
  const { userId } = socket.session;
  const { id, broadcastId } = message;
  (wss as any).clients.forEach(client => {
    if (client === socket) return;
    if (client.session && client.session.userId === userId)
      client.send(
        JSON.stringify({
          id,
          broadcastId,
          type: 'inProject',
        }),
      );
  });
});

wss.register('updateModel', (message, socket) => {
  const { userId } = socket.session;
  const { projectId } = message;
  const { data, id: mid } = message;
  return updateModel(userId, projectId, mid, data);
});

wss.register('permutationImportance', (message, socket) => {
  const { userId } = socket.session;
  const { projectId, id: mid, command: commandText, _id: requestId } = message;
  return updateModel(userId, projectId, mid, { importanceLoading: true }).then(
    () =>
      command(
        {
          command: commandText,
          projectId,
          solution: mid,
          userId,
          requestId,
        },
        progressValue => {
          const { result, status } = progressValue;
          if (status < 0 || status === 100) return progressValue;
          const { name, model, featureImportance } = result;
          if (name === 'progress') return;
          if (model === mid)
            return updateModel(userId, projectId, mid, {
              featureImportance,
              importanceLoading: false,
            });
        },
        true,
      ),
  );
});

wss.register('outlierPlot', (message, socket) => {
  const { userId } = socket.session;
  const {
    projectId,
    id: mid,
    command: commandText,
    _id: requestId,
    featureList,
    randomSeed,
  } = message;

  return updateModel(userId, projectId, mid, { outlierPlotLoading: true }).then(
    () =>
      command(
        {
          command: commandText,
          projectId,
          solution: mid,
          userId,
          requestId,
          featureList,
          randomSeed,
        },
        progressValue => {
          const { status, result } = progressValue;
          // console.log(progressValue, 'progressValue')
          if (status < 0 || status === 100) return progressValue;
          const { name, action } = result;
          if (name === 'progress') return;
          if (action === 'outlierPlot') {
            const { outlierPlotData, featureList } = result;
            return updateModel(userId, projectId, mid, {
              outlierPlotLoading: false,
              outlierPlotData,
              featureList,
            });
          }
        },
        true,
      ),
  );
  // .then(returnValue => {
  //   const { result, status } = returnValue
  //   if (status < 0) return result
  //   const { outlierPlotData, featureList } = result
  //   return updateModel(userId, projectId, mid, { outlierPlotLoading: false, outlierPlotData, featureList })
  // })
});

wss.register('correlationMatrix', (message, socket) => {
  const { projectId, _id, command: _command, featureLabel } = message;
  const { userId } = socket.session;
  return createOrUpdate(projectId, userId, {
    correlationMatrixLoading: true,
  }).then(() => checkEtl(projectId, userId))
    .then(() => command({
      command: _command,
      projectId,
      requestId: _id,
      featureLabel,
      userId
    }, progressValue => {
      const { status } = progressValue
      if (status < 0 || status === 100) return progressValue
    })).then(returnValue => {
      const { status, result } = returnValue
      if (status < 0) return returnValue
      return createOrUpdate(projectId, userId, {
        correlationMatrixLoading: false,
        correlationMatrixData: result.correlationMatrixData
      })
    })
})

function queryModelList(id: any, process: any) {
  const key = `project:${id}:models`;
  return redis.smembers(key).then(ids => {
    let promise: Promise<void> = Promise.resolve();
    ids.forEach(modelId => {
      const curPromise: Promise<void> = new Promise(async (resolve) => {
        try {
          const result = await redis.hgetall(`project:${id}:model:${modelId}`);
          const model = Object.entries(result).reduce((prev: {}, [key, value]: [string, string]) => {
            prev[key] = JSON.parse(value);
            return prev;
          }, {});
          process({
            status: 200,
            message: 'ok',
            model,
          });
        }
        catch (e) {
          process({
            status: 417,
            message: `init model ${modelId} failed`
          });
        }
        resolve();
      });
      promise = promise.then(() => curPromise);
    });
    return promise.then(() => ({
      status: 200,
      message: 'ok'
    }));
  });
}

function mapObjectToArray(obj) {
  const arr = [];
  Object.entries(obj).forEach(([k, v]) => {
    if (!k || v === null || v === undefined) return;
    if (typeof k !== 'string') return;
    if (typeof v === 'function') return;
    arr.push(k, JSON.stringify(v));
  });
  return arr;
}

wss.register('getFiles', (message, socket) => {
  return getFileInfo(message.files);
});

wss.register('getSample', (message, socket) => {
  const { problemType } = message
  const type = (problemType === 'Classification' && 'C') || (problemType === 'Regression' && 'R') || (problemType === 'Clustering' && 'U') || (problemType === 'Outlier' && 'O')
  if (!type || (type !== 'C' && type !== 'R' && type !== 'U' && type !== 'O')) return [];
  return redis.smembers(`file:${type}:samples`).then(result => {
    const list = result.map(r => {
      try {
        r = JSON.parse(r);
      } catch (e) { }
      return r;
    });
    return { list };
  });
});

wss.register('checkProject', (message, socket) => {
  const userId = socket.session.userId;
  const id = message.id;
  return checkProject(userId, id);
});

wss.register('fetchData', async (message, socket) => {
  // const userId = socket.session.userId
  const path = message.path;
  return await axios.get(path);
});

wss.register('ssPlot', async (message, socket, progress) => {
  const { userId } = socket.session;

  await checkEtl(message.projectId, userId);
  return command(
    {
      ...message,
      userId,
      requestId: message._id,
    },
    progressValue => {
      const { status } = progressValue;
      if (status < 0 || status === 100) return progressValue;
      return progress(progressValue);
    },
    true,
  ).then(async (returnValue: any) => {
    const { status, result } = returnValue;
    if (status === 100)
      await createOrUpdate(message.projectId, userId, { ssPlot: result });
    return returnValue;
  });
});

wss.register('getOutlierData', (message, socket, progress) => {
  const { id: mid, projectId, rate, esIndex } = message
  const _rate = Math.round((+rate) * 1000)
  return redis.hget(`project:${projectId}:model:${mid}`, 'outlierData').then((outlierUrl: string) => {
    if (!outlierUrl) return []
    outlierUrl = JSON.parse(outlierUrl)
    return axios.get(outlierUrl).then(result => {
      if (result.status !== 200) return []
      const { data, index } = result.data
      const count = Math.min(index[_rate / 1000], 500)
      let list = data.slice(0, count)
      // for (let i = 1; i <= _rate; i++) {
      //   const index = (i / 1000).toString()
      //   if (list.length + data[index].length > max) {
      //     list = list.concat(data[index].slice(0, max - list.length))
      //     break;
      //   }
      //   list = list.concat(data[index])
      // }
      if (!list.length) return list
      return axios.post(`${esServicePath}/etls/${esIndex}/terms`, { nos: list.toString() }).then(rowsResult => {
        if (rowsResult.status !== 200) return []
        try {
          return list.map(i => rowsResult.data.result.find(r => r.__no === i))
        } catch (e) {
          return []
        }
      })
    })
  }).then(_list => {
    return {
      status: 200,
      message: 'ok',
      list: _list
    }
  })
})

wss.register('createPmml', async (message, socket) => {
  const { id, projectId, _id, command: _command } = message
  const { userId } = socket.session
  await updateModel(userId, projectId, id, { getPmml: true })

  const returnValue: any = await command({
    command: _command,
    projectId,
    userId,
    version: id,
    requestId: _id
  }, progressValue => {
    console.log(progressValue, 'progressValue')
    const { status } = progressValue
    if (status < 0 || status === 100) return progressValue
  })
  const { status, result } = returnValue
  if (status === 100) await updateModel(userId, projectId, id, { pmmlData: result.pmmlData })
  return returnValue
})

wss.register('deleteIndex', (message, socket) => {
  const { index, projectId } = message
  const { userId } = socket.session;

  return checkProject(userId, projectId).then(checked => {
    const { status } = checked
    if (status !== 200) {
      if (status === 444) return {
        status: 200,
        message: 'ok'
      }
      return checked
    }
    return deleteEsIndex(index)
  })
})

wss.register('getAssociationData', (message, socket, progress) => {
  const { index, featureLabel, id, _id } = message
  const { userId } = socket.session;

  return command({
    command: 'correlation.dataView',
    projectId: id,
    userId,
    featureLabel,
    csvLocation: [index],
    requestId: _id,
    plotNum: 100
  }, (processValue) => {
    const { status } = processValue
    if (status < 0 || status === 100) return processValue
  }).then((result: any) => {
    const { status, result: { dataView, parameter, plotData } } = result
    if (status !== 100) return result
    const associationView = {
      view: {
        average: dataView.average_length,
        max: dataView.max_length,
        min: dataView.min_length,
        total: dataView.total_items,
        users: dataView['total_transactions/users']
      },
      plot: plotData
    }
    const associationOption = {
      type: 'fptree',
      fptree: {
        support: parameter.support_threshold,
        confidence: parameter.confidence_threshold,
        lift: parameter.min_lift,
        length: parameter.max_length
      },
      apriori: {
        support: parameter.min_support,
        confidence: parameter.min_confidence,
        lift: parameter.min_lift,
        length: parameter.max_length
      },
    }
    return createOrUpdate(id, userId, { associationOption, associationView, associationOrigin: associationOption })
  })
})

router.get('/export', (req, res) => {
  const { id, sign } = req.query

  if (sign !== config.EXPORT_SECRET) return res.status(400).json({
    status: 400,
    message: 'auth error'
  })

  return redis.hgetall('project:' + id).then(p => {
    const project = {
      colType: JSON.parse(p.colType || '""'),
      colMap: JSON.parse(p.colMap || '""'),
      rawDataView: JSON.parse(p.rawDataView || '""'),
      nullFillMethod: JSON.parse(p.nullFillMethod || '""'),
      mismatchFillMethod: JSON.parse(p.mismatchFillMethod || '""'),
      outlierFillMethod: JSON.parse(p.outlierFillMethod || '""'),
      featureLabel: JSON.parse(p.dataHeader || '""'),
      targetLabel: [JSON.parse(p.target || '""')],
      problemType: JSON.parse(p.problemType || '""'),
      mapHeader: JSON.parse(p.mapHeader || '""'),
      cutoff: {}
    }
    let promise = Promise.resolve()
    if (project.problemType === 'Classification') promise = queryModelList(id, result => {
      const { status, model } = result
      if (status !== 200) return
      const { chartData, fitIndex, id } = model
      const { roc: { Threshold } } = chartData
      project.cutoff[id] = Threshold[fitIndex]
    });

    return promise.then(() => {
      return res.json({
        status: 100,
        message: 'ok',
        data: project
      })
    })
  })
})


export default router
