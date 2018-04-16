import { observable, action, computed, autorun } from 'mobx';
import deployStore from './DeployStore.js';
import moment from 'moment';
import db from './db.js';

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
  projectName: (a, b) => a.name.localeCompare(b.name),
  rprojectName: (a, b) => a.name.localeCompare(b.name) * -1,
  modelName: (a, b) => a.modelName.localeCompare(b.modelName),
  rmodelName: (a, b) => a.modelName.localeCompare(b.modelName) * -1
};

const filter = (keywords, schedules) => {
  if (!keywords || keywords === '') return schedules;
  const result = [];
  schedules.map((_d, index) => {
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

class ScheduleStore {
  perPageOptions = {
    // 2: '2',
    5: '5',
    10: '10',
    20: '20'
  };

  @observable schedules = [];

  @observable
  sortOptions = {
    keywords: '',
    sortBy: 'createdDate',
    perPage: 10,
    currentPage: 1
  };

  constructor() {
    db('schedules')
      .watch()
      .subscribe(schedules => {
        this.schedules = schedules;
      });
  }

  @computed
  get sortedDeploymentSchedules() {
    return this.sortSchedules('deployment');
  }

  @computed
  get sortedPerformanceSchedules() {
    return this.sortSchedules('performance');
  }

  sortSchedules = type => {
    const _schedules = this.schedules.filter(
      s => s.type === type && s.deploymentId === deployStore.currentId
    );
    let result = [];

    // keywords
    result = filter(this.sortOptions.keywords, _schedules);

    // order
    result = result.sort(sortStrategies[this.sortOptions.sortBy]);

    // pagination
    const start =
      (this.sortOptions.currentPage - 1) *
      parseInt(this.sortOptions.perPage, 10);
    const end = start + parseInt(this.sortOptions.perPage, 10);
    result = result.slice(start, end);

    result = result.map(schedule => ({
      schedule,
      deployment: deployStore.deployments.find(
        deployment => deployment.id === schedule.deploymentId
      )
    }));

    return result;
  };
}

export default new ScheduleStore();
