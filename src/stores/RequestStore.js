import db from './db.js';
import { action, computed, when } from 'mobx';
import config from '../config.js';
import socketStore from './SocketStore.js'

 class RequestStore {

    constructor() {
        this.modelRequestTable = db('modeling_request');
        if(config.database === "tarantool"){
            this.initCallback();
        }
    }

    @computed
    get userId() {
        return 'devUser';
    }

    @action
    sendRequest(id, request) {
        if(config.database === "tarantool"){
            when( () => socketStore.isready,
                () => {
                socketStore.send("changeRequest", {id, params: request})
            })
        }else{
            this.modelRequestTable.store(request);
        }
    }

    initCallback() {
        const callback = {
            changeRequest: action(data => {
                console.log(data)
            }),
            onResult: action(data => {
                console.log(data)
            })
        }

        socketStore.addMessageArr(callback);
    }
}
  
export default new RequestStore();