import { observable, action, computed } from 'mobx';
import socketStore from "./SocketStore";
import config from 'config'
import { debounce } from 'lodash'
import { formatNumber } from '../../src/util'
import EN from '../../src/constant/en'

export interface graphicListItem {
  name: string,
  data: {
    fields: string[],
    id: string,
  }
}

export interface ChartDataRoc {
  AUCPR: number[],
  AUCROC: number[],
  F1: number[],
  FN: number[],
  FP: number[],
  FPR: number[],
  F_BETA: number[],
  KS: number[],
  LOGLOSS: number[],
  Precision: number[],
  Recall: number[],
  TN: number[],
  TP: number[],
  TPR: number[],
  Threshold: number[],
  Youden: number[],
}

export interface ChartData {
  roc: ChartDataRoc,
  lift: unknown,
  density: unknown
}

export interface ClaregScore {
  acc?: number
  auc?: number
  f1?: number
  logLoss?: number
  precision?: number
  recall?: number
  adjustR2?: number
  mae?: number
  mse?: number
  msle?: number
  nmse?: number
  nrmse?: number
  r2?: number
  rmse?: number
  rmsle?: number
}

export interface Score {
  score?: number,
  auc?: number,
  validateScore?: ClaregScore,
  holdoutScore?: ClaregScore,
  trainScore?: ClaregScore,
  CVNN?: number | 'null' | 'inf',
  RSquared?: number | 'null' | 'inf',
  RMSSTD?: number | 'null' | 'inf',
  CH?: number | 'null' | 'inf',
  silhouette_cosine?: number | 'null' | 'inf',
  silhouette_euclidean?: number | 'null' | 'inf',
}

export interface LabelWithImportance {
  [key: string]: {
    indexes?: string[];
    values?: number[];
  };
};

class Model {
  projectId: string
  _id: string
  id: string
  initialFitIndex: number
  dataFlow: StringObject
  graphicList: graphicListItem[]
  createTime: number;
  validatePlotData: string
  holdoutPlotData: string;
  residualPlotPath: string
  @observable score: Score;
  @observable backend: string;
  @observable featureImportance: NumberObject;
  @observable executeSpeed: number = 0;
  @observable modelName: string = "";
  // @observable modelInsightsData = null;
  @observable fitIndex: number = 0;
  @observable chartData: ChartData;
  @observable problemType: string
  @observable importanceLoading: boolean = false
  @observable labelWithImportance: LabelWithImportance = {}
  @observable multiVarPlotData: string = ''
  @observable parallelPlotData: string = ''
  @observable outlierPlotData: string = '';
  @observable pointToShowData: string = '';
  @observable predictData: string = '';
  @observable fitAndResidualPlotData: string = ''
  @observable outlierPlotLoading: boolean = false
  @observable featureList: string[] = []
  @observable rate: number = 0
  @observable pcaPlotData: string = ''
  @observable featureLabel: string[] = []
  @observable holdoutChartData: ChartData;
  @observable target: string[] = [];
  @observable esIndex: string = '';
  @observable accuracyData: NumberObject = {}
  // @observable featureImportanceDetail = {}

  constructor(projectId: string, model: unknown, modelName?: string) {
    this.projectId = projectId;
    this._id = modelName;
    Object.assign(this, model);

    this.updateModel = debounce(this.updateModel, 1000)
  }

  @action
  setProperty(data: Partial<Model>) {
    if (typeof data !== 'object') {
      return false;
    }
    if (Array.isArray(data)) {
      return false;
    }
    Reflect.deleteProperty(data, 'id')
    Reflect.deleteProperty(data, 'modelName')
    Reflect.deleteProperty(data, 'projectId')

    for (let key in data) {
      // const value = data[key]
      const value = Reflect.get(data, key)
      // (data as Model)[(key as keyof Model)]
      if (typeof value === 'function') {
        Reflect.deleteProperty(data, key)
      }
    }
    Object.assign(this, data)
  }
  @action
  setFitIndex(index: number) {
    this.fitIndex = index;
    this.updateModel({
      fitIndex: index,
    })
  }

  @action
  resetFitIndex() {
    const { initialFitIndex: fitIndex } = this;
    this.fitIndex = fitIndex;
    this.updateModel({
      fitIndex,
    })
  }

