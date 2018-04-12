const schedule = require('node-schedule');
const moment = require('moment');
const r = require('./db');

r.deploymentChanges(({ new_val, old_val }) => {
  const cddo = new_val.deploymentOptions;
  const cdpo = new_val.performanceOptions;
  const deploymentNextScheduleTime = generateNextScheduleTime(
    cddo.frequency,
    cddo.frequencyOptions
  );
  const performanceNextScheduleTime = generateNextScheduleTime(
    cdpo.frequency,
    cdpo.frequencyOptions
  );

  console.log(
    moment.unix(deploymentNextScheduleTime).format('YYYY-MM-DD HH:mm:ss')
  );
});

const generateNextScheduleTime = (frequency, options) => {
  if (!options) return;
  const now = moment().unix();
  if (frequency === 'repeat' && options.ends !== 'never' && now > options.ends)
    return;
  const starts = moment.unix(options.starts);
  const nextTime =
    frequency === 'once'
      ? options.time === 'completed' ? now : options.time
      : {
          day: () => {
            if (now < options.starts) return options.starts;
            let firstStart = moment(starts).add(1, 'days');
            let _time = moment(firstStart);
            while (_time.unix() < now)
              _time = _time.add(options.repeatFrequency, 'days');
            return _time.unix();
          },
          week: () => {
            let firstStart = moment(starts);
            firstStart.day(options.repeatOn - 1);
            if (firstStart.unix() < starts.unix()) firstStart.add(1, 'weeks');
            let _time = moment(firstStart);
            while (_time.unix() < now)
              _time = _time.add(options.repeatFrequency, 'weeks');
            return _time.unix();
          },
          month: () => {
            let firstStart = moment(starts);
            if (firstStart.format('D') > options.repeatOn) {
              const difference = firstStart.format('D') - options.repeatOn;
              firstStart.subtract(difference, 'days');
              firstStart.add(1, 'months');
            } else {
              const difference = options.repeatOn - firstStart.format('D');
              firstStart.add(difference, 'days');
            }
            let _time = moment(firstStart);
            while (_time.unix() < now)
              _time = _time.add(options.repeatFrequency, 'months');
            return _time.unix();
          }
        }[options.repeatPeriod]();

  return nextTime;
};
