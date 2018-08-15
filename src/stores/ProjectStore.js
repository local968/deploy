import { observable, action, when, computed } from 'mobx';
import Project from './Project.js';
import socketStore from './SocketStore.js';
// import config from '../config.js';
import Model from './Model.js';

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    let max = arr.Youden[0];
    let maxIndex = 0;

    for (let i = 1; i < Object.keys(arr.Youden).length; i++) {
        if (arr.Youden[i] > max) {
        maxIndex = i;
        max = arr.Youden[i];
        }
    }

    return maxIndex;
}

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
    init(userId ,projectId) {
        //同一project不用加载
        if (this.userId === userId && this.projectId === projectId) return;
        this.isLoad = true;
        this.userId = userId
        this.projectId = projectId;
        this.project = null;
        this.models = [];
        this.charts = {}

        when(
            () => socketStore.isready,
            () => {
                socketStore.send("queryProject", { projectId: projectId })
                socketStore.send("queryModels", { projectId: projectId })
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
        // message.error(`${command} error!`)
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
        const data = this.charts[type] || [];
        this.charts[type] = [...(data.filter(i => i.name !== result.name)), result];
        // img : `/api/download?userId=${this.userId}&projectId=${this.projectId}&csvLocation=${imageSavePath}`
        // axios("/api/download",{
        //     params:{userId: this.userId, projectId: this.projectId, csvLocation: imageSavePath}
        // }, (res) => {
        //     console.log(res)
        // })
    }

    next() {
        const {curStep, subStepActive, no_compute} = this.project;
        if(curStep === 2 && subStepActive < 3){
            if(no_compute && subStepActive !== 1) {
                this.project.nextMainStep(3)
                return;
            }
            const nextStep = subStepActive + 1;
            this.project.nextSubStep(nextStep, curStep)
        }else{
            return false
        }
    }

    createOrUpdateModel(data, name) {
        const m = this.models.find(m => m.id === name);
        if (m) {
            m.updateModel(data);
        } else {
            this.models.push(new Model(this.userId, this.projectId, data, name));
        }
    }

    initCallback() {
        const callback = {
            queryProject: action(data => {
                const project = data.list[0];
                this.project = new Project(this.userId, project.projectId, project.args)
            }),
            queryModels: action(data => {
                const result = data.data || {};
                const models = result.args;
                this.models = [];
                for (let key in models) {
                    if (!Object.keys(models[key]).find(k => k.includes("error"))) {
                        let [command] = key.split("-");
                        switch (command) {
                            case 'etl':
                                delete models[key].name
                                when(
                                    () => this.project,
                                    () => this.project.setProperty(models[key])
                                )
                                break;
                            case 'chartData':
                                const chartResult = models[key];
                                const { fitIndex, chart } = this.parseChartData(chartResult.data)
                                this.createOrUpdateModel({chartData: chart, fitIndex}, chartResult.name.replace('-chartData', ''));
                                break;
                            case 'train2':
                                const trainResult = models[key];
                                this.createOrUpdateModel(trainResult, trainResult.backend);
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
                let { command, result, status, userId, projectId } = data;
                if(this.userId !== userId || this.projectId !== projectId) {
                    return false;
                }
                if (status < 0) {
                    this.modelimgError(command, result)
                    return;
                }
                switch (command) {
                    case 'etl':
                        delete result.name;
                        result.dataViews = null;
                        result.firstEtl = false;
                        // this.project.setProperty(result)
                        this.project.updateProject(result)
                        when(
                            () => !!this.project.uploadData.length,
                            () => this.next()
                        )
                        break;
                    case 'train2':
                        if(Array.isArray(result)){
                            [result] = result
                        }
                        // for (let row of result) {
                        if(result&&result.name){
                            let index = this.models.findIndex(m => {
                                return result.name === m.name
                            })
                            if (index === -1) {
                                this.models.push(new Model(this.userId, this.projectId, result))
                            } else {
                                this.models[index] = new Model(this.userId, this.projectId, result)
                            }
                            this.recommendModel()
                        }
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
                    case 'preTrainImportance':
                        break;
                    case 'univariatePlot':
                        this.setCharts("univariatePlot", result);
                        break;
                    case 'histgramPlot':
                        this.setCharts("histgramPlot", result);
                        break;
                    case 'modelInsights':
                        this.setCharts("modelInsights", result);
                        break;
                    case 'dataView':
                        this.project.updateProject({
                            dataViews: result.data
                        })
                        break;
                    default:
                        break;
                }
            }),
            changeModel: action((data) => {
                console.log(data)
            }),
            changeProblemType: action(() => {
                this.models = [];
                this.charts = [];
                this.project.backToProblemStep();
            }),
            train: action(() => {
                this.models = [];
            })
        }

        socketStore.addMessageArr(callback);
    }
    parseChartData(result) {
        if (!result) return { chart: null, fitIndex: null };
        let fitIndex;
        const charts = ['density', 'lift', 'roc'];
        charts.map(chart => result[chart] = this.parseJson(result[chart]));
        if (result.roc) {
            fitIndex = indexOfMax(result.roc);
            this.roundN(result.roc);
          }
        return { chart: result, fitIndex };
    }

    roundN(data, n = 2) {
        if (!data) return;
        const pow = Math.pow(10, n);
        if (typeof data === 'number') {
          return Math.floor(data * pow) / pow;
        }
        Object.keys(data).forEach(key => {
          const num = data[key];
          if (typeof num === 'number') {
            data[key] = Math.floor(num * pow) / pow;
          } else if (typeof num === 'object') {
            return this.roundN(num, n);
          } else {
            data[key] = num;
          }
        });
      }

    parseJson(json_string) {
        if (!json_string) return null;
        return JSON.parse(json_string);
      }
}

export default new ProjectStore();