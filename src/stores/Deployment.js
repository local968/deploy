import { observable } from 'mobx';

export default class Deployment {
  @observable name = '';
  @observable modelName = '';
  @observable createdDate;
  @observable email = '';

  @observable option;
  @observable source;
  @observable location;
  @observable frequency;

  constructor(deploy) {
    this.name = deploy.name;
    this.modelName = deploy.modelName;
    this.createdDate = deploy.createdDate;
    this.email = deploy.email;
    this.option = deploy.option;
    this.source = deploy.source;
    this.location = deploy.location;
    this.frequency = deploy.frequency;
  }
}
