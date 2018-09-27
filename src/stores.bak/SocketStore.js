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
    DBStore._db.on('ready', () => {
      DBStore._db.on('message', this.cb.bind(this));
      this.isready = true;
    });
    DBStore._db.on('close', () => {
      DBStore._db.removeListener('message', this.cb.bind(this));
      this.isready = false;
    });
  }

  send(type, data) {
    // console.log({ type, data });
    DBStore.ready().then(db => db._db.connection.sendmessage({ type, data }));
  }

  cb(evt) {
    // console.log(this.messageArr);
    let fns = this.messageArr[evt.data.type];
    if(!fns) return;
    for(let fn of fns) {
      if (typeof fn === 'function') {
        //   console.log(evt.data.type + ' callback');
        fn(evt.data.data);
      }
    }
  }

  addMessageArr(obj) {
    for(let key in obj) {
      this.messageArr[key] = this.messageArr[key] || [];
      this.messageArr[key].push(obj[key])
    }
  }
}

export default new SocketStore();
