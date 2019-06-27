import express from 'express';
import formidable from 'formidable';
import { redis } from '../redis';
import uuid from 'uuid';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import Papa from 'papaparse';
import http from 'http';
import command from '../command';
import scheduleApi from '../scheduleApi';
import Restriction from '../restriction';
import config from '../../config';
import axios from 'axios';
import _ from 'lodash';
import uploader from './uploader';

import { getProjectField } from './project';

const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'
const router = express.Router();
const { userModelingRestriction, userStorageRestriction } = Restriction;

router.post('/check', async (req, res) => {
  const { fileSize, type, projectId } = req.body;
  const { userId } = req.session;
  const host = JSON.parse(await redis.hget(`project:${projectId}`, 'host'));
  if (!fileSize || !userId || !type)
    return res.json({
      status: 404,
      message: 'missing params',
      error: 'missing params',
    });
  if (
    type === 'modeling' &&
    +fileSize >= userModelingRestriction[req.session.user.level]
  )
    return res.json({
      status: 416,
      message:
        'Your usage of modeling data size has reached the max restricted by your current license.',
      error: 'modeling file too large',
    });
  const size = await redis.get(`user:${userId}:upload`);
  if (+size + +fileSize >= userStorageRestriction[req.session.user.level])
    return res.json({
      status: 417,
      message:
        'Your usage of storage space has reached the max restricted by your current license.',
      error: 'storage space full',
    });
  const token = crypto
    .createHash('md5')
    .update(userId + type + fileSize + config.secret)
    .digest('hex');
  return res.json({
    status: 200,
    message: 'ok',
    token,
    host,
  });
});

router.post('/', (req, res) => {
  // console.log('upload nginx callback')
  const form = new formidable.IncomingForm();
  form.parse(req, function(error, fields, files) {
    const params = req.query;
    if (!params || !params.token || !params.userId || !params.type)
      return res.json({
        status: 404,
        message: 'missing params',
        error: 'missing params',
      });
    const validationToken = crypto
      .createHash('md5')
      .update(params.userId + params.type + params.fileSize + config.secret)
      .digest('hex');
    if (validationToken !== params.token)
      return res.json({
        status: 401,
        message: 'token error',
        error: 'token error',
      });
    if (error)
      return res.json({
        status: 500,
        message: 'upload error',
        error,
      });

    const _filename = fields.name.split('.');
    const fileId = uuid.v4();
    const csvLocation = [fields.path];
    const ext = ['.' + _filename[_filename.length - 1]];
    command(
      {
        command: 'csvMeta',
        requestId: fileId,
        userId: params.userId,
        projectId: params.projectId,
        csvLocation,
        computeLines: params.type === 'deploy',
        ext,
      },
      result => (result.status < 0 || result.status === 100) && result,
    ).then((result: any) => {
      const { lines: lineCount = 0 } = result.result;
      fields.name = decodeURIComponent(fields.name);
      fields.createdTime = moment().unix();
      fields.lineCount = lineCount;
      fields.from = 'upload.ts';
      fields.type = params.type;
      fields.params = params;
      fields.userId = params.userId;
      redis.set(`file:${fileId}`, JSON.stringify(fields));
      redis.incrby(`user:${params.userId}:upload`, +params.fileSize);
      res.json({ fileId, status: 200, message: 'ok' });
    });
    return undefined;
  });
});

router.post('/sample', (req, res) => {
  const { filename } = req.body;
  const { userId } = req.session;
  if (!filename || !userId)
    return res.json({
      status: 404,
      message: 'missing params',
      error: 'missing params',
    });
  redis.get(`file:sample:${filename}`, (err, data) => {
    if (err) return res.json({ status: 201, message: 'file error' });
    if (!data) return res.json({ status: 202, message: 'file not exist' });
    return res.json({ status: 200, message: 'ok', fileId: data });
  });
  return undefined;
});

router.get('/dataDefinition', async (req, res) => {
  const { userId } = req.session;
  const { projectId, type } = req.query;
  if (!userId)
    return res.json({
      status: 401,
      message: 'need login',
      error: 'need login',
    });
  const rank = await redis.zrank(
    `user:${userId}:projects:createTime`,
    projectId,
  );
  if (rank === null)
    return res.json({
      status: 404,
      message: 'project not found.',
      error: 'project not found.',
    });
  const data = JSON.parse(
    await redis.hget(`project:${projectId}`, 'dataHeader'),
  );
  const target = JSON.parse(await redis.hget(`project:${projectId}`, 'target'));
  const map = JSON.parse(await redis.hget(`project:${projectId}`, 'mapHeader'));
  res.attachment('definition.csv');
  res.type('csv');
  if (type && type === 'performance') res.send(data.map(i => map[i]).join(','));
  else
    return res.send(
      data
        .filter(h => h !== target)
        .map(i => map[i])
        .join(','),
    );
  return undefined;
});

