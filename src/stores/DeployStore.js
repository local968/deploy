import { observable, action, computed, autorun } from 'mobx';
import Deployment from './Deployment';
import moment from 'moment';
// import db from './db.js';
import DBStore from 'stores/DBStore';

const sortStrategies = {
  createdDate: (a, b) =>
    a.createdDate === b.createdDate
      ? 0
      : a.createdDate > b.createdDate
        ? -1
        : 1,
  rcreatedDate: (a, b) =>
    a.createdDate === b.createdDate
      ? 0
      : a.createdDate < b.createdDate
        ? -1
        : 1,
  projectName: (a, b) => a.projectName.localeCompare(b.projectName),
  rprojectName: (a, b) => a.projectName.localeCompare(b.projectName) * -1,
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
          (_d.projectName && _d.projectName.indexOf(word) >= 0) ||
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
  @observable currentModel;

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

  constructor() {
    DBStore.ready().then(db => {
      db.searchDeploy().then(response => {
        this.deployments = response.result;
      });
      db.watchDeploy(response => {
        this.deployments = response.result;
      });
    });

    // autorun(() => {
    //   if (
    //     this.currentId &&
    //     this.currentDeployment &&
    //     this.currentDeployment.modelId
    //   )
    //     db('models')
    //       .find({ id: this.currentDeployment.modelId })
    //       .fetch()
    //       .subscribe(model => (this.currentModel = model));
    // });
  }

  @computed
  get dataDefinition() {
    if (!this.currentModel) return '';
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += this.currentModel.variableList.join(',');
    return encodeURI(csvContent);
  }

  @action
  create(project) {
    return new Promise((resolve, reject) => {
      DBStore.ready().then(db => db.newDeploy({ tuple: project }));
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
    return _d.save();
  }

  @action
  changeSort = (key, value) => {
    this.sortOptions[key] = value;
  };
}

export default new DeployStore();
