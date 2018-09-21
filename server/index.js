const { server, sessionParser } = require('./http')
const wssInit = require('./webSocket')
const logger = require('./logger')
const { redis } = require('./redis')

global.logger = logger(() => "", redis)

wssInit(server, sessionParser)

// Start the server.
server.listen(8080, () => console.log('Listening on http://localhost:8080'));