router.get('/test', async (req, res) => {
  const { userId } = req.session;
  const { id: projectId } = req.query;
  const host = await redis.hget(`project:${projectId}`, 'host');
  res.json(host);
});

router.get('/reload', (req, res) => {
  saveSample();
  res.json({
    status: 100,
    msg: 'ok',
  });
});

async function saveSample() {
  const root = process.cwd();
  const samplePath = path.join(root, 'sample');

  if (!fs.existsSync(samplePath)) return console.log('sample not exist');
  // if (fs.existsSync(sampleFilePath)) {
  //   console.log("sample already exist")
  // } else {
  //   try {
  //     fs.symlinkSync(samplePath, sampleFilePath)
  //   } catch (e) { return console.log(e.message) }
  //   console.log("symlink create")
  // }
  const files = fs.readdirSync(samplePath);

  await redis.del(`file:C:samples`);
  await redis.del(`file:R:samples`);
  await redis.del(`file:U:samples`);
  await redis.del(`file:O:samples`);
  try {
    const promiseArr = files.map(async f => {
      const pipeline = redis.pipeline();
      const [type, target, name] = f.split('__');
      const filePath = path.join(samplePath, f);
      const id = uuid.v4();
      try {
        console.log('file:' + f + ' start');
        const {
          originalIndex,
          totalRawLines,
          rawHeader,
          fileSize,
        } = (await uploader(fs.createReadStream(filePath))) as any;
        const data = {
          id,
          name,
          createdTime: +new Date(),
          size: fileSize,
          ext: '.csv',
          target,
          index: originalIndex,
          lines: totalRawLines,
          header: rawHeader,
        };
        pipeline.sadd(`file:${type}:samples`, JSON.stringify(data));
        pipeline.set(`file:sample:${name}`, id);
        pipeline.set(`file:${id}`, JSON.stringify(data));
        await pipeline.exec();
        console.log('file:' + f + ' end');
      } catch (e) {
        console.error(e, `sample: ${f} error`);
      }
    });
    await Promise.all(promiseArr);
    console.log(`sample complete`);
  } catch (e) {
    console.error(e);
  }

  // pipeline.exec()
}

router.get('/download/result', async (req, res) => {
  const { filename, mid, type, projectId, etlIndex, target } = req.query;
  // const { userId } = req.session
  // const requestId = uuid.v4()

  const {
    data: { header: esHeader },
  } = await axios.get(`${esServicePath}/etls/${etlIndex}/headerArray`);

  const mapHeader = await getProjectField(projectId, 'mapHeader');

  const model = await redis.hgetall(`project:${projectId}:model:${mid}`);
  const { featureLabel } = model;
  const deployData = model[type + 'DeployData'];
  const header = [
    ...JSON.parse(featureLabel).filter(
      h => esHeader.includes(h) && h !== target,
    ),
    target,
  ];
  const url = JSON.parse(deployData);

  let temp = {};
  let counter = 0;
  let resultHeader;
  res.attachment(filename);
  res.type('csv');
  http.get(url, response => {
    Papa.parse(response, {
      download: true,
      header: true,
      step: async (results, parser) => {
        const row = results.data;
        if (!resultHeader) {
          resultHeader = [...header, ...Object.keys(row)].filter(
            key => key !== '__no',
          );
          const headerTexts = [
            ...header.map(h => mapHeader[h]),
            ...Object.keys(row).map(v =>
              v.startsWith(target) ? v.replace(target, mapHeader[target]) : v,
            ),
          ].filter(key => key !== '__no');
          res.write(Papa.unparse([headerTexts, []], { header: false }));
        }
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const _start = Math.min(...nos, row['__no']);
        const _end = Math.max(...nos, row['__no']);
        if (counter >= 500 || _end - _start >= 5000) {
          const start = Math.min(...nos);
          const end = Math.max(...nos);
          parser.pause();
          counter = 1;
          const response = await axios.get(
            `${esServicePath}/etls/${etlIndex}/preview?start=${start}&end=${end}`,
          );
          const result = response.data.result
            .filter(_r => !!temp[_r['__no']])
            .map(esRow =>
              resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])),
            );
          result.push([]);
          res.write(Papa.unparse(result, { header: false }));
          temp = { [row['__no']]: row };
          parser.resume();
        } else {
          temp[row['__no']] = row;
          counter++;
        }
      },
      complete: async (results, file) => {
        counter = 0;
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const response = await axios.get(
          `${esServicePath}/etls/${etlIndex}/preview?start=${Math.min(
            ...nos,
          )}&end=${Math.max(...nos)}`,
        );
        const result = response.data.result
          .filter(_r => !!temp[_r['__no']])
          .map(esRow =>
            resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])),
          );
        result.push([]);
        res.write(Papa.unparse(result, { header: false }));
        temp = {};
        res.end();
      },
    });
  });
  // downloadCsv(decodeURIComponent(url), decodeURIComponent(filename), etlIndex, header, res)
});

