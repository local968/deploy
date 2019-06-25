import { redis } from '../redis';
import moment from 'moment';
import express from 'express';
import uuid from 'uuid';
import crypto from 'crypto';
import command from '../command';
import api from '../scheduleApi';
import restriction from '../restriction';
import wss from '../webSocket';
import Papa from 'papaparse';
import config from '../../config';
import axios from 'axios';
import _ from 'lodash';

const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'
const router = express.Router();
const { userDeployRestriction } = restriction;

wss.register('getDeploymentToken', (message = {}, socket) => {
  if (!message.projectId || !message.deploymentId)
    return {
      status: 404,
      message: 'missing params',
      error: 'missing params',
    };
  const token = crypto
    .createHash('md5')
    .update(
      socket.session.userId +
      message.projectId +
      message.deploymentId +
      config.secret,
    )
    .digest('hex');
  return { status: 200, token };
});

router.post('/deploy', async (req, res) => {
  // x-www-form-urlencode
  const errorRes = error(res);

  // deployment
  const deploymentId = req.body.deploymentId;
  if (!deploymentId) return errorRes(10001);
  const deployment = await api.getDeployment(deploymentId);
  if (!deployment) return errorRes(10001);
  const { projectId, modelName, modelType, userId } = deployment;
  // const host = JSON.parse(await redis.hget(`project:${projectId}`, 'host'))
  let lineCount = 0;

  // token
  // todo token update( Oauth2?)
  const token = req.body.token;
  if (!token) return errorRes(10003);
  const validToken = crypto
    .createHash('md5')
    .update(userId + projectId + deploymentId + config.secret)
    .digest('hex');
  if (token !== validToken) return errorRes(10010);

  // data format
  const mapHeader = JSON.parse(await redis.hmget(`project:${projectId}`, 'mapHeader'))
  if (!req.body.data) return errorRes(10002);
  let data;
  let rawData;
  try {
    rawData = JSON.parse(req.body.data);
    lineCount = rawData.length;
  } catch (e) {
    return errorRes(10004);
  }
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0)
    return errorRes(10005);
  data = rawData.map((r, i) => {
    const row = {}
    Object.keys(r).forEach(key => {
      row[mapHeader.indexOf(key)] = r[key]
    })
    row['__no'] = i
    r['__no'] = i
    return row
  })
  data = Papa.unparse(data);
  if (lineCount > 10000 || data.length > 1024 * 1024 * 100)
    return errorRes(10012);

  const name = `api-deploy-${uuid.v4()}`;

  // upload
  let index;

  try {
    const createIndexResponse = await axios.get(
      `${esServicePath}/etls/createIndex`,
    );
    if (createIndexResponse.data.status !== 200) return errorRes(10016);
    index = createIndexResponse.data.index;
    const uploadResponse = await axios.request({
      url: `${esServicePath}/etls/${index}/upload`,
      headers: { 'Content-Type': 'text/plain' },
      method: 'POST',
      data,
    });
    if (uploadResponse.data.status !== 200) return errorRes(10007);
  } catch (e) {
    console.error(e);
    return errorRes(10006);
  }

  // etl
  let etlIndex;
  let target = 'target'
  let targetIndex = '0'
  try {
    const result = await redis.hmget(
      `project:${projectId}:model:${deployment.modelName}`,
      'stats',
    );
    let [stats] = result;
    stats = JSON.parse(stats);
    targetIndex = Object.keys(stats).find(key => stats[key].isTarget)
    target = mapHeader[Object.keys(stats).find(key => stats[key].isTarget)]
    delete stats[targetIndex]
    etlIndex = await etl(index, stats);
  } catch (e) {
    console.error(e);
    return errorRes(10016);
  }

  // check user level usage
  const [level, createdTime] = await redis.hmget(
    `user:${userId}`,
    'level',
    'createdTime',
  );
  const duration = moment.duration(moment().unix() - createdTime);
  const restrictQuery = `user:${userId}:duration:${duration.years()}-${duration.months()}:deploy`;
  const count = await redis.get(restrictQuery);
  const left = userDeployRestriction[level] - parseInt(count);
  if (_.parseInt(_.toString(lineCount)) >= left)
    return errorRes(
      10011,
      `Your remaining number of predictions this month: ${left} \nNumber of predictions you are attempting: ${lineCount} \nSorry but your attempt is refused.`,
    );
  await redis.incrby(restrictQuery, lineCount);

  // generate request
  const commandMap = {
    Clustering: 'clustering.deploy',
    Outlier: 'outlier.deploy',
    Classification: 'clfreg.deploy',
    Regression: 'clfreg.deploy',
  };
  const request = {
    requestId: name,
    projectId,
    userId,
    csvLocation: [etlIndex],
    ext: ['.csv'],
    command: commandMap[deployment.modelType],
    solution: deployment.modelName,
    actionType: 'deployment',
    cutoff: undefined,
    csvScript: undefined,
  };
  try {
    if (modelType === 'Classification')
      request.cutoff = await api.getCutOff(projectId, modelName);
  } catch (e) { }
  if (deployment.csvScript && deployment.csvScript !== '')
    request.csvScript = deployment.csvScript;
  let result = {
    deployData: undefined,
    message: undefined,
  };
  await command(request, (data = {}) => {
    result = { ...result, ...data.result };
    return data.status === 100 || data.status < 0;
  });

  // handle result
  if (result['processError']) {
    try {
      await api.decreaseLines(restrictQuery, lineCount);
      return errorRes(10008, result['processError']);
    } catch (e) { }
  }
  if (!result.deployData || result.deployData.length === 0)
    return errorRes(10009, result.message);

  let resultData;
  try {
    const deployResultResponse = await axios.get(result.deployData);
    if (!deployResultResponse.data || deployResultResponse.data.length === 0)
      return errorRes(10014);
    resultData = deployResultResponse.data;
  } catch (e) {
    console.error(e);
    return errorRes(10013);
  }

  res.json({
    result: combineResult(rawData, resultData, target, targetIndex),
    code: 10000,
    message: 'ok',
  });
});

