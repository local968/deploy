let localConfig = {};
try {
  localConfig = require('./local_config.js');
} catch (e) {}

module.exports = Object.assign(
  {
    token_secret: 'NewATechDeMO',
    port: 3000,
    queuePeriod: 60,
    schedulePeriod: 60,
    maxConcurrencySchedule: 2,
    projPath: '/Users/vcing'
  },
  localConfig
);