router.get('/download/model', async (req, res) => {
  const { filename, projectId, mid, etlIndex } = req.query;

  const {
    data: { header: esHeader },
  } = await axios.get(`${esServicePath}/etls/${etlIndex}/headerArray`);

  const mapHeader = await getProjectField(projectId, 'mapHeader');
  // http://192.168.0.83:8081/blockData?uid=1c40be8a70c711e9b6b391f028d6e331
  const model = await redis.hgetall(`project:${projectId}:model:${mid}`);
  const { featureLabel, deployData } = model;
  const header = JSON.parse(featureLabel).filter(h => esHeader.includes(h));
  const url = JSON.parse(deployData);

  let temp = {};
  let counter = 0;
  let resultHeader;
  res.attachment(filename);
  res.type('csv');
  http.get(url, response => {
    Papa.parse(response, {
      download: true,
      header: true,
      step: async (results, parser) => {
        const row = results.data;
        if (!resultHeader) {
          resultHeader = [...header, ...Object.keys(row)].filter(
            key => key !== '__no',
          );
          const headerTexts = [
            ...header.filter(key => key !== '__no').map(h => mapHeader[h]),
            ...Object.keys(row),
          ].filter(key => key !== '__no');
          res.write(Papa.unparse([headerTexts, []], { header: false }));
        }
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const _start = Math.min(...nos, row['__no']);
        const _end = Math.max(...nos, row['__no']);
        if (counter >= 500 || _end - _start >= 5000) {
          const start = Math.min(...nos);
          const end = Math.max(...nos);
          parser.pause();
          counter = 1;
          const response = await axios.get(
            `${esServicePath}/etls/${etlIndex}/preview?start=${start}&end=${end}`,
          );
          const result = response.data.result
            .filter(_row => !!temp[_row['__no']])
            .map(esRow =>
              resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])),
            );
          result.push([]);
          res.write(Papa.unparse(result, { header: false }));
          temp = { [row['__no']]: row };
          parser.resume();
        } else {
          temp[row['__no']] = row;
          counter++;
        }
      },
      complete: async (results, file) => {
        counter = 0;
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const response = await axios.get(
          `${esServicePath}/etls/${etlIndex}/preview?start=${Math.min(
            ...nos,
          )}&end=${Math.max(...nos)}`,
        );
        const result = response.data.result
          .filter(_row => !!temp[_row['__no']])
          .map(esRow =>
            resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])),
          );
        result.push([]);
        res.write(Papa.unparse(result, { header: false }));
        temp = {};
        res.end();
      },
    });
  });
});

router.get('/download/outlier', async (req, res) => {
  const { filename, mid, rate, projectId, etlIndex } = req.query;
  // const { userId } = req.session
  // const requestId = uuid.v4()

  const {
    data: { header: esHeader },
  } = await axios.get(`${esServicePath}/etls/${etlIndex}/headerArray`);

  const mapHeader = await getProjectField(projectId, 'mapHeader');
  const model = await redis.hgetall(`project:${projectId}:model:${mid}`);
  const { featureLabel, deployData } = model;
  const header = JSON.parse(featureLabel).filter(h => esHeader.includes(h));
  const url = JSON.parse(deployData);

  // let _rate = rate
  // try {
  //   _rate = parseFloat(rate)
  // } catch (e) { }

  let temp = {};
  let counter = 0;
  let resultHeader;
  res.attachment(filename);
  res.type('csv');
  http.get(url, response => {
    Papa.parse(response, {
      download: true,
      header: true,
      step: async (results, parser) => {
        const row = results.data;
        if (!resultHeader) {
          resultHeader = [...header, ...Object.keys(row)].filter(
            key => key !== '__no' && key !== 'decision_index',
          );
          const headerTexts = [
            ...header.map(_h => mapHeader[_h]),
            ...Object.keys(row),
          ].filter(key => key !== '__no' && key !== 'decision_index');
          res.write(
            Papa.unparse([[...headerTexts, 'predict_label'], []], {
              header: false,
            }),
          );
        }
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const _start = Math.min(...nos, row['__no']);
        const _end = Math.max(...nos, row['__no']);
        if (counter >= 500 || _end - _start >= 5000) {
          const start = Math.min(...nos);
          const end = Math.max(...nos);
          parser.pause();
          counter = 1;
          const response = await axios.get(
            `${esServicePath}/etls/${etlIndex}/preview?start=${start}&end=${end}`,
          );
          const result = response.data.result
            .filter(_row => !!temp[_row['__no']])
            .map(esRow => {
              const rowData = { ...esRow, ...temp[esRow['__no']] };
              const row = resultHeader.map(h => rowData[h]);
              const label = rowData.decision_index <= rate ? -1 : 1;
              row.push(label);
              return row;
            });
          result.push([]);
          res.write(Papa.unparse(result, { header: false }));
          temp = { [row['__no']]: row };
          parser.resume();
        } else {
          temp[row['__no']] = row;
          counter++;
        }
      },
      complete: async (results, file) => {
        counter = 0;
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const response = await axios.get(
          `${esServicePath}/etls/${etlIndex}/preview?start=${Math.min(
            ...nos,
          )}&end=${Math.max(...nos)}`,
        );
        const result = response.data.result
          .filter(_row => !!temp[_row['__no']])
          .map(esRow => {
            const rowData = { ...esRow, ...temp[esRow['__no']] };
            const row = resultHeader.map(h => rowData[h]);
            const label = rowData.decision_index <= rate ? -1 : 1;
            row.push(label);
            return row;
          });
        result.push([]);
        res.write(Papa.unparse(result, { header: false }));
        temp = {};
        res.end();
      },
    });
  });
});

