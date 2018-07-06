// import db from './db.js';
import { observable, action, when, computed } from 'mobx';
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
        const { problemType } = this.project

        let model;
        for (let m of this.models) {
            if (!model) {
                model = m;
                continue;
            }
            if (problemType === "Classification") {
                if (model.score.holdoutScore.auc < m.score.holdoutScore.auc) {
                    model = m;
                }
            } else {
                if (1 - model.score.holdoutScore.rmse + model.score.holdoutScore.r2 < 1 - m.score.holdoutScore.rmse + m.score.holdoutScore.r2) {
                    model = m;
                }
            }
        }
        if (model) {
            model.recommend = true;
        }
    }

    @computed
    get sortModels() {
        const { problemType } = this.project

        let models = [...this.models]
        for (let m of models) {
            if (problemType === "Classification") {
                let actual0 = [0, 0], actual1 = [0, 0];
                // if(criteria==="defualt"){
                actual0 = m.confusionMatrix[0]
                actual1 = m.confusionMatrix[1]
                // }else{
                //     for(let row of m.confusionMatrixDataDetail[0]){

                //     }
                //     for(let row of m.confusionMatrixDataDetail[1]){

                //     }
                //     actual0 = [1, 1];
                //     actual1 = [1, 1];
                // }
                m.predicted = [actual0[0] / (actual0[0] + actual0[1]), actual1[1] / (actual1[0] + actual1[1])];
            }
        }

        return models;
    }

    loaded(type) {
        this.finish[type] = true;
        if (this.finish.project && this.finish.model) {
            this.isLoad = false;
            this.finish = {};
        }
    }

    @action
    modelimgError(command, result) {
        console.log("error!!", command, result)
        switch (command) {
            case 'etl':
                break;
            case 'train2':
                this.project.modelingError()
                break;
        }
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
                    if (key.includes("train")){
                        if(!Object.keys(models[key]).find(k => k.includes("error"))){
                            this.models.push(new Model(this.userId, this.projectId, models[key]))
                        }
                    }
                }
                this.recommendModel()
                this.loaded("model")
            }),
            onModelingResult: action(data => {
                console.log(data, "onModelingResult");
                const { userId, projectId, command, result, status } = data;
                if (status < 0) {
                    this.modelimgError(command, result)
                    return;
                }
                switch (command) {
                    case 'etl':
                        this.project.updateProject(result)
                        this.project.nextMainStep(3);
                        break;
                    case 'train2':
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
                            let index = this.models.findIndex(m => {
                                return models[key].userId === m.userId && models[key].projectId === m.projectId && models[key].name === m.name
                            })
                            if (index === -1) {
                                this.models.push(new Model(this.userId, this.projectId, models[key]))
                            }else{
                                this.models[index] = new Model(this.userId, this.projectId, models[key])
                            }
                        }
                        // if(status === 1){
                            this.recommendModel()
                            this.project.finishTrain2();
                        // }
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