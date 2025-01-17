import moment from 'moment';
import config from '../config';
import api from './scheduleApi';
import command from './command';
import _ from 'lodash';
import { GenerateNextScheduleTimeOptions } from './types';
// schedule handle
const scheduleInterval = setInterval(
  scheduleHandler,
  _.toInteger(config.schedulePeriod) * 100,
);
scheduleHandler();
// queue handle
// const queueInterval = setInterval(scheduleQueue, config.queuePeriod * 1000);

async function scheduleHandler() {
  const now = moment().unix();
  const schedules = await api.getTimeUpSchedules(now);
  _.forEach(schedules, async schedule => {
    schedule.updatedDate = now;
    schedule.status = 'progressing';
    await api.upsertSchedule(schedule);

    let deployment = await api.getDeployment(schedule.deploymentId);
    if (!deployment) return;
    if (deployment[`${schedule.type}Options`].source === 'file') {
      schedule.mapHeader = deployment[`${schedule.type}Options`].mapHeader
      await api.upsertSchedule(schedule)
    }
    schedule.file = deployment[`${schedule.type}Options`].file
    // database download in checkUserFileRestriction
    let restrictQuery;
    try {
      restrictQuery = await api.checkUserFileRestriction(schedule);
    } catch (e) {
      schedule.status = 'issue';
      schedule.updatedDate = moment().unix();
      schedule.result = { ['processError']: e.message };
      await api.upsertSchedule(schedule);
      return;
    }
    deployment = await api.getDeployment(schedule.deploymentId);
    if (restrictQuery === false) {
      schedule.status = 'issue';
      schedule.updatedDate = moment().unix();
      schedule.result = { ['processError']: config.yourAge };
      await api.upsertSchedule(schedule);
    } else {
      // send command to python
      let fileId: any = false
      try {
        fileId = await api.getCleanIndex(
          schedule,
          deployment[`${schedule.type}Options`].fileId,
          deployment.projectId,
          deployment.modelName
        );
      } catch (e) {
        console.error(e)
        schedule.status = 'issue';
        schedule.updatedDate = moment().unix();
        schedule.result = { ['processError']: 'etl failed' };
        await api.upsertSchedule(schedule);
      }
      // etl failed
      if (fileId === false) return
      const fileName = deployment[`${schedule.type}Options`].file;
      const ext = '.' + fileName.split('.')[fileName.split('.').length - 1];
      const newFeatureLabel = await api.getFeatureLabel(deployment.projectId);
      let cmd = '';
      switch (deployment.modelType) {
        case 'Clustering':
          cmd = 'clustering.deploy';
          break;
        case 'Outlier':
          cmd = 'outlier.deploy';
          break;
        case 'MultiClassification':
          cmd = 'multi.deploy';
          break;
        default:
          cmd = 'clfreg.deploy';
      }
      const request = {
        requestId: `schedule-${schedule.id}`,
        projectId: deployment.projectId,
        userId: deployment.userId,
        csvLocation: [fileId],
        ext: [ext],
        command: cmd,
        solution: deployment.modelName,
        actionType: schedule.type,
        frameFormat: 'csv',
        newFeatureLabel: undefined,
        cutoff: undefined,
        rate: undefined,
        csvScript: undefined,
      };
      if (!!_.keys(newFeatureLabel || {}).length)
        request.newFeatureLabel = newFeatureLabel;
      if (deployment.modelType === 'Classification') {
        try {
          request.cutoff = await api.getCutOff(
            deployment.projectId,
            deployment.modelName,
          );
        } catch (e) {
          console.info(
            `get cute off failed, projectId:${deployment.projectId} scheduleId:${schedule.id} deploymentId:${deployment.id}`,
          );
        }
      }
      if (deployment.modelType === 'Outlier') {
        try {
          request.rate = await api.getRate(
            deployment.projectId,
            deployment.modelName,
          );
        } catch (e) {
          console.info(
            `get rate failed, projectId:${deployment.projectId} scheduleId:${schedule.id} deploymentId:${deployment.id}`,
          );
        }
      }
      if (deployment.csvScript && deployment.csvScript !== '')
        request.csvScript = deployment.csvScript;
      let result = {};
      schedule.status = 'Progressing..'
      api.upsertSchedule(schedule)
      await command(request, data => {
        result = { ...result, ...data.result };
        return data.status === 100 || data.status < 0;
      });
      if (result['processError'])
        api.decreaseLines(
          restrictQuery,
          await api.getLineCount(deployment[`${schedule.type}Options`].fileId),
        );
      schedule.result = result;
      schedule.status = result['processError'] ? 'issue' : 'finished';
      schedule.updatedDate = moment().unix();
      api.upsertSchedule(schedule);
    }

    if (
      deployment[`${schedule.type}Options`].autoDisable &&
      schedule.status === 'issue'
    ) {
      deployment.enable = false;
      api.updateDeployment(deployment);
      return;
    }

    const cdo = deployment[`${schedule.type}Options`];
    const nextTime = generateNextScheduleTime(
      cdo.frequency,
      cdo.frequencyOptions,
      now - 1,
    );
    if (!nextTime) return;

    const has = await hasNext(
      schedule.deploymentId,
      schedule.ends,
      nextTime,
      schedule.type,
    );

    if (has) {
      const nextSchedule = generateSchedule(
        schedule.deploymentId,
        schedule.modelName || deployment.modelName,
        schedule.type,
        cdo ? nextTime : null,
        schedule.ends,
        schedule.threshold,
        schedule.id,
      );
      await api.upsertSchedule(nextSchedule);
    }
  });
}

