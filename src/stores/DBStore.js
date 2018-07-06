import R2WSClient from '../r2ws-client';

const debug = true;

class DB {
  status = 'init';
  _listeners = {};
  connection;
  reqNo = 1;
  db = {};

  constructor(connect = true) {
    if (connect) this.connect();

    return this.db;
  }

  async connect() {
    if (this.connection) return this.connection;
    if (this.listeners('ready').length > 0) {
      return await new Promise((resolve, reject) => {
        this.once('ready', resolve);
      });
    }
    const _conn = new R2WSClient('ws://localhost:18000/');

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
        if (data.data.eventName)
          return this.emit(data.data.eventName, data.data);
        console.error('message error:', data);
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
        return this.send(apiName, inputArg);
      };
    });
  }

  async send(type, data) {
    // type: select, insert, update, upsert, delete, watch, unwatch
    const conn = await this.connect();
    if (type === 'watch') {
      conn.sendmessage({ type, data });
    } else {
      this.reqNo++;
      conn.sendmessage({ type, data: { reqNo: this.reqNo, ...data } });
      return await new Promise((resolve, reject) => {
        this.once(this.reqNo, (...args) => {
          if (args.length === 1) args = args[0];
          resolve(args);
        });
      });
    }
  }

  watch(space, listener) {
    this.on(space, listener);
    if (this.listeners(space).length > 0) this.send('watch', { space });
    return async () => {
      this.removeListener(space);
      if (this.listeners(space).length === 0) this.send('unwatch', { space });
    };
  }

  once(eventName, listener) {
    if (!this._listeners.hasOwnProperty(eventName))
      this._listeners[eventName] = [];
    const _listener = (...args) => {
      listener(...args);
      this.removeListener(eventName, _listener);
    };
    this._listeners[eventName].push(_listener);
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
  }

  removeListener(eventName, listener) {
    if (!this._listeners.hasOwnProperty(eventName)) return false;
    const index = this._listeners[eventName].indexOf(listener);
    return this._listeners[eventName].splice(index, 1);
  }

  listeners(eventName) {
    return this._listeners[eventName] || [];
  }
}

const checkArg = (inputArg, rule) => {
  const errors = [];
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
          return;
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
    });
  });
  return errors;
};

export default new DB();
