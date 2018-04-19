const moment = require('moment');
const config = require('../config');
const r = require('./db');

// schedule handle
const scheduleInterval = setInterval(
  scheduleHandler,
  config.schedulePeriod * 1000
);

// queue handle
const queueInterval = setInterval(scheduleQueue, config.queuePeriod * 1000);

async function scheduleHandler() {
  const now = moment().unix();
  const schedules = await r.getTimeUpSchedules(now);
  schedules.map(async schedule => {
    schedule.updatedDate = now;
    schedule.status = 'queue';
    await r.scheduleUpsert(schedule);

    const deployment = await r.getDeployment(schedule.deploymentId);
    const cdo = deployment[`${schedule.type}Options`];
    const nextTime = generateNextScheduleTime(
      cdo.frequency,
      cdo.frequencyOptions,
      now - 1
    );

    if (!nextTime) return;

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

async function scheduleQueue() {
  const count = await r.getProgressingScheduleCount();
  if (count >= config.maxConcurrencySchedule) return;
  const schedules = await r.getQueueSchedules(
    config.maxConcurrencySchedule - count
  );
  const now = moment().unix();

  schedules.map(async schedule => {
    schedule.updatedDate = now;
    schedule.actualTime = now;
    schedule.status = 'progressing';
    await r.scheduleUpsert(schedule);
  });
}

const hasNext = (deploymentId, ends, nextTime, type) =>
  new Promise((resolve, reject) => {
    if (ends === 'never') return resolve(true);
    if (ends === 'completed') return resolve(false);
    if (ends > 10000) return nextTime >= ends ? resolve(false) : resolve(true);
    const count = r
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

r.deploymentChanges(({ new_val, old_val }) => {
  const ocddo =
    old_val && old_val.deploymentOptions ? old_val.deploymentOptions : {};
  const ocdpo =
    old_val && old_val.performanceOptions ? old_val.performanceOptions : {};
  const cddo =
    new_val && new_val.deploymentOptions ? new_val.deploymentOptions : {};
  const cdpo =
    new_val && new_val.performanceOptions ? new_val.performanceOptions : {};

  let needDeploymentRedeploy = cddo.enable;
  let needPerformanceRedeploy = cdpo.enable;

  if (cddo.enable === ocddo.enable && cddo.enable === true) {
    needDeploymentRedeploy =
      cddo.frequency !== ocddo.frequency ||
      !compare(cddo.frequencyOptions, ocddo.frequencyOptions);
  }
  if (cdpo.enable === ocdpo.enable && cdpo.enable === true) {
    needPerformanceRedeploy =
      cdpo.frequency !== ocdpo.frequency ||
      !compare(cdpo.frequencyOptions, ocdpo.frequencyOptions);
  }

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
          cdpo.frequency === 'once' ? 1 : cdpo.frequencyOptions.ends;
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
  if (frequency === 'once' && lastTime) return;

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
        `${_time.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`
      );
      if (rightTime.unix() < now) rightTime.add(1, 'days');
      return rightTime.unix();
    },
    week: () => {
      const startTime = moment.unix(options.starts);
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'weeks');
      if (_time.day() !== options.repeatOn - 1) {
        // fix day to the right day of week
        const __time = moment(_time);
        if (__time.day(options.repeatOn - 1).unix() < now) {
          _time.day(7 + options.repeatOn - 1);
        } else {
          _time.day(options.repeatOn - 1);
        }
      }
      const rightTime = moment(
        `${_time.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`
      );
      if (rightTime.unix() < now) rightTime.add(1, 'weeks');
      return rightTime.unix();
    },
    month: () => {
      const startTime = moment.unix(options.starts);
      let _time = moment.unix(lastTime);
      while (_time.unix() < now)
        _time = _time.add(options.repeatFrequency, 'months');
      if (_time.format('D') !== options.repeatOn) {
        if (_time.format('D') > options.repeatOn) {
          const difference = _time.format('D') - options.repeatOn;
          _time.subtract(difference, 'days');
          _time.add(1, 'months');
        } else if (_time.format('D') < options.repeatOn) {
          const difference = options.repeatOn - _time.format('D');
          _time.add(difference, 'days');
        }
      }
      const rightTime = moment(
        `${_time.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`
      );
      if (rightTime.unix() < now) rightTime.add(1, 'months');
      return rightTime.unix();
    }
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
