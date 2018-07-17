let localConfig = {};
try {
  localConfig = require('../local_config.js');
} catch (e) {}

export default Object.assign(
  {
    trainTimeDefault: 40,
    host: 'localhost',
    port: 54000
  },
  localConfig
);