// todo
// 500行分片下载还是有潜在bug
// 可以存在__no 的 end - start > 10000的状况 这个时候es会报错
// 最优方案还是将结果写入进es再下载
router.get('/download/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  const { filename } = req.query;
  // http://192.168.0.83:8081/blockData?uid=1c40be8a70c711e9b6b391f028d6e331
  const schedule = JSON.parse(await redis.get(`schedule:${scheduleId}`));
  const {
    data: { header },
  } = await axios.get(`${esServicePath}/etls/${schedule.etlIndex}/headerArray`);
  const deployment = await scheduleApi.getDeployment(schedule.deploymentId);
  const mapHeader = JSON.parse(
    await redis.hget(`project:${deployment.projectId}`, 'mapHeader'),
  );
  const target = JSON.parse(
    await redis.hget(`project:${deployment.projectId}`, 'target'),
  );
  // console.log(schedule.result.deployData)
  scheduleDownloadCsv(
    schedule.result.deployData,
    filename,
    schedule.etlIndex,
    header,
    mapHeader,
    res,
    target,
  );
});

function scheduleDownloadCsv(
  url,
  filename,
  index,
  header,
  mapHeader,
  res,
  target,
) {
  if( target ) header = [...header.filter(h => h !== target), target];
  let temp = {};
  let counter = 0;
  let resultHeader;
  res.attachment(filename);
  res.type('csv');
  http.get(url, response => {
    Papa.parse(response, {
      download: true,
      header: true,
      step: async (results, parser) => {
        const row = results.data;
        if (!resultHeader) {
          resultHeader = [...header, ...Object.keys(row)].filter(
            key => key !== '__no',
          );
          const headerTexts = [
            ...header.filter(key => key !== '__no').map(h => mapHeader[h]),
            ...Object.keys(row).map(v =>
              target && v.startsWith(target) ? v.replace(target, mapHeader[target]) : v
            )
          ].filter(key => key !== '__no')
          res.write(Papa.unparse([headerTexts, []], { header: false }));
        }
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const _start = Math.min(...nos, row['__no']);
        const _end = Math.max(...nos, row['__no']);
        if (counter >= 500 || _end - _start >= 5000) {
          const start = Math.min(...nos);
          const end = Math.max(...nos);
          parser.pause();
          counter = 1;
          const response = await axios.get(
            `${esServicePath}/etls/${index}/preview?start=${start}&end=${end}`,
          );
          const result = response.data.result.map(esRow =>
            resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])),
          );
          result.push([]);
          res.write(Papa.unparse(result, { header: false }));
          temp = { [row['__no']]: row };
          parser.resume();
        } else {
          temp[row['__no']] = row;
          counter++;
        }
      },
      complete: async (results, file) => {
        counter = 0;
        const nos = _.chain(temp)
          .keys()
          .map(_.toNumber)
          .value();
        const response = await axios.get(
          `${esServicePath}/etls/${index}/preview?start=${Math.min(
            ...nos,
          )}&end=${Math.max(...nos)}`,
        );
        const result = response.data.result.map(esRow =>
          resultHeader.map(h => ({ ...esRow, ...temp[esRow['__no']] }[h])),
        );
        result.push([]);
        res.write(Papa.unparse(result, { header: false }));
        temp = {};
        res.end();
      },
    });
  });
}

// saveSample()

export default router;
