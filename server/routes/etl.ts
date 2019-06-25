import wss from '../webSocket';
import { redis } from '../redis';
import axios from 'axios';
import config from '../../config';
import _ from 'lodash';
import { Metric, Project, ProjectRedisValue } from '../types';
import { createOrUpdate, deleteModels } from './project';

const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'

wss.register('correlation', async (message, socket) => {
  const project = await getProject(message);
  const { userId } = socket.session;
  if (project.userId !== userId) return { status: 420, message: 'error' };

  const keys = _.chain(project.colType)
    .entries()
    .filter(([, value]) => value === 'Numerical')
    .map(([key]) => key)
    .toString();
  const { data } = await axios.get(
    `${esServicePath}/etls/${project.etlIndex}/correlationMatrix?keys=${keys}`,
  );
  return data;
});

wss.register('originalStats', async (message, socket) => {
  const { userId } = socket.session;
  const { index, projectId } = message;
  try {
    const { data } = await axios.get(`${esServicePath}/etls/${index}/stats`);
    // fs.writeFile('response.json', JSON.stringify(data), { flag: 'a' }, () => { })
    const colType = {};
    const colMap = {};
    const colValueCounts = {};
    const rawDataView = {};
    const nullLineCounts = {};
    const mismatchLineCounts = {};
    const outlierLineCounts = {};
    const will_be_drop_500_lines = [];
    _.chain(data)
      .entries()
      .forEach(([key, metric = {}]: [string, Metric]) => {
        const {
          originalStats = {},
          type,
          originalCategoricalMap = {},
        } = metric;
        const stats = originalStats;
        colType[key] = type;
        colMap[key] = _.reduce(
          originalCategoricalMap,
          (prev, b, index) => {
            prev[b.key] = index;
            return prev;
          },
          {},
        );
        colValueCounts[key] = _.reduce(
          originalCategoricalMap,
          (prev, b) => {
            prev[b.key] = b.doc_count;
            return prev;
          },
          {},
        );
        rawDataView[key] = _.assign(stats, { std: stats.std_deviation });
        const issue = stats.numerical || {};
        nullLineCounts[key] = issue.missingValue || 0;
        mismatchLineCounts[key] = issue.mismatch || 0;
        outlierLineCounts[key] = issue.outlierCount || 0;
      });
    const result: Project = {
      colType,
      colMap,
      colValueCounts,
      rawDataView,
      nullFillMethod: {},
      nullIndex: {},
      mismatchFillMethod: {},
      mismatchIndex: {},
      outlierFillMethod: {},
      outlierIndex: {},
      totalFixedLines: 0,
      nullLineCounts,
      mismatchLineCounts,
      outlierLineCounts,
      will_be_drop_500_lines,
      stats: data,
      originalIndex: index,
      nullLineCountsOrigin: nullLineCounts,
      mismatchLineCountsOrigin: mismatchLineCounts,
      outlierLineCountsOrigin: outlierLineCounts,

      mainStep: 2,
      curStep: 2,
      lastSubStep: 2,
      subStepActive: 2,
      etling: false,
      etlProgress: 0,
    };
    await createOrUpdate(projectId, userId, result);
    return { status: 200, message: 'ok', result };
  } catch (e) {
    console.log({ ...e });
    let error = e;
    if (e.response && e.response.data) error = e.response.data;
    return { status: 500, message: 'get index stats failed', error };
  }
});

const getProject = async (message): Promise<Project> => {
  const { projectId } = message;
  const result: ProjectRedisValue = await redis.hgetall(`project:${projectId}`);
  return _.mapValues<Project>(result, value => {
    return JSON.parse(value);
  });
};

