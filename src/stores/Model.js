import { observable, action, computed } from 'mobx';
import socketStore from "./SocketStore";
import config from 'config'
import { debounce } from 'lodash'
import { formatNumber } from 'util'

export default class Model {
  @observable score;
  @observable backend;
  @observable featureImportance;
  @observable executeSpeed = 0;
  @observable name = "";
  @observable modelInsightsData = null;
  @observable fitIndex = 0;
  @observable chartData;
  @observable fitPlot;
  @observable residualPlot;
  @observable qcut;
  @observable confusionMatrix
  @observable problemType
  @observable fitIndexModified;
  @observable filtedModels;

  constructor(projectId, model, name) {
    this.projectId = projectId;
    this._id = name;
    Object.assign(this, model);

    this.updateModel = debounce(this.updateModel, 1000)
  }

  @computed
  get fitPlotPath() {
    return this.fitPlot ? this.urlPath(this.fitPlot) : ''
  }

  @computed
  get residualPlotPath() {
    return this.residualPlot ? this.urlPath(this.residualPlot) : ''
  }

  urlPath = path => {
    return `http://${config.host}:${config.port}/redirect/download/${path}?projectId=${this.projectId}`
  }

  @action
  setData(type, obj) {
    this[type] = Object.assign({}, { ...this[type] }, obj)
  }

  setProperty(data) {
    if (typeof data !== 'object') {
      return false;
    }
    if (Array.isArray(data)) {
      return false;
    }
    Reflect.deleteProperty(data, 'id')
    Reflect.deleteProperty(data, 'name')
    Reflect.deleteProperty(data, 'projectId')

    for (let key in data) {
      if (typeof data[key] === 'function') {
        delete data[key];
      }
    }
    Object.assign(this, data)
  }
  @action
  setFitIndex(index) {
    this.fitIndex = index;
    this.fitIndexModified = true;
    this.updateModel({
      fitIndex: index,
    })
  }

  @action
  resetFitIndex() {
    this.fitIndexModified = false;
    const { initialFitIndex: fitIndex } = this;
    this.fitIndex = fitIndex;
    this.updateModel({
      fitIndex,
    })
  }