  getBenefit = (ITP: number, IFN: number, IFP: number, ITN: number, IPN: number, IPO: number) => {
    const data = this.chartData
    const roc = data.roc
    const { TP, FN, FP, TN } = roc;
    if (!ITP && !IFN && !IFP && !ITN) return {
      benefit: 0,
      index: this.initialFitIndex
    }
    if (!TP && !FN && !FP && !TN) return {
      benefit: 0,
      index: this.initialFitIndex,
      text: `(${IPN}/${IPO})*(${ITP}*${0}(TP)-${IFN}*${0}(FN))+(${1 - IPN}/${1 - IPO})*(${ITN}*${0}(TN)-${IFP}*${0}(FP)) = ${0}`
    };
    let maxIndex = this.fitIndex;
    for (let i = 1; i < 100; i++) {
      const benefit = TP[i] * ITP - FN[i] * IFN - FP[i] * IFP + TN[i] * ITN
      const maxBenefit = TP[maxIndex] * ITP - FN[maxIndex] * IFN - FP[maxIndex] * IFP + TN[maxIndex] * ITN
      if (benefit > maxBenefit) maxIndex = i
    }
    const realBenefit = (IPN / IPO) * (TP[maxIndex] * ITP - FN[maxIndex] * IFN) + ((1 - IPN) / (1 - IPO)) * (TN[maxIndex] * ITN - FP[maxIndex] * IFP)
    // this.fitIndex = maxIndex
    return {
      benefit: realBenefit,
      index: maxIndex,
      text: `(${IPN}/${IPO})*(${ITP}*${TP[maxIndex]}(TP)-${IFN}*${FN[maxIndex]}(FN))+(${1 - IPN}/${1 - IPO})*(${ITN}*${TN[maxIndex]}(TN)-${IFP}*${FP[maxIndex]}(FP)) = ${realBenefit}`
      //`${ITP} * ${TP[maxIndex]}(TP) - ${IFN} * ${FN[maxIndex]}(FN) - ${IFP} * ${FP[maxIndex]}(FP) + ${ITN} * ${TN[maxIndex]}(TN) = ${realBenefit}`
    }
  }
  @computed
  get predicted() {
    const { chartData, fitIndex, problemType } = this
    if (problemType !== 'Classification') return [1, 1]
    if (chartData) {
      const { TP, FN, FP, TN } = chartData.roc
      return [TN[fitIndex] / (TN[fitIndex] + FP[fitIndex]), TP[fitIndex] / (TP[fitIndex] + FN[fitIndex])]
    }
  }
  @computed
  get accValidation() {
    const data = this.chartData
    const roc = data.roc
    const { TP, FN, FP, TN } = roc
    if (!TP || !FN || !FP || !TN) return this.score.validateScore.acc
    return (TP[this.fitIndex] + TN[this.fitIndex]) / (TP[this.fitIndex] + FN[this.fitIndex] + FP[this.fitIndex] + TN[this.fitIndex])
  }
  @computed
  get accHoldout() {
    const data = this.holdoutChartData
    const roc = data.roc
    const { TP, FN, FP, TN } = roc
    if (!TP || !FN || !FP || !TN) return this.score.holdoutScore.acc
    return (TP[this.fitIndex] + TN[this.fitIndex]) / (TP[this.fitIndex] + FN[this.fitIndex] + FP[this.fitIndex] + TN[this.fitIndex])
  }
  @computed
  get precisionValidation() {
    const data = this.chartData
    const roc = data.roc
    const { TP, FP } = roc
    if (!TP || !FP) return this.score.validateScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FP[this.fitIndex])
  }
  @computed
  get precisionHoldout() {
    const data = this.holdoutChartData
    const roc = data.roc
    const { TP, FP } = roc
    if (!TP || !FP) return this.score.holdoutScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FP[this.fitIndex])
  }
  @computed
  get recallValidation() {
    const data = this.chartData
    const roc = data.roc
    const { TP, FN } = roc
    if (!TP || !FN) return this.score.validateScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FN[this.fitIndex])
  }
  @computed
  get recallHoldout() {
    const data = this.holdoutChartData
    const roc = data.roc
    const { TP, FN } = roc
    if (!TP || !FN) return this.score.holdoutScore.precision
    return TP[this.fitIndex] / (TP[this.fitIndex] + FN[this.fitIndex])
  }
  @computed
  get fprValidation() {
    const data = this.chartData
    const roc = data.roc
    const { FP, TN } = roc
    if (!FP || !TN) return this.score.validateScore.precision
    return FP[this.fitIndex] / (FP[this.fitIndex] + TN[this.fitIndex])
  }
  @computed
  get fprHoldout() {
    const data = this.holdoutChartData
    const roc = data.roc
    const { FP, TN } = roc
    if (!FP || !TN) return this.score.holdoutScore.precision
    return FP[this.fitIndex] / (FP[this.fitIndex] + TN[this.fitIndex])
  }
  @computed
  get ksValidation() {
    return this.recallValidation - this.fprValidation
  }
  @computed
  get ksHoldout() {
    return this.recallHoldout - this.fprHoldout
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
  fbeta = (beta = 1, type = 'Validation') => {
    beta = +beta
    if (type !== 'Validation' && type !== 'Holdout') type = 'Validation'
    if (isNaN(beta) || beta < 0.1 || beta > 10) beta = 1
    return (1 + beta * beta) * this[`precision${type}`] * this[`recall${type}`] / ((beta * beta * this[`precision${type}`]) + this[`recall${type}`])
  }
  @computed
  get cutoff() {
    const { chartData: { roc: { Threshold } }, fitIndex } = this
    return Threshold[fitIndex]
  }
  @computed
  get loglossValidation() {
    const { chartData: { roc: { LOGLOSS } }, fitIndex } = this
    return LOGLOSS[fitIndex]
  }
  @computed
  get loglossHoldout() {
    const { holdoutChartData: { roc: { LOGLOSS } }, fitIndex } = this
    return LOGLOSS[fitIndex]
  }
  @computed
  get aucValidation() {
    const { score: { validateScore: { auc } } } = this
    return auc
  }
  @computed
  get aucHoldout() {
    const { score: { holdoutScore: { auc } } } = this
    return auc
  }
  modelProcessFlow(dataFlow: StringObject) {
    const rawPara = dataFlow || this.dataFlow;
    const para: { [key: string]: StringObject } = {};
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
      'Raw Data': [EN.RawData],
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
      Prediction: [EN.Prediction]
    };
    return { flow: chain, flowPara: para };
  }
  extractParameters(rawPara: StringObject, para: { [key: string]: StringObject }, str: string, choice: string) {
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
  permutationImportance = () => {
    const arr = Object.keys(this.featureImportance || {})
    if (!!arr.length) return
    this.importanceLoading = true
    socketStore.ready().then(api => {
      let cmd = 'clfreg.permutationImportance'
      // switch (this.problemType) {
      //   case 'clfreg.Clustering':
      //     cmd = 'clustering.train';
      //     break;
      //   case 'Outlier':
      //     cmd = 'outlier.train';
      //     break;
      //   default:
      //     cmd = 'clfreg.train';
      // }
      const command = {
        command: cmd,
        projectId: this.projectId,
        id: this.id
      }
      api.permutationImportance(command)
    })
  }
  saveFeatureList = async (featureList: [string, string]) => {
    // if (this.outlierPlotLoading) return
    if (!Array.isArray(featureList) || featureList.length !== 2) return console.log('error featureList')
    if (featureList[0] === this.featureList[0] && featureList[1] === this.featureList[1]) return console.log("same")
    // await this.updateModel({ featureList, outlierPlotData: '' })
    this.outlierPlotLoading = true
    return socketStore.ready().then(api => {
      let cmd = 'outlier.outlierPlot';
      const command = {
        command: cmd,
        projectId: this.projectId,
        id: this.id,
        featureList: [featureList],
        randomSeed: 0
      }
      return api.outlierPlot(command)
    })
  }
  getOutlierData = () => {
    return socketStore.ready().then(api => {
      return api.getOutlierData({ id: this.id, projectId: this.projectId, rate: this.rate, esIndex: this.esIndex })
    })
  }
  // outlierPlot = (featureList) => {
  //   this.outlierPlotLoading = true
  //   return socketStore.ready().then(api => {
  //     let cmd = 'outlier.outlierPlot';
  //     const command = {
  //       command: cmd,
  //       projectId: this.projectId,
  //       id: this.id,
  //       featureList: [this.featureList],
  //       randomSeed: 0
  //     }
  //     return api.outlierPlot(command)
  //   })
  // }
  updateModel(data: Object) {
    this.setProperty(data)
    return socketStore.ready().then(api => api.updateModel({
      data,
      id: this.id,
      projectId: this.projectId,
    }));
  }
}

export default Model
