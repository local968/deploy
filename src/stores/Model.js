import { observable } from 'mobx';

export default class Model{
    @observable score;
    @observable backend;
    @observable featureImportance;
    @observable recommend = false;
    @observable executeTime = 0;

    constructor(userId, projectId, backend, model) {
        this.userId = userId;
        this.projectId = projectId;
        this.backend = backend;
        Object.assign(this, model);
    }
}