wss.register('newEtl', async (message, socket, process) => {
  const project = await getProject(message);
  const { userId } = socket.session;
  if (project.userId !== userId) return { status: 420, message: 'error' };
  const stats = project.stats || {};
  const { projectId } = message;
  _.chain(project.colType)
    .entries()
    .forEach(([key, value]) => {
      stats[key].type = value;
    });

  for (let key in stats) {
    const mismatch = project.mismatchFillMethod[key];
    const value =
      project.colType[key] === 'Numerical'
        ? project.rawDataView[key].mean
        : project.rawDataView[key].mode;
    if (!isNaN(+mismatch)) {
      stats[key].mismatchFillMethod = { type: 'replace', value: +mismatch };
    } else {
      if (mismatch === 'drop')
        stats[key].mismatchFillMethod = { type: 'delete' };
      else if (mismatch === 'zero')
        stats[key].mismatchFillMethod = { type: 'replace', value: 0 };
      else if (mismatch && mismatch !== 'ignore')
        stats[key].mismatchFillMethod = {
          type: 'replace',
          value: project.rawDataView[key][mismatch],
        };
      else stats[key].mismatchFillMethod = { type: 'replace', value };
    }
    // if (mismatch === 'drop') stats[key].mismatchFillMethod = { type: 'delete' }
    // else if ((mismatch || mismatch === 0) && mismatch !== 'ignore') stats[key].mismatchFillMethod = { type: 'replace', value: mismatch }
    // else stats[key].mismatchFillMethod = { type: 'replace', value }

    const missingValue = project.nullFillMethod[key];
    if (!isNaN(+missingValue)) {
      stats[key].missingValueFillMethod = {
        type: 'replace',
        value: +missingValue,
      };
    } else {
      if (missingValue === 'drop')
        stats[key].missingValueFillMethod = { type: 'delete' };
      else if (missingValue === 'zero')
        stats[key].missingValueFillMethod = { type: 'replace', value: 0 };
      else if (missingValue === 'ignore')
        stats[key].missingValueFillMethod = {
          type: 'replace',
          value: 'NEW_VARIABLE_TYPE',
        };
      else if (missingValue)
        stats[key].missingValueFillMethod = {
          type: 'replace',
          value: project.rawDataView[key][missingValue],
        };
      else stats[key].missingValueFillMethod = { type: 'replace', value };
    }
    // if (missingValue === 'drop') stats[key].missingValueFillMethod = { type: 'delete' }
    // else if (missingValue === 'ignore') stats[key].missingValueFillMethod = { type: 'replace', value: 'NEW_VARIABLE_TYPE' }
    // else if ((missingValue || missingValue === 0) && missingValue !== 'ignore') stats[key].missingValueFillMethod = { type: 'replace', value: missingValue }
    // else stats[key].missingValueFillMethod = { type: 'replace', value }

    const outlier = project.outlierFillMethod[key];
    if (!isNaN(+outlier)) {
      stats[key].outlierFillMethod = { type: 'replace', value: +outlier };
    } else {
      if (outlier === 'drop') stats[key].outlierFillMethod = { type: 'delete' };
      else if (outlier === 'zero')
        stats[key].outlierFillMethod = { type: 'replace', value: 0 };
      else if (outlier && outlier !== 'ignore')
        stats[key].outlierFillMethod = {
          type: 'replace',
          value: project.rawDataView[key][outlier],
        };
    }
    // if (outlier === 'drop') stats[key].outlierFillMethod = { type: 'delete' }
    // else if ((outlier || outlier === 0) && outlier !== 'ignore') stats[key].outlierFillMethod = { type: 'replace', value: outlier }

    const range = project.outlierDictTemp[key];
    if (range && range.length && range.length === 2) {
      stats[key].originalStats.low = range[0];
      stats[key].originalStats.high = range[1];
    }
  }

  if (
    project.problemType &&
    project.problemType !== 'Clustering' &&
    project.problemType !== 'Outlier'
  ) {
    stats[project.target].isTarget = true;
    if (project.problemType === 'Classification') {
      let deletedValues = [];
      if (project.targetArray && project.targetArray.length > 1) {
        if (_.includes(project.targetArray, ''))
          stats[project.target].missingValueFillMethod = {
            type: 'replace',
            value: 'NULL',
          };
        deletedValues = Object.keys(
          project.colValueCounts[project.target],
        ).filter(k => !project.targetArray.includes(k));
      } else {
        deletedValues = _.chain(project.colValueCounts[project.target])
          .entries()
          .sort((a, b) => b[1] - a[1])
          .slice(2)
          .map(([k]) => k)
          .value();
      }
      if (Object.keys(project.otherMap).includes(''))
        stats[project.target].missingValueFillMethod = {
          type: 'replace',
          value: project.otherMap[''],
        };

      stats[project.target].mapFillMethod = {
        ...deletedValues.reduce((prev, key) => {
          prev[key] = {
            type: 'delete',
          };
          return prev;
        }, {}),
        ...Object.entries(project.otherMap).reduce((prev, [key, value]) => {
          if (key === '') return prev;
          prev[key] = {
            type: 'replace',
            value: value === '' ? 'NULL' : value,
          };
          return prev;
        }, {}),
      };
    }
  }
  const response = await axios.post(
    `${esServicePath}/etls/${project.originalIndex}/etl`,
    stats,
  );
  const { etlIndex, opaqueId, error } = response.data;
  if (error) return response.data;
  return new Promise(resolve => {
    const interval = setInterval(async () => {
      const { data } = await axios.get(
        `${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`,
      );
      if (data.task) {
        if (data.task.status && data.task.status) {
          const status = data.task.status;
          const progress =
            (90 * (status.created + status.deleted)) / status.total || 0;
          process({ progress, status: 1 });
        }
      } else {
        //删除模型
        await deleteModels(userId, project.id);
        clearInterval(interval);
        process({ progress: 90, status: 1 });
        const {
          data: { totalFixedCount, deletedCount },
        } = await axios.post(
          `${esServicePath}/etls/${project.originalIndex}/fixedLines`,
          stats,
        );
        process({ progress: 95, status: 1 });
        const { data } = await axios.post(
          `${esServicePath}/etls/${etlIndex}/stats`,
          stats,
        );
        const dataViews = {};
        Object.entries(data).forEach(([key, metric]: [string, Metric]) => {
          const stats = metric.originalStats;
          dataViews[key] = { ...stats, std: stats.std_deviation };
        });
        process({ progress: 100, status: 1 });
        createOrUpdate(projectId, userId, {
          etlIndex,
          opaqueId,
          totalFixedLines: totalFixedCount,
          deletedCount,
          stats: data,
          dataViews,
        });
        resolve({
          status: 200,
          message: 'ok',
          etlIndex,
        });
      }
    }, 1000);
  });
});

wss.register('getHeader', async message => {
  const { data } = await axios.get(
    `${esServicePath}/etls/${message.index}/header`,
  );
  return { header: data.split(',').filter(k => k !== '__no') };
});

export default {};
