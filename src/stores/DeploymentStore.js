import { observable, action, computed, when } from 'mobx';
import userStore from 'stores/UserStore';
import Deployment from './Deployment';
import socketStore from 'stores/SocketStore';

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
            (_d.userId && _d.userId.indexOf(word) >= 0) ||
            (_d.modelName && _d.modelName.indexOf(word) >= 0)
            ? true
            : false
      );
    if (_results.indexOf(false) === -1) result.push(_d);
    return true;
  });
  return result;
};

class DeploymentStore {
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
    const _deployment = this.deployments.find(({ id }) => id === parseInt(this.currentId));
    return new Deployment(_deployment || {});
  }

  @computed
  get dataDefinition() {
    if (!this.currentModel) return '';
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += this.currentModel.variableList.join(',');
    return encodeURI(csvContent);
  }

  constructor() {
    when(
      () => userStore.status === 'login',
      () =>
        socketStore.ready().then(api => {
          // api.searchDeployment().then(response => {
          //   console.log(response)
          //   this.deployments = response.list;
          // });
          api.watchDeployments().then(response => {
            console.log(response)
            this.deployments = response.list;
          });

          api.on('watchDeployments', response => {
            console.log(response, 'from watch')
          })
        })
    );
  }

  async addDeployment(projectId, projectName, modelName, modelType) {
    const data = {
      deploymentOptions: {},
      modelName,
      modelType,
      projectId,
      projectName,
      performanceOptions: {}
    };
    const api = await socketStore.ready();
    const response = await api.addDeployment({ data });
    if (response.status !== 200) {
      throw new Error(response.message);
    }
    return response.id;
  }

  @action
  create(project) {
    return new Promise((resolve, reject) => {
      socketStore.ready().then(api => api.addDeployment({ tuple: project }));
    });
  }

  @action
  change(id, key, value) {
    const _d = new Deployment(this.deployments.find(_d => _d.id === id));
    _d[key] = value;
    return _d.save();
  }

  @action
  toggleEnable(id, value) {
    const _d = new Deployment(this.deployments.find(_d => _d.id === id));
    if (value) {
      _d.enable = value;
    } else {
      _d.enable = !_d.enable;
      socketStore.ready().then(api => {
        if (_d.enable === false) {
          api.suspendDeployment({ id });
        } else if (_d.enable === true) {
          api.deploySchedule({
            deploymentId: id,
            type: 'deployment'
          });
          api.deploySchedule({
            deploymentId: id,
            type: 'performance',
            threshold: {
              type: _d.performanceOptions.measurementMetric,
              value: _d.performanceOptions.metricThreshold
            }
          });
        }
      });
    }

    return _d.save();
  }

  @action
  delete(id) {
    socketStore.ready().then(api => api.removeDeployment({ id }));
  }

  @action
  changeSort = (key, value) => {
    this.sortOptions[key] = value;
  };

  deploySchedule = schedule => {
    // todo
  }
}

export default new DeploymentStore();
