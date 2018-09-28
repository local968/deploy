const WebSocket = require('ws')
const { redis, pubsub } = require('redis')

const _apis = []
const _subscribes = []
const _publishes = []

const init = (server, sessionParser) => {
  const wss = new WebSocket.Server({

    verifyClient: (info, done) => {
      // console.log('Parsing session from request...');
      sessionParser(info.req, {}, () => {
        // console.log('Session is parsed!');
        // We can reject the connection by returning false to done(). For example,
        // reject here if user is unknown.
        done(info.req.session.userId);
      });
    },
    server
  });

  wss.api = []

  wss.on('connection', (socket, req) => {
    socket.send(JSON.stringify({ type: 'api', api: wss.api }))
    // init server side heartbeat
    socket.isAlive = true;
    socket.on('pong', function () {
      this.isAlive = true
    });
    socket.on('message', wss.emit.bind(wss, 'message', socket));
    socket.on('close', (socket, code, reason) => {
      socket.isAlive = false;
      console.warn('socket closed, reason:' + reason + ' code:' + code)
    })

    socket.on('error', (socket, error) => {
      socket.isAlive = false;
      console.error('socket error:' + error)
    })
  });

  wss.on('message', (socket, message) => {
    if (message === 'ping') return socket.send('pong')
    try {
      const _message = JSON.parse(message)
      wss.emit(_message.type, _message, socket)
    } catch (e) {
      console.error(e)
      console.error('unknown message:', message)
    }
  })

  // init custom on function
  wss.register = function (eventName, listener) {
    const callback = (...args) => {
      if (args.length < 2 || !args[0].type) return listener(...args)
      const message = args[0]
      const socket = args[1]
      const returnValue = listener(message, socket)
      if (returnValue.then && typeof returnValue.then === 'function') {
        returnValue.then(result => {
          result.request = message
          return socket.send(JSON.stringify({ ...returnValue, request: message }))
        })
      } else {
        return socket.send(JSON.stringify({ ...returnValue, request: message }))
      }
    }
    wss.addListener(eventName, callback)
    wss.api.push(eventName)
  }

  redis.on('message', (channel, message) => {
    wss.emit('channel:' + channel, JSON.parse(message))
  })

  wss.subscribe = function (channel, listener, socket) {
    const callback = (message) => {
      if (!socket) return listener(message)
      if (socket && socket.readyState === WebSocket.OPEN) {
        const result = listener(message)
        result.type = channel
        return socket.send(JSON.stringify(result))
      }
      wss.removeListener('channel:' + channel, callback)
    }
    wss.addListener('channel:' + channel, callback)
  }
  wss.publish = function (channel, message) {
    redis.publish('channel:' + channel, JSON.stringify(message))
  }

  // server side heartbeat interval
  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(socket) {
      if (socket.isAlive === false) return socket.terminate();

      socket.isAlive = false;
      socket.ping();
    });
  }, 10000);

  init.register = wss.register
  _apis.map(args => wss.register(...args))

  init.subscribe = wss.subscribe
  _subscribes.map(args => wss.subscribe(...args))

  init.publish = wss.publish
  _publishes.map(args => wss._publishes(...args))

  return wss;
}

init.register = (...args) => _apis.push(args)
init.subscribe = (...args) => _subscribes.push(args)
init.publish = (...args) => _publishes.push(args)

module.exports = init
