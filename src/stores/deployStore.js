import { observable, action } from 'mobx';
import moment from 'moment';
import db from './db.js';

class DeployStore {
  @observable deployments = [];

  constructor() {
    db('deployments')
      .watch()
      .subscribe(deployments => (this.deployments = deployments));
  }

  @action
  create(project) {
    return new Promise((resolve, reject) => {
      db('deployments')
        .store({ ...project, createdDate: moment().unix() })
        .subscribe(resolve);
    });
  }
}

export default new DeployStore();
