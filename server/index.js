require('module-alias/register')
require('events').EventEmitter.prototype._maxListeners = 1000;
const { server, sessionParser } = require('./http')
const wssInit = require('./webSocket')
const { recover } = require('./reboot')
const config = require('config')

const wss = wssInit(server, sessionParser)
recover(wss)
// Start the server.
server.listen(config.port || 8080, () => console.log('Listening on port:' + config.port));
