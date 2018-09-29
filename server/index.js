require('module-alias/register')
const { server, sessionParser } = require('./http')
const wssInit = require('./webSocket')

wssInit(server, sessionParser)

// Start the server.
server.listen(8080, () => console.log('Listening on http://localhost:8080'));
