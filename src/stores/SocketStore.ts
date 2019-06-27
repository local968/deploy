import config from '../config';
import EventEmitter from 'events';
import uuid from 'uuid';

const debug = false;

interface SocketInterface {
  reconnect: () => void,
  send: (message: string) => void
}

class Socket extends EventEmitter implements SocketInterface {
  private url = 'ws://' + config.host + ':' + config.port + '/ws';
  private reconnectLock = false;
  private connectionError = false;
  private errorTimes = 0;
  private ws: null | WebSocket = null;
  private timeout = 10000;
  private heartbeatTimeout: null | NodeJS.Timeout = null;
  private serverTimeout: null | NodeJS.Timeout = null;
  private messageList: string[] = [];

  constructor() {
    super();
    this.createWebSocket();
  }

  private createWebSocket() {
    try {
      if ('WebSocket' in window) {
        this.ws = new (window as any).WebSocket(this.url);
      } else if ('MozWebSocket' in window) {
        this.ws = new (window as any).MozWebSocket(this.url);
      } else {
        alert('Your browser does not support websocket.');
      }
      this.initEventHandle();
    } catch (e) {
      this.reconnect();
      console.log(e);
    }
  }

  public reconnect() {
    if (this.reconnectLock) return;
    this.reconnectLock = true;
    this.emit('offline');
    setTimeout(() => {
      //没连接上会一直重连，设置延迟避免请求过多
      this.createWebSocket();
      this.reconnectLock = false;
    }, 2000);
  }

  private start() {
    if (this.heartbeatTimeout !== null) clearTimeout(this.heartbeatTimeout);
    if (this.serverTimeout !== null) clearTimeout(this.serverTimeout);

    this.heartbeatTimeout = setTimeout(() => {
      // send a  ping, any message from server will reset this timeout.
      this.ws && this.ws.readyState === 1 && this.ws.send('ping');
      this.serverTimeout = setTimeout(
        () => this.ws && this.ws.readyState === 1 && this.terminate(),
        this.timeout,
      );
    }, this.timeout);
  }

  private initEventHandle() {
    if (!this.ws) return
    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('error', this.onError);
    this.ws.addEventListener('close', this.onClose);
    this.ws.addEventListener('open', this.onOpen);
  }

  private onMessage = event => {
    this.start(); //any message represent current connection working.
    this.emit('message', event);
  };

  private onClose = event => {
    this.errorTimes++;
    // if (this.errorTimes >= 10) {
    //   this.connectionError = event
    //   console.error('error retry > 10 times')
    // }
    if (!this.connectionError) this.reconnect();
    console.warn('websocket connection closed!', event);
  };

  private onError = event => {
    if (!this.connectionError) this.reconnect();
    console.error('websocket connection error!', event);
  };

  private onOpen = event => {
    this.errorTimes = 0;
    this.start(); //reset client heartbeat check
    this.emit('online');
    console.info('websocket connect succesful. ' + new Date().toUTCString());
    while (this.messageList.length) {
      const message = this.messageList.shift();
      this.send(message);
    }
    // for (let i = 0; i < this.messageList.length; i++) {
    //   const message = this.messageList.shift()
    //   this.send(message)
    // }
  };

  public send(message) {
    if (!this.ws) return
    if (this.ws.readyState === 1) {
      this.ws.send(message);
    } else {
      this.messageList.push(message);
    }
  }

  private terminate() {
    // this.ws && this.ws.terminate()
    if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
    if (this.serverTimeout) clearTimeout(this.serverTimeout);
  }
}

interface SocketStoreInterface {
  status: string,
  api: { on: (str: string, callback: () => void) => void }
  socket?: Socket
}

class SocketStore extends EventEmitter implements SocketStoreInterface {
  status = 'init';
  api = { on: this.on.bind(this) };
  socket

  connect = () => {
    this.socket = new Socket();
    this.socket.on('message', message => {
      let data = message.data;
      if (data === 'pong') return;
      if (debug) console.log('receive message:', data);
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.warn('unknown message:', message.data);
      }
      if (data.type === 'api') {
        return this.initApi(data);
      }
      if (data.request && data.request._id && data.request.progress !== true)
        return this.emit(data.request._id, data);
      if (data.request && data.request._id && data.request.progress === true)
        return this.emit('progress' + data.request._id, data);
      if (data.type) return this.emit(data.type, data);
    });
    this.socket.on('offline', () => {
      this.emit('offline');
    });
    this.socket.on('online', () => {
      this.emit('online');
    });
    // if (debug) {
    //   window.ss = this;
    //   window.ws = this.ws;
    //   window.api = this.api;
    //   window.axios = axios;
    // }
  };

  // reconnect() {
  //   this.socket.terminate()
  //   this.connect()
  // }

  ready(): Promise<any> {
    if (this.status === 'ready') return Promise.resolve(this.api);
    return new Promise((resolve, reject) => {
      this.once('apiReady', resolve.bind(null, this.api));
    });
  }

  initApi(data) {
    data.api.map(eventName => {
      return (this.api[eventName] = (data = {}, callback) => {
        if (typeof data === 'function') {
          callback = data;
          data = {};
        }
        const _id = uuid.v4();
        data._id = _id;
        data.type = eventName;
        if (callback) this.on('progress' + _id, callback);
        return new Promise((resolve, reject) => {
          this.once(_id, (...args) => {
            if (callback) this.removeListener('progress' + _id, callback);
            resolve(...args);
          });
          this.socket.send(JSON.stringify(data));
        });
      });
    });
    this.emit('apiReady');
    this.status = 'ready';
  }
}

export { SocketStore }

export default new SocketStore();
