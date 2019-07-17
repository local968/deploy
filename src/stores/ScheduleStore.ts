import { observable, computed, when, action } from 'mobx';
import socketStore from 'stores/SocketStore';
import userStore from 'stores/UserStore';
import deploymentStore from './DeploymentStore';

export interface Schedule {
  deploymentId: string;
  modelName: string;
  type: string;
  estimatedTime: number;
  ends?: number | string | unknown;
  threshold?: unknown | null;
  prevSchedule?: unknown | null;
  status: string;
  actualTime?: unknown | null;
  updatedDate: number;
  createdDate: number;
  name?: string;
  owner?: string;
}

const sortStrategies = {
  createdDate: (a: Schedule, b: Schedule) =>
    a.createdDate === b.createdDate
      ? 0
      : a.createdDate > b.createdDate
        ? -1
        : 1,
  rcreatedDate: (a: Schedule, b: Schedule) =>
    a.createdDate === b.createdDate
      ? 0
      : a.createdDate < b.createdDate
        ? -1
        : 1,
  updatedDate: (a: Schedule, b: Schedule) =>
    a.updatedDate === b.updatedDate
      ? 0
      : a.updatedDate > b.updatedDate
        ? -1
        : 1,
  rupdatedDate: (a: Schedule, b: Schedule) =>
    a.updatedDate === b.updatedDate
      ? 0
      : a.updatedDate < b.updatedDate
        ? -1
        : 1,
  projectName: (a: Schedule, b: Schedule) => a.name.localeCompare(b.name),
  rprojectName: (a: Schedule, b: Schedule) => a.name.localeCompare(b.name) * -1,
  modelName: (a: Schedule, b: Schedule) => a.modelName.localeCompare(b.modelName),
  rmodelName: (a: Schedule, b: Schedule) => a.modelName.localeCompare(b.modelName) * -1
};

const filter = (keywords: string, schedules: Schedule[]) => {
  if (!keywords || keywords === '') return schedules;
  const result: Schedule[] = [];
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
  perPageOptions: { 5: string, 10: string, 20: string } = {
    // 2: '2',
    5: '5',
    10: '10',
    20: '20'
  };

  @observable schedules: Schedule[] = [];
  @observable watchingList: boolean = false

  @observable sortOptions: {
    keywords: string
    sortBy: string
    perPage: number
    currentPage: number
  } = {
      keywords: '',
      sortBy: 'createdDate',
      perPage: 10,
      currentPage: 1
    };

  constructor() {
    socketStore.ready().then(api => {
      this.initWatch()
      api.on('online', this.initWatch)
      api.on('offline', this.onOffline)
    })
  }

  initWatch = () => {
    when(
      () => userStore.status === 'login' && !!userStore.info.id,
      () =>
        socketStore.ready().then(api => {
          const callback = action((response: { list: Schedule[] }) => {
            this.schedules = response.list;
            this.watchingList = true
          })
          api.watchSchedule().then(callback);
          api.on('watchSchedule', callback)
        })
    );
  }

  onOffline = action(() => {
    this.watchingList = false
  })

  @computed
  get sortedDeploymentSchedules() {
    return this.sortSchedules('deployment', this.schedules, deploymentStore.deployments);
  }

  @computed
  get sortedPerformanceSchedules() {
    return this.sortSchedules('performance', this.schedules, deploymentStore.deployments);
  }

  sortSchedules = (type: string, schedules: Schedule[], deployments: { id: string }[]) => {
    if (deployments.length === 0) return []
    const _schedules = schedules.filter(
      s => s && s.type === type && parseInt(s.deploymentId, 10) === parseInt(deploymentStore.currentId, 10)
    );

    let result = [];

    // keywords
    result = filter(this.sortOptions.keywords, _schedules);

    // order
    result = result.sort(Reflect.get(sortStrategies, this.sortOptions.sortBy));

    // pagination
    const start =
      (this.sortOptions.currentPage - 1) *
      parseInt(this.sortOptions.perPage.toString(), 10);
    const end = start + parseInt(this.sortOptions.perPage.toString(), 10);
    result = result.slice(start, end);
    result = result.map(schedule => ({
      schedule,
      deployment: deployments.find(
        deployment => deployment.id === schedule.deploymentId
      )
    }));

    return result;
  };

  getLastSchedule = (deploymentId: string, type: string = 'deployment') => this.schedules
    .filter(
      schedule =>
        schedule && schedule.deploymentId === deploymentId && schedule.type === type
    )
    .reduce(
      (prev, curr) =>
        (prev.updatedDate || 0) < curr.updatedDate ? curr : prev,
      {} as Schedule
    );
}

export { ScheduleStore }

export default new ScheduleStore();
