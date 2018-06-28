import { observable } from 'mobx';

export default class Model{
    @observable score;
    @observable backend;
    @observable featureImportance;
    @observable recommend = false;

    constructor(userId, projectId, backend, model) {
        this.userId = userId;
        this.projectId = projectId;
        this.backend = backend;
        Object.assign(this, model);
    }
}