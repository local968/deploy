require('module-alias/register')
require('events').EventEmitter.prototype._maxListeners = 1000;
const { server, sessionParser } = require('./http')
const wssInit = require('./webSocket')
const config = require('config')

wssInit(server, sessionParser)

// Start the server.
server.listen(config.port || 8080, () => console.log('Listening on port:' + config.port));
