require('ts-node').register({
  project: require('path').join(__dirname, 'tsconfig.json'),
});

require('./server');
