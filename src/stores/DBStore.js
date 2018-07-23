import R2WSClient from '../r2ws-client';
import config from '../config.js';
import moment from 'moment';

const uuidv4 = require('uuid/v4');
const debug = true;

class DB {
  status = 'init';
  _listeners = {};
  _onceListeners = {};
  connection;
  isReady = false;

  constructor(connect = true) {
    if (connect) this.connect();
    return this.db;
  }

  ready() {
    if (this.isReady) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      this.once('apiReady', resolve.bind(null, this.db));
    });
  }

  db = { ready: this.ready.bind(this), _db: this };

  async connect() {
    if (this.connection) return this.connection;
    if (this.listeners('ready').length > 0) {
      return await new Promise((resolve, reject) => {
        this.once('ready', resolve);
      });
    }
    const _conn = new R2WSClient(
      `ws://${window.location.hostname}:${config.port}/`
    );

    _conn.onready = this.emit.bind(this, 'ready', _conn);
    _conn.onmessage = this.emit.bind(this, 'message');
    _conn.onclose = this.emit.bind(this, 'close');
    _conn.onerror = this.emit.bind(this, 'error');

    return await new Promise((resolve, reject) => {
      this.on('message', data => {
        data = data.data;
        if (debug) console.log('receive message:', data);
        if (data.type === 'api') return this.initApi(data);
        if (data.data.reqNo) return this.emit(data.data.reqNo, data.data);
        if (data.type) return this.emit(data.type, data.data);
      });
      this.once('ready', conn => {
        this.connection = conn;
        this.status = 'ready';
        conn.sendmessage({ type: 'api' });
        resolve(conn);
      });
    });
  }

  initApi(data) {
    const apiList = data.data;
    Object.entries(apiList).map(([apiName, rule]) => {
      this.db[apiName] = inputArg => {
        const errors = checkArg(inputArg, rule);
        if (errors.length > 0) return console.error(errors);
        if (rule === 'watch') this.on(apiName, inputArg);
        return this.send(
          apiName,
          rule === 'watch' ? {} : inputArg,
          rule === 'watch' &&
            (() => {
              this.removeListener(apiName, inputArg);
            })
        );
      };
      return null;
    });
    this.isReady = true;
    this.emit('apiReady');
  }

  async send(type, data, unwatch) {
    // type: select, insert, update, upsert, delete, watch, unwatch
    const conn = await this.connect();
    const reqNo = uuidv4();
    conn.sendmessage({ type, data: { reqNo, ...data } });
    return await new Promise((resolve, reject) => {
      this.once(reqNo, (...args) => {
        if (args.length === 1) args = args[0];
        if (unwatch) args.unwatch = unwatch;
        resolve(args);
      });
    });
  }

  once(eventName, listener) {
    if (!this._onceListeners.hasOwnProperty(eventName))
      this._onceListeners[eventName] = [];
    this._onceListeners[eventName].push(listener);
  }

  on(eventName, listener) {
    if (!this._listeners.hasOwnProperty(eventName))
      this._listeners[eventName] = [];
    this._listeners[eventName].push(listener);
  }

  emit(eventName, ...args) {
    const arr = this.listeners(eventName);
    arr.map(listener => {
      return listener(...args);
    });

    const onceArr = this.onceListeners(eventName);
    const length = onceArr.length;
    for (let i = 0; i < length; i++) {
      onceArr.pop()(...args);
    }
  }

  removeListener(eventName, listener) {
    if (!this._listeners.hasOwnProperty(eventName)) return false;
    const index = this._listeners[eventName].indexOf(listener);
    return this._listeners[eventName].splice(index, 1);
  }

  listeners(eventName) {
    return this._listeners[eventName] || [];
  }

  onceListeners(eventName) {
    return this._onceListeners[eventName] || [];
  }
}

const checkArg = (inputArg, rule) => {
  const errors = [];
  if (rule === 'watch') {
    if (typeof inputArg !== 'function') {
      errors.push('watch api need a callback function.');
    }
    return errors;
  }

  Object.entries(rule).map(([key, defines]) => {
    const keys = key.split('.');
    let currentLevelArg = inputArg;
    if (defines[0] && !currentLevelArg) {
      const error = `need argument.`;
      if (errors.indexOf(error) === -1) errors.push(error);
    }
    keys.map((_key, level) => {
      if (currentLevelArg) {
        const value = currentLevelArg[_key];
        const currentKey = [...keys].splice(0, level + 1).join('.');
        if (level < keys.length - 1) {
          if (value) return (currentLevelArg = value);
          if (rule[currentKey] && rule[currentKey][0] === false)
            return (currentLevelArg = false);
          const error = `${currentKey} not exists.`;
          if (errors.indexOf(error) === -1) errors.push(error);
          return null;
        }
        if (defines[0] && value === undefined) {
          const error = `${currentKey} not exists.`;
          if (errors.indexOf(error) === -1) errors.push(error);
        }
        if (value !== undefined && typeof value !== defines[1]) {
          const error = `${currentKey} type error. expact ${
            defines[1]
          } get ${typeof value}`;
          if (errors.indexOf(error) === -1) errors.push(error);
        }
      }
      return null;
    });
    return null;
  });
  return errors;
};

export default new DB();
