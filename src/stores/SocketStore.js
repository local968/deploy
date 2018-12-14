import axios from 'axios'
import config from '../config'
import EventEmitter from 'events'
import uuid from 'uuid'

const debug = false

class Socket extends EventEmitter {
  url = "ws://" + config.host + ":" + config.port + '/ws'
  reconnectLock = false
  connectionError = false
  errorTimes = 0
  ws = null
  timeout = 10000
  heartbeatTimeout = null
  serverTimeout = null
  messageList = []

  constructor() {
    super()
    this.createWebSocket()
  }

  createWebSocket() {
    try {
      if ('WebSocket' in window) {
        this.ws = new window.WebSocket(this.url);
      } else if ('MozWebSocket' in window) {
        this.ws = new window.MozWebSocket(this.url);
      } else {
        alert("Your browser does not support websocket.");
      }
      this.initEventHandle();
    } catch (e) {
      this.reconnect();
      console.log(e);
    }
  }

  reconnect() {
    if (this.reconnectLock) return;
    console.log("reconnect")
    this.reconnectLock = true;
    this.emit('offline')
    setTimeout(() => {     //没连接上会一直重连，设置延迟避免请求过多
      this.createWebSocket();
      this.reconnectLock = false;
    }, 2000);
  }

  start() {
    clearTimeout(this.heartbeatTimeout);
    clearTimeout(this.serverTimeout);
    this.heartbeatTimeout = setTimeout(() => {
      // send a  ping, any message from server will reset this timeout.
      this.ws && this.ws.readyState === 1 && this.ws.send("ping");
      this.serverTimeout = setTimeout(() => this.ws && this.ws.readyState === 1 && this.terminate(), this.timeout)
    }, this.timeout)
  }

  initEventHandle() {
    this.ws.addEventListener('message', this.onMessage)
    this.ws.addEventListener('error', this.onError)
    this.ws.addEventListener('close', this.onClose)
    this.ws.addEventListener('open', this.onOpen)
  }

  onMessage = (event) => {
    this.start(); //any message represent current connection working.
    this.emit('message', event)
  }

  onClose = (event) => {
    this.errorTimes++
    if (this.errorTimes >= 10) {
      this.connectionError = event
      console.error('error retry > 10 times')
    }
    if (!this.connectionError) this.reconnect();
    console.warn('websocket connection closed!', event)
  }

  onError = (event) => {
    if (!this.connectionError) this.reconnect();
    console.error('websocket connection error!', event)
  }

  onOpen = (event) => {
    this.errorTimes = 0
    this.start();      //reset client heartbeat check
    console.log("reconnect succ")
    this.emit('online')
    console.info('websocket connect succesful. ' + new Date().toUTCString())
    for (let i = 0; i < this.messageList.length; i++) {
      const message = this.messageList.shift()
      this.send(message)
    }
  }

  send(message) {
    if (this.ws.readyState === 1) {
      this.ws.send(message)
    } else {
      this.messageList.push(message)
    }
  }

  terminate() {
    // this.ws && this.ws.terminate()
    clearTimeout(this.heartbeatTimeout);
    clearTimeout(this.serverTimeout);
  }
}

class SocketStore extends EventEmitter {
  status = 'init';
  api = { on: this.on.bind(this) };
  socket = null;

  connect() {

    this.socket = new Socket()
    this.socket.on('message', message => {
      let data = message.data
      if (data === 'pong') return
      if (debug) console.log('receive message:', data);
      try {
        data = JSON.parse(data)
      } catch (e) {
        console.warn('unknown message:', message.data)
      }
      if (data.type === 'api') return this.initApi(data);
      if (data.request && data.request._id && data.request.progress !== true) return this.emit(data.request._id, data);
      if (data.request && data.request._id && data.request.progress === true) return this.emit('progress' + data.request._id, data);
      if (data.type) return this.emit(data.type, data);
    })
    this.socket.on('offline', () => {
      console.log("emit offline")
      this.emit('offline')
    })
    this.socket.on('online', () => {
      console.log("emit online")
      this.emit('online')
    })
    if (debug) {
      window.ss = this
      window.ws = this.ws
      window.api = this.api
      window.axios = axios;
    }
  }

  offline(callback) {
    this.ready().then(() => {
      this.socket.addEventListener('close', () => {
        if (callback && typeof callback === 'function') callback()
        console.log("close 111")
      })
    })
  }

  online(callback) {
    this.ready().then(() => {
      this.socket.addEventListener('open', () => {
        if (callback && typeof callback === 'function') callback()
        console.log("open 1111")
      })
    })
  }

  // reconnect() {
  //   this.socket.terminate()
  //   this.connect()
  // }

  ready() {
    if (this.status === 'ready') return Promise.resolve(this.api);
    return new Promise((resolve, reject) => {
      this.once('apiReady', resolve.bind(null, this.api));
    });
  }

  initApi(data) {
    data.api.map(eventName => {
      return this.api[eventName] = (data = {}, callback) => {
        if (typeof data === 'function') {
          callback = data
          data = {}
        }
        const _id = uuid.v4()
        data._id = _id
        data.type = eventName
        if (callback) this.on('progress' + _id, callback)
        return new Promise((resolve, reject) => {
          this.once(_id, (...args) => {
            if (callback) this.removeListener('progress' + _id, callback)
            resolve(...args)
          })
          this.socket.send(JSON.stringify(data))
        })
      }
    })
    this.emit('apiReady');
    this.status = 'ready'
  }
}

export default new SocketStore()
