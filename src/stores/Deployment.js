import { observable } from 'mobx';
import moment from 'moment';
import db from './db.js';

const defaultDeploymentOptions = {
  option: null,
  source: null,
  sourceOptions: {},
  location: null,
  locationOptions: {},
  frequency: null,
  frequencyOptions: {},
  autoDisable: null,
  enable: null
};

const defaultPerformanceOptions = {
  source: null,
  sourceOptions: {},
  measurementMetric: 'AUC',
  metricThreshold: 70,
  frequency: null,
  frequencyOptions: {},
  autoDisable: null,
  enable: false
};

export default class Deployment {
  @observable id;

  @observable name;
  @observable modelId;
  @observable modelName;
  @observable modelType;
  @observable createdDate;
  @observable email;
  @observable owner;

  @observable deploymentOptions = { ...defaultDeploymentOptions };
  @observable performanceOptions = { ...defaultPerformanceOptions };

  constructor(deploy) {
    this.id = deploy.id;
    this.name = deploy.name;
    this.modelId = deploy.modelId;
    this.modelName = deploy.modelName;
    this.modelType = deploy.modelType;
    this.createdDate = deploy.createdDate;
    this.email = deploy.email;
    this.owner = deploy.owner;
    this.deploymentOptions = deploy.deploymentOptions || {
      ...defaultDeploymentOptions
    };
    this.performanceOptions = deploy.performanceOptions || {
      ...defaultPerformanceOptions,
      metricThreshold: deploy.modelType === 'Classification' ? 70 : 50
    };
  }

  save = () => {
    return new Promise((resolve, reject) => {
      db('deployments')
        .store({
          id: this.id,
          name: this.name,
          modelName: this.modelName,
          modelType: this.modelType,
          createdDate: this.createdDate,
          email: this.email,
          deploymentOptions: this.deploymentOptions,
          performanceOptions: this.performanceOptions,
          updatedDate: moment().unix()
        })
        .subscribe(resolve);
    });
  };

  log = () =>
    console.log({
      id: this.id,
      name: this.name,
      modelName: this.modelName,
      modelType: this.modelType,
      createdDate: this.createdDate,
      email: this.email,
      deploymentOptions: this.deploymentOptions,
      performanceOptions: this.performanceOptions,
      updatedDate: moment().unix()
    });
}