// async function scheduleQueue() {
//   const count = await api.getProgressingScheduleCount();
//   if (count >= config.maxConcurrencySchedule) return;
//   const schedules = await api.getQueueSchedules(
//     config.maxConcurrencySchedule - count
//   );
//   const now = moment().unix();

//   schedules.map(async schedule => {
//     schedule.updatedDate = now;
//     schedule.actualTime = now;
//     schedule.status = 'progressing';
//     await api.upsertSchedule(schedule);
//   });
// }

const hasNext = (deploymentId, ends, nextTime, type) =>
  new Promise((resolve, reject) => {
    if (ends === 'never') return resolve(true);
    if (ends === 'completed') return resolve(false);
    if (ends > 10000) return nextTime >= ends ? resolve(false) : resolve(true);
    const count = api
      .getScheduleCount(deploymentId, type)
      .then(count => (ends >= count ? resolve(false) : resolve(true)));
  });

const catchError = console.error;

// deep compare
const compare = (a, b) => {
  if (!a || !b) return false;
  let result = true;
  const aEntries = Object.entries(a);
  const bEntries = Object.entries(b);
  if (aEntries.length !== bEntries.length) return false;
  aEntries.map(([key, value]) => {
    if (a[key] !== b[key]) result = false;
  });

  return result;
};

const deploy = (deployment, threshold = null) => {
  if (!deployment) throw new Error('no deployment');
  const cddo = deployment.deploymentOptions;
  const cdpo = deployment.performanceOptions;
  threshold === null &&
    cddo &&
    api.getLastWaitingSchedule(deployment.id, 'deployment').then(schedule => {
      const nextScheduleTime = generateNextScheduleTime(
        cddo.frequency,
        cddo.frequencyOptions,
      );
      if (!schedule && !nextScheduleTime) return;
      if (schedule) {
        // update estimated time
        schedule.estimatedTime = nextScheduleTime;
        schedule.updatedDate = moment().unix();
        schedule.ends =
          cddo.frequency === 'once' ? 1 : cddo.frequencyOptions.ends;
        if (threshold) schedule.threshold = threshold;
        api.upsertSchedule(schedule).catch(catchError);
      } else {
        api
          .upsertSchedule(
            generateSchedule(
              deployment.id,
              deployment.modelName,
              'deployment',
              nextScheduleTime,
              cddo.frequency === 'once'
                ? cddo.frequencyOptions.time
                : cddo.frequencyOptions.ends,
              threshold,
            ),
          )
          .catch(catchError);
      }
    });

  threshold &&
    cdpo &&
    api.getLastWaitingSchedule(deployment.id, 'performance').then(schedule => {
      const nextScheduleTime = generateNextScheduleTime(
        cdpo.frequency,
        cdpo.frequencyOptions,
      );
      if (!schedule && !nextScheduleTime) return;
      if (schedule) {
        // update estimated time
        schedule.estimatedTime = nextScheduleTime;
        schedule.updatedDate = moment().unix();
        schedule.ends =
          cdpo.frequency === 'once' ? 1 : cdpo.frequencyOptions.ends;
        if (threshold) schedule.threshold = threshold;
        api.upsertSchedule(schedule).catch(catchError);
      } else {
        api
          .upsertSchedule(
            generateSchedule(
              deployment.id,
              deployment.modelName,
              'performance',
              nextScheduleTime,
              cdpo.frequency === 'once'
                ? cdpo.frequencyOptions.time
                : cdpo.frequencyOptions.ends,
              threshold,
            ),
          )
          .catch(catchError);
      }
    });
};

