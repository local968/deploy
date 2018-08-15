import { observable } from 'mobx';

export default class Model{
    @observable score;
    @observable backend;
    @observable featureImportance;
    @observable recommend = false;
    @observable executeSpeed = 0;
    @observable name = "";
    @observable predicted = [];
    @observable fitIndex = 0;

    constructor(userId, projectId, model, name) {
        this.userId = userId;
        this.projectId = projectId;
        this.id = name;
        Object.assign(this, model);
    }

    updateModel(data) {
        Object.assign(this, data);
    }
}