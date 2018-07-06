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
    @observable charts = {}

    constructor() {
        this.initCallback();
        console.log(this)
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

    @action
    modelimgError(command, result) {
        console.log("error!!", command, result)
        switch (command) {
            case 'etl':
                break;
            case 'train2':
                this.project.modelingError()
                break;
            default:
                break;
        }
    }

    setCharts(type, result) {
        this.charts[type] = result
        // img : `/api/download?userId=${this.userId}&projectId=${this.projectId}&csvLocation=${imageSavePath}`
        // axios("/api/download",{
        //     params:{userId: this.userId, projectId: this.projectId, csvLocation: imageSavePath}
        // }, (res) => {
        //     console.log(res)
        // })
    }

    saveModel(data) {
        when(
            () => socketStore.isready,
            () => {
                socketStore.send("changeModel", data)
            }
        )
        return data.args;
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
                    if (!Object.keys(models[key]).find(k => k.includes("error"))) {
                        let [command] = key.split("-");
                        switch (command) {
                            case 'etl':
                                break;
                            case 'train2':
                                this.models.push(new Model(this.userId, this.projectId, models[key]))
                                break;
                            case 'correlationMatrix':
                                this.setCharts("correlationMatrix", models[key])
                                break;
                            case 'fitPlotAndResidualPlot':
                                this.setCharts("fitPlotAndResidualPlot", models[key])
                                break;
                            case 'pointToShow':
                                this.setCharts("pointToShow", models[key]);
                                break;
                            default:
                                break;
                        }
                    }
                }
                when(
                    () => !!this.project,
                    () => {
                        this.isLoad = false;
                        this.recommendModel();
                    }
                )
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
                        const models = this.saveModel(info)
                        for (let key in models) {
                            let index = this.models.findIndex(m => {
                                return models[key].name === m.name
                            })
                            if (index === -1) {
                                this.models.push(new Model(this.userId, this.projectId, models[key]))
                            } else {
                                this.models[index] = new Model(this.userId, this.projectId, models[key])
                            }
                        }
                        this.recommendModel()
                        if(status === 100){
                            this.project.finishTrain2();
                        }
                        break;
                    case 'correlationMatrix':
                        this.setCharts("correlationMatrix", result)
                        break;
                    case 'fitPlotAndResidualPlot':
                        this.setCharts("fitPlotAndResidualPlot", result)
                        break;
                    case 'pointToShow':
                        this.setCharts("pointToShow", result);
                        break;
                    default:
                        break;
                }
            }),
            changeModel: action((data) => {
                console.log(data)
            })
        }

        socketStore.addMessageArr(callback);
    }
}

export default new ProjectStore();