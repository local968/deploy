import R2WSClient from '../r2ws-client';

const debug = false;

const operators = [
  'get',
  'insert',
  'update',
  'upsert',
  'replace',
  'delete',
  'watch'
];

const spaces = ['test'];

class DB {
  status = 'init';
  _listeners = {};
  connection;
  reqNo = 1;

  constructor(connect = true) {
    if (connect) this.connect();

    const db = spaces.reduce((prev, space) => {
      prev[space] = operators.reduce((prev, operator) => {
        prev[operator] = this[operator].bind(this, space);
        return prev;
      }, {});
      return prev;
    }, {});

    db._DB = this;

    return db;
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
        if (data.data.reqNo) return this.emit(data.data.reqNo, data.data);
        if (data.data.eventName)
          return this.emit(data.data.eventName, data.data);
        console.error('message error:', data);
      });
      this.once('ready', conn => {
        this.connection = conn;
        this.status = 'ready';
        resolve(conn);
      });
    });
  }

  async send(type, data) {
    // type: get, insert, update, upsert, delete, watch, unwatch
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

  async get(space, index, args) {
    if (!Array.isArray(args)) args = [args];
    return await this.send('get', { space, index, args });
  }

  async insert(space, tuple) {
    return await this.send('insert', { space, tuple });
  }

  async replace(space, tuple) {
    return await this.send('replace', { space, tuple });
  }

  async update(space, index, key, modifier) {
    return await this.send('update', { space, index, key, modifier });
  }

  async upsert(space, tuple, modifier) {
    return await this.send('upsert', { space, tuple, modifier });
  }

  async delete(space, key) {
    return await this.send('delete', { space, key });
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

export default new DB();
