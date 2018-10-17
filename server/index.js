require('module-alias/register')
require('events').EventEmitter.prototype._maxListeners = 1000;
const { server, sessionParser } = require('./http')
const wssInit = require('./webSocket')

wssInit(server, sessionParser)

// Start the server.
server.listen(8080, () => console.log('Listening on http://localhost:8080'));
