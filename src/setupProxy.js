const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/ws', { target: 'ws://127.0.0.1:8080', ws: true }));
  // app.use(proxy('/', { target: 'http://127.0.0.1:9080' }));
};
