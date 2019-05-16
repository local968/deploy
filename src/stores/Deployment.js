import { observable, computed } from 'mobx';
import moment from 'moment';
import { action } from 'mobx';
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
  @observable modelList;
  @observable lineCount;

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
    this.lineCount = deploy.lineCount;
    this.deploymentOptions = {
      ...defaultDeploymentOptions,
      ...deploy.deploymentOptions
    };
    let default_measurementMetric;
    switch (deploy.modelType) {
      case 'Classification':
        default_measurementMetric = 'AUC';
        break;
      case 'Regression':
        default_measurementMetric = 'R2';
        break;
      case 'Outlier':
        default_measurementMetric = 'Accuracy';
        break;
      case 'Clustering':
        default_measurementMetric = 'CVNN';
        break;
    }

    this.performanceOptions = {
      ...defaultPerformanceOptions,
      metricThreshold: deploy.modelType === 'Classification' ? 0.7 : 0.5,
      measurementMetric: default_measurementMetric,
      ...deploy.performanceOptions
    };
    this.getModelInfo()
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
            performanceOptions: this.performanceOptions,
            lineCount: this.lineCount
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

  getModelInfo = action(async () => {
    const api = await socketStore.ready()
    const { modelList } = await api.getAllModels({ projectId: this.projectId })
    this.modelList = modelList
  })

  findModel = (modelName) => {
    let result
    this.modelList && Object.entries(this.modelList).forEach(([settingName, models]) => {
      if (result) return
      models.forEach(model => {
        if (result||!model) return
        if (model.name === modelName) result = model
      })
    })
    return result
  }

  @computed
  get currentModel() {
    if (!this.modelList) return
    return this.findModel(this.modelName)
  }

  getDeploymentToken = async () => {
    const api = await socketStore.ready()
    const result = await api.getDeploymentToken({ deploymentId: this.id, projectId: this.projectId })
    return result.token
  }
}
