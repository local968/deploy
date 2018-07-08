import { observable } from 'mobx';
import moment from 'moment';
// import db from './db.js';
import DBStore from 'stores/DBStore';

const defaultDeploymentOptions = {
  option: null,
  source: null,
  sourceOptions: {},
  location: null,
  locationOptions: {},
  file: {},
  frequency: null,
  frequencyOptions: {},
  autoDisable: null,
  enable: null
};

const defaultPerformanceOptions = {
  source: null,
  sourceOptions: {},
  file: {},
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
    this.projectName = deploy.projectName;
    this.modelId = deploy.modelId;
    this.modelName = deploy.modelName;
    this.modelType = deploy.modelType;
    this.createdDate = deploy.createdDate;
    this.email = deploy.email;
    this.owner = deploy.owner;
    this.deploymentOptions = {
      ...defaultDeploymentOptions,
      ...deploy.deploymentOptions
    };
    this.performanceOptions = {
      ...defaultPerformanceOptions,
      ...deploy.performanceOptions,
      metricThreshold: deploy.modelType === 'Classification' ? 70 : 50
    };
  }

  save = () => {
    return new Promise((resolve, reject) => {
      DBStore.ready().then(db => {
        db.updateDeploy({
          tuple: {
            id: this.id,
            projectName: this.projectName,
            modelName: this.modelName,
            modelType: this.modelType,
            createdDate: this.createdDate,
            email: this.email,
            deploymentOptions: this.deploymentOptions,
            performanceOptions: this.performanceOptions,
            updatedDate: moment().unix()
          }
        });
      });
    });
  };

  log = () =>
    console.log({
      id: this.id,
      projectName: this.projectName,
      modelName: this.modelName,
      modelType: this.modelType,
      createdDate: this.createdDate,
      email: this.email,
      deploymentOptions: this.deploymentOptions,
      performanceOptions: this.performanceOptions,
      updatedDate: moment().unix()
    });
}
