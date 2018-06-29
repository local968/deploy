import db from './db.js';
import { action, computed, when } from 'mobx';
import socketStore from './SocketStore.js'

 class RequestStore {

    constructor() {
        this.modelRequestTable = db('modeling_request');
        this.initCallback();
    }

    @computed
    get userId() {
        return 'devUser';
    }

    @action
    sendRequest(id, request) {
        when( () => socketStore.isready,
            () => {
            socketStore.send("changeRequest", {id, params: request})
        })
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