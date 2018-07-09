import DBStore from 'stores/DBStore';
import { observable } from 'mobx';

class SocketStore {
  @observable isready = false;
  messageArr = {};

  constructor() {
    // this.messageArr = {};
    // this.ws = new R2WSClient("ws://localhost:18000/");
    // this.ws.onready = evt => {
    //     console.log('ws connected.');
    //     this.isready = true;
    // };
    // console.log(this.ws)
    // this.ws.onmessage = evt => {
    //     //u need not to this function now
    //     console.log('receive data:', evt.data);
    //     this.cb(evt);
    // };
    // this.ws.onclose = evt => {
    //     console.log("onclose",evt)
    // }
    // this.ws.onerror = evt => {
    //     console.log("onerror",evt)
    // }
    DBStore.ready().then(db => {
      db._db.on('message', this.cb.bind(this));
      this.isready = true;
    });
  }

  send(type, data) {
    // console.log({ type, data });
    DBStore.ready().then(db => db._db.connection.sendmessage({ type, data }));
  }

  cb(evt) {
    // console.log(this.messageArr);
    const fn = this.messageArr[evt.data.type];
    if (typeof fn === 'function') {
      //   console.log(evt.data.type + ' callback');
      fn(evt.data.data);
    }
  }

  addMessageArr(obj) {
    Object.assign(this.messageArr, obj);
  }
}

export default new SocketStore();
