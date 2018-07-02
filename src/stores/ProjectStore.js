// import db from './db.js';
import { observable, action, when } from 'mobx';
import Project from './Project.js';
import socketStore from './SocketStore';
// import config from '../config.js';
import Model from './Model.js';

class ProjectStore {
    @observable userId;
    @observable project = null;
    @observable models = [];
    @observable isLoad = true;

    constructor() {
        this.initCallback();
        this.finish = {}
    }

    @action
    init(userId, projectId) {
        //同一project不用加载
        if (this.userId === userId && this.projectId === projectId) return;
        this.isLoad = true;
        this.userId = userId;
        this.projectId = projectId;

        when(
            () => socketStore.isready,
            () => {
                socketStore.send("queryProject", { userId: userId, projectId: projectId })
                socketStore.send("queryModels", { userId: userId, projectId: projectId })
            }
        )
    }

    recommendModel() {
        const {problemType} = this.project

        let model;
        for (let m of this.models) {
            if (!model) {
                model = m;
                continue;
            }
            if(problemType === "Classification"){
                if (model.score.auc < m.score.auc) {
                    model = m;
                }
            }else{
                if (1 - model.score.rmse + model.score.r2 < 1 - m.score.rmse + m.score.r2) {
                    model = m;
                }
            }
        }
        if (model) {
            model.recommend = true;
        }
    }

    loaded(type){
        this.finish[type] = true;
        if(this.finish.project && this.finish.model){
            this.isLoad = false;
            this.finish = {};
        }
    }

    @action
    modelimgError(command, result) {

    }

    initCallback() {
        const callback = {
            queryProject: action(data => {
                const project = data.list[0];
                this.project = new Project(this.userId, project.projectId, project.args)
                this.loaded("project")
            }),
            queryModels: action(data => {
                const result = data.data;
                const models = result.args;
                this.models = [];
                for (let key in models) {
                    let backend = key.split("-")[2]
                    this.models.push(new Model(this.userId, this.projectId, backend, models[key]))
                }
                this.recommendModel()
                this.loaded("model")
            }),
            onModelingResult: action(data => {
                console.log(data, "onModelingResult");
                const { userId, projectId, command, result, status } = data;
                if (status < 0) {
                    this.modelimgError(command, result)
                }
                let info = {
                    userId,
                    projectId,
                    args: {}
                }
                for (let row of result) {
                    info.args[`${command}-${row.backend}-result`] = row
                }
                const models = this.project.saveModel(info)
                for (let key in models) {
                    let backend = key.split("-")[2]
                    this.models.push(new Model(this.userId, this.projectId, backend, models[key]))
                }
                this.recommendModel()
                switch (command) {
                    case 'train2':
                        this.project.finishTrain2();
                        break;
                    default:
                        break;
                }
                // let models =  this.project.saveModel(info, time);
            })
        }

        socketStore.addMessageArr(callback);
    }
}

export default new ProjectStore();