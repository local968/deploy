const schedule = require('node-schedule');
const moment = require('moment');
const r = require('./db');

r.deploymentChanges(({ new_val, old_val }) => {
  console.log(new_val);
});

const daily = deployments => {
  const now = moment().unix();
  deployments.map(deployment => {
    const options = deployment.frequencyOptions;
    if (!isNaN(options.ends) && now > options.ends) return;
    if (!isNaN(options.starts) && now < options.starts) return;
  });
};
