import { observable, action } from 'mobx';
import socketStore from "./SocketStore";

export default class Model {
  @observable score;
  @observable backend;
  @observable featureImportance;
  @observable executeSpeed = 0;
  @observable name = "";
  @observable predicted = [];
  @observable modelInsightsData = null;
  @observable fitIndex = 0;
  @observable chartData;
  @observable fitPlot;
  @observable residualPlot;
  @observable qcut;

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
  getBenifit(ITP, IFN, IFP, ITN) {
    const data = this.chartData || {}
    const roc = data.roc || {}
    const { TP, FN, FP, TN } = roc
    const ctp = ITP ? (TP || [])[ITP - 1] : 0
    const cfn = IFN ? (FN || [])[IFN - 1] : 0
    const cfp = IFP ? (FP || [])[IFP - 1] : 0
    const ctn = ITN ? (TN || [])[ITN - 1] : 0
    console.log(this.name, ctp, cfn, cfp, ctn, ctp - cfn - cfp + ctn)
    return ctp - cfn - cfp + ctn
  }
  updateModel(data) {
    socketStore.ready().then(api => api.updateModel({ data, id: this.id, projectId: this.projectId }))
    Object.assign(this, data);
  }
}