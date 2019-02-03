const WebSocket = require('ws')
const { redis, pubsub } = require('redis')
const { saveMessage, removeMessage } = require('./reboot')
const uuid = require('uuid')
const moment = require('moment')

const _apis = []
const _subscribes = []
const _publishes = []

const init = (server, sessionParser) => {
  const wss = new WebSocket.Server({
    verifyClient: (info, done) => sessionParser(info.req, {}, () => done(info.req.session.userId)),
    server,
    path: '/ws'
  });

  wss.api = []

  wss.on('connection', (socket, req) => {
    socket.send(JSON.stringify({ type: 'api', api: wss.api }))
    // init server side heartbeat
    socket.isAlive = true;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const log = `${ip} - ${req.session.userId} - [${moment().format()}] - ${moment.valueOf()} - connected - ${req.headers['user-agent'] || ''}`
    redis.set(`log:${moment().format('YYYY:MM:DD')}:${uuid.v4()}}`, log)
    socket.on('pong', function () {
      this.isAlive = true
    });
    socket.on('message', wss.emit.bind(wss, 'message', socket));
    socket.on('close', (socket, code, reason) => {
      socket.isAlive = false;
      const log = `${ip} - ${req.session.userId} - [${moment().format()}] - ${moment.valueOf()} - closed - ${req.headers['user-agent'] || ''}`
      redis.set(`log:${moment().format('YYYY:MM:DD')}:${uuid.v4()}}`, log)
      // client closed
      // console.warn('socket closed, reason:' + reason + ' code:' + code)
    })

    socket.on('error', (socket, error) => {
      const log = `${ip} - ${req.session.userId} - [${moment().format()}] - ${moment.valueOf()} - error - ${req.headers['user-agent'] || ''}`
      redis.set(`log:${moment().format('YYYY:MM:DD')}:${uuid.v4()}}`, log)
      // console.error(error)
      socket.isAlive = false;
      console.error('socket error:' + error)
    })
    socket.session = req.session
    socket.id = uuid.v4()
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
    const callback = async (...args) => {
      if (args.length < 2 || !args[0].type) return listener(...args)
      const message = args[0]
      const socket = args[1]
      const progress = (result) => {
        try {
          socket.send(JSON.stringify({ ...result, request: { ...message, progress: true } }))
        } catch (e) {
          // socket closed
        }
        return false
      }
      await saveMessage(message, socket.session.user)
      try {
        const returnValue = await listener(message, socket, progress) || {}
        socket.send(JSON.stringify({ ...returnValue, request: message }))
        await removeMessage(message, socket.session.user)
      } catch (e) {
        // socket closed
      }
      return
    }
    wss.addListener(eventName, callback)
    wss.api.push(eventName)
  }

  // redis.on('message', (channel, message) => {
  //   wss.emit(channel, JSON.parse(message))
  // })

  wss.subscribe = function (channel, listener, socket) {
    const callback = async (message) => {
      if (!socket) return await listener(message)
      if (socket && socket.readyState === WebSocket.OPEN) {
        const result = await listener(message)
        result.type = result.type || channel
        result.trigger = { ...message }
        return socket.send(JSON.stringify(result))
      }
      wss.removeListener('channel:' + channel, callback)
      // redis.unsubscribe('channel:' + channel)
    }
    wss.addListener('channel:' + channel, callback)
    // redis.subscribe('channel:' + channel)
  }
  wss.publish = function (channel, message = null) {
    wss.emit('channel:' + channel, message)
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

  init.clients = wss.clients

  return wss;
}

init.register = (...args) => _apis.push(args)
init.subscribe = (...args) => _subscribes.push(args)
init.publish = (...args) => _publishes.push(args)

module.exports = init
