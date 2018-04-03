import { observable } from 'mobx';
import moment from 'moment';
import db from './db.js';

export default class Deployment {
  @observable id = '';

  @observable name = '';
  @observable modelName = '';
  @observable createdDate;
  @observable email = '';

  @observable option;

  @observable source;
  @observable sourceOptions;

  @observable location;
  @observable locationOptions;

  @observable frequency;
  @observable frequencyOptions;

  @observable autoDisable;

  constructor(deploy) {
    this.id = deploy.id;
    this.name = deploy.name;
    this.modelName = deploy.modelName;
    this.createdDate = deploy.createdDate;
    this.email = deploy.email;
    this.option = deploy.option;
    this.source = deploy.source;
    this.sourceOptions = deploy.sourceOptions;
    this.location = deploy.location;
    this.locationOptions = deploy.locationOptions;
    this.frequency = deploy.frequency;
    this.frequencyOptions = deploy.frequencyOptions;
    this.autoDisable = deploy.autoDisable;
  }

  save = () => {
    return new Promise((resolve, reject) => {
      db('deployments')
        .store({
          id: this.id,
          name: this.name,
          modelName: this.modelName,
          createdDate: this.createdDate,
          email: this.email,
          option: this.option,
          source: this.source,
          sourceOptions: this.sourceOptions,
          location: this.location,
          locationOptions: this.locationOptions,
          frequency: this.frequency,
          frequencyOptions: this.frequencyOptions,
          autoDisable: this.autoDisable,
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
      createdDate: this.createdDate,
      email: this.email,
      option: this.option,
      source: this.source,
      sourceOptions: this.sourceOptions,
      location: this.location,
      locationOptions: this.locationOptions,
      frequency: this.frequency,
      frequencyOptions: this.frequencyOptions,
      autoDisable: this.autoDisable,
      updatedDate: moment().unix()
    });
}
