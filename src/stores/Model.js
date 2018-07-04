import { observable } from 'mobx';

export default class Model{
    @observable score;
    @observable backend;
    @observable featureImportance;
    @observable recommend = false;
    @observable executeSpeed = 0;
    @observable name = "";
    @observable predicted = [];

    constructor(userId, projectId, model) {
        this.userId = userId;
        this.projectId = projectId;
        switch(model.backend){
            case "gbm":
                this.name = model.problemType + "_solution1"
                break;
            case "cat":
                this.name = model.problemType + "_solution2"
                break;
        }
        Object.assign(this, model);
    }
}