const combineResult = (source, result, target, targetIndex) => {
  return source.map(s => {
    s = Object.assign({}, s, result.find(r => r.__no === s.__no))
    const row = {}
    Object.keys(s).forEach(key => {
      if (key === '__no') return
      if (key.startsWith(targetIndex)) {
        row[key.replace(targetIndex, target)] = s[key]
        return
      }
      row[key] = s[key]
    })
    return row
  })
}

const etl = async (index, stats) => {
  const response = await axios.post(
    `${esServicePath}/etls/${index}/etl`,
    stats,
  );
  const { etlIndex, opaqueId } = response.data;
  return new Promise(resolve => {
    const interval = setInterval(async () => {
      const { data } = await axios.get(
        `${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`,
      );
      if (data.task) {
        if (!data.task.status) return;
      } else {
        clearInterval(interval);
        resolve(etlIndex);
      }
    }, 1000);
  });
};

const error = res => (code, error?) => {
  if (!res) return;
  if (!code) return;
  res.json({
    code,
    message: errors[code],
    error: error ? error : errors[code],
  });
};

const errors = {
  10001: 'deployment not found',
  10002: 'data not found',
  10003: 'token not found',
  10004: 'data is not a valid JSON string',
  10005: 'data is empty or not a valid array',
  10006: 'file upload error',
  10007: 'file upload failed',
  10008: 'predict error',
  10009: 'predict failed',
  10010: 'invalid token',
  10011: 'exceed prediction usage limit',
  10012: 'exceed prediction api limit',
  10013: 'download predict result failed',
  10014: 'predict result is empty',
  10015: 'file not exist',
  10016: 'create index failed',
  10017: 'etl failed',
};

export default router;
