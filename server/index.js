require('module-alias/register')
require('events').EventEmitter.prototype._maxListeners = 1000;
require('./log4js')
const { server, sessionParser } = require('./http')
const wssInit = require('./webSocket')
const { recover } = require('./reboot')
const config = require('config')

const wss = wssInit(server, sessionParser)
recover(wss)
// Start the server.
server.listen(config.port || 8080, () => {
  const applog = require('log4js').getLogger('app')
  console.log('Listening on port:' + config.port)
  applog.info('Listening on port:' + config.port)
});
