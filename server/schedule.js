const moment = require('moment');
const r = require('./db');

async function scheduleHandler() {
  const schedules = await r.getTimeUpSchedules(moment().unix());
  const now = moment().unix();
  schedules.map(async schedule => {
    schedule.updatedDate = now;
    schedule.actualTime = now;
    schedule.status = 'progressing';
    await r.scheduleUpsert(schedule);

    const deployment = await r.getDeployment(schedule.deploymentId);
    const cdo = deployment[`${schedule.type}Options`];
    const nextTime = generateNextScheduleTime(
      cdo.frequency,
      cdo.frequencyOptions,
      now - 1
    );

    const has = await hasNext(
      schedule.deploymentId,
      schedule.ends,
      nextTime,
      schedule.type
    );
    if (has) {
      const nextSchedule = generateSchedule(
        schedule.deploymentId,
        schedule.type,
        cdo ? nextTime : null,
        schedule.ends,
        schedule.id
      );
      await r.scheduleUpsert(nextSchedule);
    }
  });
}

const scheduleInterval = setInterval(scheduleHandler, 10 * 1000);

const hasNext = (deploymentId, ends, nextTime, type) =>
  new Promise((resolve, reject) => {
    if (ends === 'never') return resolve(true);
    if (ends === 'completed') return resolve(false);
    if (ends > 10000) return nextTime > ends ? resolve(false) : resolve(true);
    const count = r
      .getScheduleCount(deploymentId, type)
      .then(count => (ends >= count ? resolve(false) : resolve(true)));
  });

const catchError = console.error;

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

r.deploymentChanges(({ new_val, old_val }) => {
  const ocddo =
    old_val && old_val.deploymentOptions ? old_val.deploymentOptions : {};
  const ocdpo =
    old_val && old_val.performanceOptions ? old_val.performanceOptions : {};
  const cddo =
    new_val && new_val.deploymentOptions ? new_val.deploymentOptions : {};
  const cdpo =
    new_val && new_val.performanceOptions ? new_val.performanceOptions : {};

  const needDeploymentRedeploy =
    cddo.frequency !== ocddo.frequency ||
    !compare(cddo.frequencyOptions, ocddo.frequencyOptions);
  const needPerformanceRedeploy =
    cdpo.frequency !== ocdpo.frequency ||
    !compare(cdpo.frequencyOptions, ocdpo.frequencyOptions);

  // performance
  needPerformanceRedeploy &&
    r.lastWaitingSchedule(new_val.id, 'performance').then(schedule => {
      schedule = schedule.length > 0 ? schedule[0] : null;
      const performanceNextScheduleTime =
        cdpo && generateNextScheduleTime(cdpo.frequency, cdpo.frequencyOptions);
      // timeout
      if (!schedule && !performanceNextScheduleTime) return;
      if (schedule) {
        // update estimated time
        schedule.estimatedTime = performanceNextScheduleTime;
        schedule.updatedDate = moment().unix();
        schedule.ends =
          cdpo.frequency === 'once'
            ? cdpo.frequencyOptions.time
            : cdpo.frequencyOptions.ends;
        r.scheduleUpsert(schedule).catch(catchError);
      } else {
        r
          .scheduleUpsert(
            generateSchedule(
              new_val.id,
              'performance',
              performanceNextScheduleTime,
              cdpo.frequency === 'once'
                ? cdpo.frequencyOptions.time
                : cdpo.frequencyOptions.ends
            )
          )
          .catch(catchError);
      }
    });

  // deployment
  needDeploymentRedeploy &&
    r.lastWaitingSchedule(new_val.id, 'deployment').then(schedule => {
      schedule = schedule.length > 0 ? schedule[0] : null;
      const deploymentNextScheduleTime =
        cddo && generateNextScheduleTime(cddo.frequency, cddo.frequencyOptions);
      // timeout
      if (!schedule && !deploymentNextScheduleTime) return;
      if (schedule) {
        // update estimated time
        schedule.ends =
          cddo.frequency === 'once'
            ? cddo.frequencyOptions.time
            : cddo.frequencyOptions.ends;
        schedule.estimatedTime = deploymentNextScheduleTime;
        r.scheduleUpsert(schedule).catch(catchError);
      } else {
        r
          .scheduleUpsert(
            generateSchedule(
              new_val.id,
              'deployment',
              deploymentNextScheduleTime,
              cddo.frequency === 'once'
                ? cddo.frequencyOptions.time
                : cddo.frequencyOptions.ends
            )
          )
          .catch(catchError);
      }
    });
});

const generateSchedule = (
  deploymentId,
  type,
  estimatedTime,
  ends,
  prevSchedule = null,
  status = 'waiting',
  actualTime = null,
  updatedDate = moment().unix(),
  createdDate = moment().unix()
) => ({
  deploymentId,
  type,
  estimatedTime,
  ends,
  prevSchedule,
  status,
  actualTime,
  updatedDate,
  createdDate
});

const generateNextScheduleTime = (frequency, options, lastTime) => {
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

  const startTimeStrategies = {
    day: () => {
      let startTime = moment.unix(options.starts);
      startTime = moment(
        `${moment().format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`
      );
      if (startTime.unix() < now) startTime.add(1, 'days');
      return startTime.unix();
    },
    week: () => {
      let startTime = moment.unix(options.starts);
      startTime = moment(
        `${moment().format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`
      );
      startTime.day(options.repeatOn - 1);
      if (startTime.unix() < now) startTime.add(1, 'weeks');
      return startTime.unix();
    },
    month: () => {
      let startTime = moment.unix(options.starts);
      startTime = moment(
        `${moment().format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`
      );
      if (startTime.format('D') > options.repeatOn) {
        const difference = startTime.format('D') - options.repeatOn;
        startTime.subtract(difference, 'days');
        startTime.add(1, 'months');
      } else if (startTime.format('D') < options.repeatOn) {
        const difference = options.repeatOn - startTime.format('D');
        startTime.add(difference, 'days');
      } else {
        if (startTime.unix() < now) startTime.add(1, 'months');
      }
      return startTime.unix();
    }
  };

  const nextTimeStrategies = {
    day: () => {
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'days');
      return _time.unix();
    },
    week: () => {
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'weeks');
      return _time.unix();
    },
    month: () => {
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'months');
      return _time.unix();
    }
  };

  // lastTime = now - 1;

  const nextTime =
    frequency === 'once'
      ? options.time === 'completed' ? now : options.time
      : lastTime
        ? nextTimeStrategies[options.repeatPeriod]()
        : startTimeStrategies[options.repeatPeriod]();

  return nextTime;
};
