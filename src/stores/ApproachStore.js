import db from './db.js';
import { observable, action, computed, autorun } from 'mobx';
import Approach from './Approach.js';
import config from '../config.js';
import socketStore from './SocketStore.js'

const _cache = {};

class ApproachStore {
  @observable approach = null;

  constructor(){
    this.approachTable = db('approaches');
    this.initCallback();
  }

  @action
  init(projectId, approachId) {
    if(config.database === "tarantool"){
        autorun(reaction => {
            if (!socketStore.isready) return;
            socketStore.send("queryApproach", {userId: this.userId, projectId: projectId, approachId:approachId})
            reaction.dispose();
        })
    }else{
        this.approachTable
            .find({userId: this.userId, projectId: projectId, approachId:approachId})
            .fetch()
            .subscribe( approach => {
                this.approach = new Approach(this.userId, projectId, approachId, approach);
            })
    }
  }

  @computed
  get userId() {
      return "devUser";
  }

  initCallback() {
    const callback = {
      queryApproach: data => {
        const approach = data.list[0];
        this.approaches = new Approach(this.userId, this.projectId, approach.approachId, approach.args);
      }
    }

    socketStore.addMessageArr(callback);
  }

  getApproach = projectId =>
    _cache[projectId]
      ? Promise.resolve(_cache[projectId])
      : new Promise((resolve, reject) => {
          projectId = parseInt(projectId, 10);
          db('approaches')
            .find({ projectId })
            .fetch()
            .subscribe(approach => {
              _cache[projectId] = approach;
              resolve(approach);
            }, reject);
        });
}

export default new ApproachStore();
