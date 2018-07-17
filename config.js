let localConfig = {};
try {
  localConfig = require('./local_config.js').server;
} catch (e) {}

module.exports = Object.assign(
  {
    token_secret: 'NewATechDeMO',
    port: 3000,
    queuePeriod: 60,
    schedulePeriod: 60,
    maxConcurrencySchedule: 2,
    projPath: '/Users/vcing',
    httpPort: 29000
  },
  localConfig
);
