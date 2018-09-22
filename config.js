let localConfig = {};
try {
  localConfig = require('./local_config.js').server;
} catch (e) {}

module.exports = Object.assign(
  {
    token_secret: 'NewATechDeMO',
    queuePeriod: 60,
    schedulePeriod: 60,
    maxConcurrencySchedule: 2,
    projPath: '/Users/vcing',
    port: 29000,
    redisUri: 'redis://:@ty.dnnmind.com:6379/10',
    secret: 'adslkjfhoquhfjLKAHLK'
  },
  localConfig
);
