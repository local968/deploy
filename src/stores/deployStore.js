import { observable, action, computed } from 'mobx';
import Deployment from './Deployment';
import moment from 'moment';
import db from './db.js';

const sortStrategies = {
  createdDate: (a, b) =>
    a.createdDate === b.createdDate
      ? 0
      : a.createdDate > b.createdDate ? -1 : 1,
  rcreatedDate: (a, b) =>
    a.createdDate === b.createdDate
      ? 0
      : a.createdDate < b.createdDate ? -1 : 1,
  projectName: (a, b) => a.name.localeCompare(b.name),
  rprojectName: (a, b) => a.name.localeCompare(b.name) * -1,
  modelName: (a, b) => a.modelName.localeCompare(b.modelName),
  rmodelName: (a, b) => a.modelName.localeCompare(b.modelName) * -1
};

const filter = (keywords, deployments) => {
  if (!keywords || keywords === '') return deployments;
  const result = [];
  deployments.map((_d, index) => {
    const _results = keywords
      .split(' ')
      .map(
        word =>
          (_d.name && _d.name.indexOf(word) >= 0) ||
          (_d.owner && _d.owner.indexOf(word) >= 0) ||
          (_d.modelName && _d.modelName.indexOf(word) >= 0)
            ? true
            : false
      );
    if (_results.indexOf(false) === -1) result.push(_d);
    return true;
  });
  return result;
};

class DeployStore {
  sortByOptions = {
    createdDate: 'Created Date ∧',
    rcreatedDate: 'Created Date ∨',
    projectName: 'Project Name ∧',
    rprojectName: 'Project Name ∨',
    modelName: 'Model Name ∧',
    rmodelName: 'Model Name ∨'
  };

  perPageOptions = {
    // 2: '2',
    5: '5',
    10: '10',
    20: '20'
  };

  @observable deployments = [];
  @observable currentId;
  @observable
  sortOptions = {
    keywords: '',
    sortBy: 'createdDate',
    perPage: 10,
    currentPage: 1
  };

  @computed
  get totalCount() {
    return filter(this.sortOptions.keywords, this.deployments).length;
  }

  @computed
  get sortedDeployments() {
    const _deployments = this.deployments.slice();
    let result = [];

    // keywords
    result = filter(this.sortOptions.keywords, _deployments);

    // order
    result = result.sort(sortStrategies[this.sortOptions.sortBy]);

    // pagination
    const start =
      (this.sortOptions.currentPage - 1) *
      parseInt(this.sortOptions.perPage, 10);
    const end = start + parseInt(this.sortOptions.perPage, 10);
    result = result.slice(start, end);

    return result;
  }

  @computed
  get currentDeployment() {
    const _deployment = this.deployments.find(
      ({ id }) => id === this.currentId
    );
    return new Deployment(_deployment || {});
  }

  @computed
  get currentModel() {
    console.log(this.currentDeployment.modelName);
    const model = db('models')
      .find({ id: this.currentDeployment.modelName })
      .fetch()
      // .watch()
      .subscribe(console.log, console.log, console.log);
    return model;
  }

  constructor() {
    db('deployments')
      .watch()
      .subscribe(deployments => {
        this.deployments = deployments;
      });
  }

  @action
  create(project) {
    return new Promise((resolve, reject) => {
      db('deployments')
        .store({ ...project, createdDate: moment().unix() })
        .subscribe(resolve);
    });
  }

  @action
  change(id, key, value) {
    const _d = new Deployment(this.deployments.find(_d => _d.id === id));
    _d[key] = value;
    return _d.save();
  }

  @action
  toggleEnable(id) {
    const _d = new Deployment(this.deployments.find(_d => _d.id === id));
    _d.deploymentOptions.enable = !_d.deploymentOptions.enable;
    console.log(this.currentModel);
    return _d.save();
  }

  @action
  changeSort = (key, value) => {
    this.sortOptions[key] = value;
  };
}

export default new DeployStore();