  getBenefit = (ITP, IFN, IFP, ITN) => {
    const data = this.chartData || {}
    const roc = data.roc || {}
    const { TP, FN, FP, TN } = roc
    if (!ITP && !IFN && !IFP && !ITN) return {
      benefit: 0,
      index: this.initialFitIndex
    }
    if (!TP && !FN && !FP && !TN) return {
      benefit: 0,
      index: this.initialFitIndex,
      text: `${ITP} * ${0}(TP) - ${IFN} * ${0}(FN) - ${IFP} * ${0}(FP) + ${ITN} * ${0}(TN) = ${0}`
    }
    let maxIndex = this.fitIndex
    for (let i = 1; i < 100; i++) {
      const benefit = TP[i] * ITP - FN[i] * IFN - FP[i] * IFP + TN[i] * ITN
      const maxBenefit = TP[maxIndex] * ITP - FN[maxIndex] * IFN - FP[maxIndex] * IFP + TN[maxIndex] * ITN
      if (benefit > maxBenefit) maxIndex = i
    }
    const realBenefit = TP[maxIndex] * ITP - FN[maxIndex] * IFN - FP[maxIndex] * IFP + TN[maxIndex] * ITN
    // this.fitIndex = maxIndex
    return {
      benefit: realBenefit,
      index: maxIndex,
      text: `${ITP} * ${TP[maxIndex]}(TP) - ${IFN} * ${FN[maxIndex]}(FN) - ${IFP} * ${FP[maxIndex]}(FP) + ${ITN} * ${TN[maxIndex]}(TN) = ${realBenefit}`
    }
  }
  @computed
  get predicted() {
    const { chartData, confusionMatrix, fitIndex, problemType } = this
    if (problemType !== 'Classification') return [1, 1]
    if (chartData) {
      const { TP, FN, FP, TN } = chartData.roc
      return [TN[fitIndex] / (TN[fitIndex] + FP[fitIndex]), TP[fitIndex] / (TP[fitIndex] + FN[fitIndex])]
    }
    return [confusionMatrix[0][0] / ((confusionMatrix[0][0] + confusionMatrix[0][1]) || 1), confusionMatrix[1][1] / ((confusionMatrix[1][0] + confusionMatrix[1][1]) || 1)];
  }
  @computed
  get aucValidation() {
    return this.score.validateScore.auc
  }
  @computed
  get aucHoldout() {
    return this.score.holdoutScore.auc
  }
  @computed
  get accValidation() {
    const data = this.chartData || {}
    const roc = data.roc || {}
    const { TP, FN, FP, TN } = roc
    if (!TP || !FN || !FP || !TN) return this.score.validateScore.acc
    return (TP[this.fitIndex] + TN[this.fitIndex]) / (TP[this.fitIndex] + FN[this.fitIndex] + FP[this.fitIndex] + TN[this.fitIndex])
  }
  @computed
  get accHoldout() {
    const data = this.chartData || {}
    const roc = data.rocHoldout || {}
    const { TP, FN, FP, TN } = roc
    if (!TP || !FN || !FP || !TN) return this.score.holdoutScore.acc
    return (TP[this.fitIndex] + TN[this.fitIndex]) / (TP[this.fitIndex] + FN[this.fitIndex] + FP[this.fitIndex] + TN[this.fitIndex])
  }
  @computed
  get precisionValidation() {
    const data = this.chartData || {}
    const roc = data.roc || {}
    const { TP, FP } = roc
    if (!TP || !FP) return this.score.validateScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FP[this.fitIndex])
  }
  @computed
  get precisionHoldout() {
    const data = this.chartData || {}
    const roc = data.rocHoldout || {}
    const { TP, FP } = roc
    if (!TP || !FP) return this.score.holdoutScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FP[this.fitIndex])
  }
  @computed
  get recallValidation() {
    const data = this.chartData || {}
    const roc = data.roc || {}
    const { TP, FN } = roc
    if (!TP || !FN) return this.score.validateScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FN[this.fitIndex])
  }
  @computed
  get recallHoldout() {
    const data = this.chartData || {}
    const roc = data.rocHoldout || {}
    const { TP, FN } = roc
    if (!TP || !FN) return this.score.holdoutScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FN[this.fitIndex])
  }
  @computed
  get f1Validation() {
    const { precisionValidation, recallValidation } = this
    return 2 * precisionValidation * recallValidation / (precisionValidation + recallValidation)
  }
  @computed
  get f1Holdout() {
    const { precisionHoldout, recallHoldout } = this
    return 2 * precisionHoldout * recallHoldout / (precisionHoldout + recallHoldout)
  }
  modelProcessFlow(dataFlow) {
    const rawPara = dataFlow || this.dataFlow;
    const para = {};
    const preprocessor = rawPara['preprocessor:__choice__'];
    if (!preprocessor) return { flow: null, flowPara: null };

    let algorithm;
    // const classifier = rawPara['classifier:__choice__'];
    // this.paraProcessing(rawPara, result['Raw Data'], para, modelId);
    this.extractParameters(rawPara, para, 'one_hot_encoding', 'one hot encoding');
    this.extractParameters(rawPara, para, 'preprocessor:' + preprocessor, preprocessor);
    this.extractParameters(rawPara, para, 'balancing:', 'balancing');
    // this.extractParameters(rawPara, para, 'classifier:' + classifier, classifier + modelId);
    this.extractParameters(rawPara, para, 'rescaling:__choice__', 'rescaling');

    if (this.problemType === 'Classification') {
      algorithm = rawPara['classifier:__choice__'];
      this.extractParameters(rawPara, para, 'classifier:' + algorithm, algorithm);
    } else {
      algorithm = rawPara['regressor:__choice__'];
      this.extractParameters(rawPara, para, 'regressor:' + algorithm, algorithm);
    }
    const chain = {
      'Raw Data': ['Raw Data'],
      'Data Preprocessing': [
        'one hot encoding',
        'Imputation',
        rawPara['balancing:strategy'],
        rawPara['rescaling:__choice__'] ? 'rescaling' : 'none'
      ],
      'Feature Processing': [
        preprocessor
      ],
      'Model Training': [algorithm],
      Prediction: ['Prediction']
    };
    return { flow: chain, flowPara: para };
  }
  extractParameters(rawPara, para, str, choice) {
    const keys = Object.keys(rawPara);
    para[choice] = {};
    keys.forEach(key => {
      if (key.startsWith(str)) {
        const prop = key.substring(str.length + 1);
        if (isNaN(Number(rawPara[key]))) {
          para[choice][prop] = rawPara[key];
        } else {
          para[choice][prop] = formatNumber(rawPara[key], 2);
        }
      }
    });
  }
  updateModel(data) {
    socketStore.ready().then(api => api.updateModel({
      data,
      id: this.id,
      projectId: this.projectId,
    }));
    Object.assign(this, data);
  }
}
