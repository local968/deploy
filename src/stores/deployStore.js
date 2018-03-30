import { observable, action, computed } from 'mobx';
import Deployment from './Deployment';
import moment from 'moment';
import db from './db.js';

class DeployStore {
  @observable deployments = [];
  @observable currentId;

  @computed
  get currentDeployment() {
    const _deployment = this.deployments.find(
      ({ id }) => id === this.currentId
    );
    return _deployment ? new Deployment(_deployment) : null;
  }

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
