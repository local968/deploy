import db from './db.js';
import { observable, action, computed, autorun } from 'mobx';

const _cache = {};

class ApproachStore {
  @observable approach = null;

  constructor(){
    this.approachTable = db('approaches');
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
