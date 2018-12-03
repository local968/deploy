import { observable, action, computed } from 'mobx';
import socketStore from "./SocketStore";

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

  constructor(projectId, model, name) {
    this.projectId = projectId;
    this._id = name;
    Object.assign(this, model);
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
    delete data.id;
    delete data.name;
    delete data.projectId;
    for (let key in data) {
      if (typeof data[key] === 'function') {
        delete data[key];
        continue;
      }
    }
    Object.assign(this, data)
  }
  @action
  setFitIndex(index) {
    this.fitIndex = index;
  }
  @action
  resetFitIndex() {
    this.fitIndex = this.initialFitIndex;
  }
  getScore(ITP, IFN, IFP, ITN) {
    const { problemType, score: { validateScore } } = this
    if (problemType === 'Classification') {
      if (!ITP || !IFN || !IFP || !ITN) return validateScore.auc + validateScore.acc
      return this.getBenefit(ITP, IFN, IFP, ITN).benefit
    }
    return 1 - validateScore.rmse + validateScore.r2
  }
  getBenefit(ITP, IFN, IFP, ITN) {
    const data = this.chartData || {}
    const roc = data.roc || {}
    const { TP, FN, FP, TN } = roc
    if (!TP || !FN || !FP || !TN) return {
      benefit: 0,
      index: this.fitIndex,
      text: `${ITP} * ${0}(TP) - ${IFN} * ${0}(FN) - ${IFP} * ${0}(FP) + ${ITN} * ${0}(TN) = ${0}`
    }
    let maxIndex = 0
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
      return [TP[fitIndex] / (TP[fitIndex] + FN[fitIndex]), TN[fitIndex] / (TN[fitIndex] + FP[fitIndex])]
    }
    return [confusionMatrix[0][0] / ((confusionMatrix[0][0] + confusionMatrix[0][1]) || 1), confusionMatrix[1][1] / ((confusionMatrix[1][0] + confusionMatrix[1][1]) || 1)];
  }
  updateModel(data) {
    socketStore.ready().then(api => api.updateModel({ data, id: this.id, projectId: this.projectId }))
    Object.assign(this, data);
  }
}
