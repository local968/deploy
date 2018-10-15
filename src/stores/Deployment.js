import { observable } from 'mobx';
import moment from 'moment';
import socketStore from 'stores/SocketStore';

const defaultDeploymentOptions = {
  option: null,
  source: null,
  sourceOptions: {},
  location: null,
  locationOptions: {},
  file: {},
  frequency: null,
  frequencyOptions: {},
  autoDisable: null
};

const defaultPerformanceOptions = {
  source: null,
  sourceOptions: {},
  file: {},
  measurementMetric: 'AUC',
  metricThreshold: 0.7,
  frequency: null,
  frequencyOptions: {},
  autoDisable: null
};

export default class Deploy {
  @observable id;

  @observable userId;
  @observable projectId;
  @observable projectName;
  @observable modelId;
  @observable modelName;
  @observable modelType;
  @observable createdDate;
  @observable enable;
  @observable email;

  @observable deploymentOptions = { ...defaultDeploymentOptions };
  @observable performanceOptions = { ...defaultPerformanceOptions };

  constructor(deploy) {
    this.id = deploy.id;
    this.userId = deploy.userId;
    this.projectId = deploy.projectId;
    this.projectName = deploy.projectName;
    this.modelId = deploy.modelId;
    this.modelName = deploy.modelName;
    this.modelType = deploy.modelType;
    this.enable = deploy.enable;
    this.createdDate = deploy.createdDate;
    this.email = deploy.email;
    this.deploymentOptions = {
      ...defaultDeploymentOptions,
      ...deploy.deploymentOptions
    };
    this.performanceOptions = {
      ...defaultPerformanceOptions,
      metricThreshold: deploy.modelType === 'Classification' ? 0.7 : 0.5,
      measurementMetric: deploy.modelType === 'Classification' ? 'AUC' : 'R2',
      ...deploy.performanceOptions
    };
  }

  save = () => {
    return new Promise((resolve, reject) => {
      socketStore.ready().then(api => {
        api.updateDeployment({
          data: {
            id: this.id,
            projectId: this.projectId,
            projectName: this.projectName,
            modelName: this.modelName,
            modelType: this.modelType,
            createdDate: this.createdDate,
            email: this.email,
            enable: this.enable,
            deploymentOptions: this.deploymentOptions,
            performanceOptions: this.performanceOptions
          }
        });
      });
    });
  };

  log = () =>
    console.log({
      id: this.id,
      userId: this.userId,
      projectId: this.projectId,
      projectName: this.projectName,
      modelName: this.modelName,
      modelType: this.modelType,
      createdDate: this.createdDate,
      email: this.email,
      enable: this.enable,
      deploymentOptions: this.deploymentOptions,
      performanceOptions: this.performanceOptions,
      updatedDate: moment().unix()
    });
}
