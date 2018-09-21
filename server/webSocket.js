const WebSocket = require('ws');
const { redis } = require('./redis');
const logger = require('./logger');
module.exports = (server, sessionParser) => {
  const wss = new WebSocket.Server({
    verifyClient: (info, done) => {
      console.log('Parsing session from request...');
      sessionParser(info.req, {}, () => {
        console.log('Session is parsed!');

        // We can reject the connection by returning false to done(). For example,
        // reject here if user is unknown.
        done(info.req.session.userId);
      });
    },
    server
  });

  wss.on('connection', (socket, req) => {
    socket.logger = logger(() => req.session.userId, redis);
    socket.on('message', (message) => {
      // Here we can now use session parameters.
      console.log(`WS message ${message} from user ${req.session.userId}`);
      socket.send("aaa")
    });
  });

  function noop() { }

  function heartbeat() {
    this.isAlive = true;
  }

  wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 30000);
}