const generateSchedule = (
  deploymentId,
  modelName,
  type,
  estimatedTime,
  ends,
  threshold = null,
  prevSchedule = null,
  status = 'waiting',
  actualTime = null,
  updatedDate = moment().unix(),
  createdDate = moment().unix(),
) => ({
  deploymentId,
  modelName,
  type,
  estimatedTime,
  ends,
  threshold,
  prevSchedule,
  status,
  actualTime,
  updatedDate,
  createdDate,
});

const generateNextScheduleTime = (
  frequency,
  options?: GenerateNextScheduleTimeOptions,
  lastTime?,
) => {
  if (!options) return;
  if (!frequency) return;
  const now = moment().unix();
  if (
    frequency === 'repeat' &&
    options.ends !== 'never' &&
    options.ends > 10000 &&
    now > options.ends
  )
    return;
  if (frequency === 'once' && lastTime) return;

  const repeatOn = _.toInteger(options.repeatOn);

  const startTimeStrategies = {
    day: () => {
      let startTime = moment.unix(options.starts);
      startTime = moment(
        `${moment().format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`,
      );
      if (startTime.unix() < now) startTime.add(1, 'days');
      return startTime.unix();
    },
    week: () => {
      let startTime = moment.unix(options.starts);
      startTime = moment(
        `${moment().format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`,
      );
      startTime.day(repeatOn - 1);
      if (startTime.unix() < now) startTime.add(1, 'weeks');
      return startTime.unix();
    },
    month: () => {
      let startTime = moment.unix(options.starts);
      startTime = moment(
        `${moment().format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`,
      );
      if (_.toInteger(startTime.format('D')) > repeatOn) {
        const difference =
          _.toInteger(startTime.format('D')) - _.toInteger(repeatOn);
        startTime.subtract(difference, 'days');
        startTime.add(1, 'months');
      } else if (_.toInteger(startTime.format('D')) < repeatOn) {
        const difference =
          _.toInteger(repeatOn) - _.toInteger(startTime.format('D'));
        startTime.add(difference, 'days');
      } else {
        if (startTime.unix() < now) startTime.add(1, 'months');
      }
      return startTime.unix();
    },
  };

  // 1. after restart server, it will immidiatly execute all time up schedules(put into a queue),
  // next schedule will be generated based on this time(so every delayed schedule will only execute once)
  // 2. if the next time is wrong(PS:schedule options is every monday, but estimated time is tuesday.
  // Since next time generator is based on actual execution time or server restart time in some circumstance)
  // It need a repair mechanism. For the moment it is same to start time calculation algorithm
  const nextTimeStrategies = {
    day: () => {
      const startTime = moment.unix(options.starts);
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'days');
      // fix start time
      const rightTime = moment(
        `${_time.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`,
      );
      if (rightTime.unix() < now) rightTime.add(1, 'days');
      return rightTime.unix();
    },
    week: () => {
      const startTime = moment.unix(options.starts);
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'weeks');
      if (_time.day() !== repeatOn - 1) {
        // fix day to the right day of week
        const __time = moment(_time);
        if (__time.day(repeatOn - 1).unix() < now) {
          _time.day(7 + repeatOn - 1);
        } else {
          _time.day(repeatOn - 1);
        }
      }
      const rightTime = moment(
        `${_time.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`,
      );
      if (rightTime.unix() < now) rightTime.add(1, 'weeks');
      return rightTime.unix();
    },
    month: () => {
      const startTime = moment.unix(options.starts);
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'months');
      const d = _.toInteger(_time.format('D'));
      if (d !== repeatOn) {
        if (d > repeatOn) {
          const difference = d - repeatOn;
          _time.subtract(difference, 'days');
          _time.add(1, 'months');
        } else if (d < repeatOn) {
          const difference = repeatOn - d;
          _time.add(difference, 'days');
        }
      }
      const rightTime = moment(
        `${_time.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`,
      );
      if (rightTime.unix() < now) rightTime.add(1, 'months');
      return rightTime.unix();
    },
  };

  // lastTime = now - 1;

  const nextTime =
    frequency === 'once'
      ? options.time === 'completed'
        ? now
        : options.time
      : lastTime
        ? nextTimeStrategies[options.repeatPeriod]()
        : startTimeStrategies[options.repeatPeriod]();

  return nextTime;
};

export default deploy;
