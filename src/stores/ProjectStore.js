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
    @observable isFirst = true;

    constructor() {
        this.initCallback();
    }

    @action
    init(userId, projectId) {
        //同一project不用加载
        if (this.userId === userId && this.projectId === projectId) return;
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
        let model;
        for (let m of this.models) {
            if (!model) {
                model = m;
                continue;
            }
            if (model.score.auc < m.score.auc) {
                model = m;
            }
        }
        if (model) {
            model.recommend = true;
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
            }),
            onModelingResult: action(data => {
                console.log(data, "onModelingResult");
                const { userId, projectId, command, result, status, time } = data;
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
                    this.models = result.map(row => new Model(userId, projectId, row.backend, row));
                }
                this.recommendModel()
                switch (command) {
                    case 'train2':
                        this.project.finishTrain2();
                        break;
                    default:
                        break;
                }
                this.project.saveModel(info, time);
            })
        }

        socketStore.addMessageArr(callback);
    }
}

export default new ProjectStore();