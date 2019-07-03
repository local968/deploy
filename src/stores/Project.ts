import { observable, action, computed, toJS, autorun, IReactionDisposer } from "mobx";
import socketStore from "./SocketStore";
import Model from "./Model";
import moment from 'moment';
import config from 'config';
import uuid from 'uuid';
import Papa from 'papaparse';
import { message as antdMessage, Modal } from 'antd';
import axios from 'axios'
import { formatNumber } from '../../src/util'
import request from "../components/Request";
import EN from '../../src/constant/en'
import { Coordinate } from "components/CreateNewVariable/model/Coordinate";

export interface Numerical {
  missingValue?: number;
  mismatch?: number;
  outlierCount?: number;
}

export interface Metric {
  name: string,
  type: 'Categorical' | 'Numerical' | 'Raw',
  isTarget?: boolean,
  originalStats: Stats,
  etlStats?: Stats,
  mismatchFillMethod?: FillMethod,
  missingValueFillMethod?: FillMethod,
  outlierFillMethod?: FillMethod,
  mapFillMethod?: { [value: string]: FillMethod },
  categoricalMap?: { key: string, doc_count: number }[]
  originalCategoricalMap?: { key: string, doc_count: number }[]
}

export interface FillMethod {
  type: 'delete' | 'replace',
  value?: string
}

export interface Stats {
  took: number,
  count?: number;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  sum_of_squares?: number;
  variance?: number;
  std_deviation?: number;
  std_deviation_bounds?: StdDeviationBounds;
  median?: number;
  uniqueValues: number;
  doubleUniqueValue?: number;
  doubleCount?: number;
  keywordCount?: number;
  mode: string;
  modeCount: number;
  mean?: number;
  kurtosis?: number;
  skewness?: number;
  high?: number;
  low?: number;
  numerical?: Numerical;
  categorical?: Categorical;
}

export interface Categorical {
  missingValue?: number;
}

export interface Numerical {
  mismatch?: number;
  missingValue?: number;
  outlierCount?: number;
}

export interface StdDeviationBounds {
  upper: number;
  lower: number;
}

export interface BaseResponse {
  message: string;
  status: number;
  result?: any;
  id?: string
  model?: Model
  command?: string
}

export interface CostOption {
  TP: number;
  FP: number;
  FN: number;
  TN: number;
}

export interface Settings {
  id: string,
  name: string,
  setting: unknown,
  models: string[]
}

export interface SsPlot {
  x: number[],
  y: number[]
}

export interface TrainCommand {
  kType?: string,
  kValue?: number,
  algorithms?: string[],
  standardType?: string,
  searchTime?: number,
  metricsMethod?: string,
  featureLabel?: string[],
  randomSeed?: number,
  projectId?: string,
  command?: string,
  settingName?: string,
  applyWeights?: NumberObject,
  problemType?: string,
  targetLabel?: string[],
  version?: string,
  sampling?: string,
  speedVSaccuracy?: number,
  ensembleSize?: number,
  randSeed?: number,
  measurement?: string,
  holdoutRate?: number,
  featuresPreprocessor?: string[],
  validationRate?: number,
  nfold?: number,
  showSsPlot?: boolean
}

export interface DataView {
  [key: string]: Stats
}

export interface UploadProps {
  totalRawLines: number;
  fileName: string;
  originalIndex: string;
  rawHeader: string[];
};

export interface NewVariable {
  name: string,
  nameArray: string[],
  exps: Coordinate[]
}

class Project {
  visiable: boolean
  @observable init: boolean = false
  univariatePlotsBase64: StringObject
  histgramPlotsBase64: StringObject
  rawHistgramPlotsBase64: StringObject

  @observable colMap: StringObject = {};
  // @observable stats: Stats;
  @observable userId: string = '';
  @observable models: Model[] = [];
  @observable trainModel: unknown = {};
  @observable autorun: IReactionDisposer[] = [];

  @observable id: string = '';
  @observable exist: boolean = true;
  @observable loading: boolean = false;
  @observable host: string = '';
  @observable loadModel: boolean = false;

  //step
  @observable mainStep: number = 0;
  @observable curStep: number = 0;
  @observable lastSubStep: number = 1;
  @observable subStepActive: number = 1;

  //project
  @observable name: string = '';
  @observable createTime: number = 0;
  @observable updateTime: number = 0;
  @observable charset: string = 'utf-8';
  // description;

  //problem
  @observable problemType: string = '';
  @observable statement: string = '';
  @observable business: string = '';
  @observable changeProjectType: string = '';

  //etl
  @observable etling: boolean = false;
  @observable etlProgress: number = 0;

  // upload data
  @observable dataHeader: string[] = [];
  @observable uploadData: string[][] = [];
  @observable rawHeader: string[] = [];
  // add header map
  @observable mapHeader: string[] = [];
  @observable colType: StringObject = {};
  // totalLines: unknown =  0;
  @observable totalRawLines: number = 0;
  @observable firstEtl: boolean = true;
  @observable target: string = '';
  @observable noCompute: boolean = false;
  @observable validationRate: number = 20;
  @observable holdoutRate: number = 20;
  @observable fileName: string = '';
  // cleanData: unknown =  []
  // @observable originPath: string = '';

  etlCleanDataLoading: boolean = false;
  @observable cleanPath: string = '';

  @observable noComputeTemp: boolean = false;
  @observable originalIndex: string = '';
  @observable etlIndex: string = '';

  //data quality
  @observable mismatchFillMethod: StringObject = {};
  @observable nullFillMethod: StringObject = {};
  @observable outlierFillMethod: StringObject = {};
  @observable outlierDict: unknown = {};
  @observable targetMap: NumberObject = {};
  @observable targetArray: string[] = [];
  @observable rawDataView: DataView | null = null;
  @observable preImportance: NumberObject | null = null;
  @observable preImportanceLoading: boolean = false;
  @observable importanceProgress: number = 0;
  @observable histgramPlots: StringObject = {};
  @observable univariatePlots: StringObject = {};
  @observable newVariable: string[] = [];
  @observable expression: { [key: string]: NewVariable } = {};
  @observable newType: StringObject = {};
  @observable informativesLabel: string[] = [];
  @observable colValueCounts: { [key: string]: NumberObject } = {};
  @observable totalFixedLines: number = 0;
  @observable nullLineCounts: NumberObject = {};
  @observable mismatchLineCounts: NumberObject = {};
  @observable outlierLineCounts: NumberObject = {};
  @observable renameVariable: StringObject = {};
  @observable missingReason: StringObject = {};
  @observable newVariablePath: string = '';
  @observable newVariableViews: unknown = {};
  @observable otherMap: StringObject = {};
  // totalFixedCount: unknown =  0
  @observable deletedCount: number = 0;
  @observable targetMapTemp: NumberObject = {};
  @observable targetArrayTemp: string[] = [];
  @observable missingReasonTemp: StringObject = {};
  @observable mismatchFillMethodTemp: StringObject = {};
  @observable nullFillMethodTemp: StringObject = {};
  @observable outlierFillMethodTemp: StringObject = {};
  @observable outlierDictTemp: unknown = {};

  // train
  // 训练状态
  @observable train2Finished: boolean = false;
  @observable train2ing: boolean = false;
  @observable train2Error: boolean = false;

  @observable trainingId: string = '';
  // 不需要参加训练的label
  @observable trainHeader: string[] = [];
  @observable customHeader: string[] = [];
  @observable criteria: string = 'defualt';
  @observable costOption: CostOption = {
    TP: 0,
    FP: 0,
    FN: 0,
    TN: 0,
  };
  @observable mappingKey: string = '';
  @observable distribution: number = 0;
  @observable ssPlot: SsPlot | null = null;

  // Advanced Modeling Setting
  @observable settingId: string = '';
  @observable settings: Settings[] = [];

  // correlation
  @observable correlationMatrixHeader: unknown;
  @observable correlationMatrixData: unknown;
  @observable correlationMatrixLoading: boolean = false;

  // 训练速度和过拟合
  @observable speedVSaccuracy: number = 5;

  @observable ensembleSize: number = 20;
  @observable randSeed: number = 0;
  @observable measurement: string = 'CVNN';
  @observable resampling: string = 'no';
  @observable runWith: string = 'holdout';
  @observable crossCount: number = 5;
  @observable dataRange: string = 'all';
  @observable customField: string = '';
  @observable customRange: unknown[] = [];
  @observable algorithms: string[] = [];
  @observable selectId: string = '';
  @observable version: number[] = [1, 2, 4];
  @observable features: string[] = [
    'Extra Trees',
    'Random Trees',
    'Fast ICA',
    'Kernel PCA',
    'PCA',
    'Polynomial',
    'Feature Agglomeration',
    'Kitchen Sinks',
    'Linear SVM',
    'Nystroem Sampler',
    'Select Percentile',
    'Select Rates',
  ];
  @observable dataViews: DataView | null = null;
  @observable dataViewsLoading: boolean = false;
  @observable dataViewProgress: number = 0;

  //un
  @observable weights: NumberObject = {};
  @observable standardType: string = 'standard';
  @observable searchTime: number = 5;
  @observable kValue: number = 5;
  @observable kType: string = 'auto';

  //un temp
  @observable weightsTemp: NumberObject = {};
  @observable standardTypeTemp: string = 'standard';

  @observable stopModel: boolean = false;
  @observable stopEtl: boolean = false;
  @observable isAbort: boolean = false;
  @observable stopIds: string[] = [];

  @observable reportProgress: number = 0;
  @observable reportProgressText: string = 'init';
  @observable reportCancel: boolean = false;
  @observable isHoldout: boolean = false;
  @observable showSsPlot: boolean = false;

  constructor(id: string, args: Object) {
    this.id = id;
    this.visiable = true;
    this.setProperty(args)
    // autorun(() => {
    //   if (!this.cleanPath) return this.cleanData = []
    //   this.readData(this.cleanPath).then(data => {
    //     this.cleanData = data
    //   })
    // })
  }

  readData = (path: string) => {
    const url = `http://${config.host}:${config.port}/redirect/download/${path}?projectId=${this.id}`;
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        delimiter: ',',
        complete: result => {
          if (result.errors.length !== 0) {
            console.error('parse error: ', result.errors[0].message);
            return;
          }
          return resolve(result.data)
          // this.newFileInit(result.data);
        }
      });
      return
    })
  }

  readIndex = async (index: string) => {
    const maxCell = 400000
    const max = Math.min(parseInt((maxCell / (this.rawHeader.length || 1)).toString(), 10), 500)
    const url = `/etls/${index}/preview?end=${max - 1}`
    const { data } = await axios.get(url)
    const result = data.result.map((row: StringObject) => this.rawHeader.map(h => row[h]))
    return result
  }

  @computed
  get totalLines() {
    return this.totalRawLines - this.deletedCount
  }

  fetchData = async (path: string) => {
    const api = await socketStore.ready()
    const result = await api.fetchData({ path })
    return result.data
  }

  @computed
  get defaultUploadFile() {
    // this.noComputeTemp = false

    return {
      dataHeader: [],
      rawHeader: [],
      colType: {},
      totalLines: 0,
      totalRawLines: 0,
      firstEtl: true,
      target: '',
      noCompute: false,
      rawDataView: null,
      originalIndex: ''
    } as {
      dataHeader: string[],
      rawHeader: string[],
      colType: StringObject,
      totalLines: number,
      totalRawLines: number,
      firstEtl: boolean,
      target: string,
      noCompute: boolean,
      rawDataView: null,
      originalIndex: string
    }
  }

  @computed
  get defaultDataQuality() {
    return {
      targetMap: {},
      targetArray: [],
      totalFixedLines: 0,
      renameVariable: {},
      missingReason: {},
      targetMapTemp: {},
      targetArrayTemp: [],
      outlierDictTemp: {},
      otherMap: {},
      cleanPath: ''
    } as {
      targetMap: NumberObject,
      targetArray: string[],
      totalFixedLines: number,
      renameVariable: StringObject,
      missingReason: StringObject,
      targetMapTemp: NumberObject,
      targetArrayTemp: string[],
      outlierDictTemp: unknown,
      otherMap: StringObject,
      cleanPath: string
    }
  }

  @computed
  get defaultAlgorithms() {
    let algorithms: string[] = []
    let disableList: string[] = []
    if (this.problemType === "Clustering") {
      algorithms = [
        'KMeans',
        'GMM',
        'Birch',
        'Agg',
        'SpectralClustering',
        'DBSCAN',
        'MeanShift',
      ]
      disableList = (this.totalLines > 100000 && ['Birch', 'MeanShift']) || (this.totalLines > 50000 && ['MeanShift']) || (this.totalLines > 20000 && ['DBSCAN', 'MeanShift']) || []
    } else if (this.problemType === "Outlier") {
      algorithms = [
        'HBOS',
        'PCA',
        'IsolationForest',
        'MCD',
        'EllipticEnvelope',
      ]
      disableList = (this.totalLines > 300000 && ['IsolationForest', 'MCD', 'EllipticEnvelope']) || []
    } else if (this.problemType === "Classification") {
      algorithms = [
        'adaboost',
        'bernoulli_nb',
        'decision_tree',
        'extra_trees',
        'gaussian_nb',
        'gradient_boosting',
        'k_nearest_neighbors',
        'lda',
        'liblinear_svc',
        'libsvm_svc',
        'multinomial_nb',
        'passive_aggressive',
        'qda',
        'random_forest',
        'sgd',
        'xgradient_boosting',
        'r2-logistics',
      ]
    } else if (this.problemType === "Regression") {
      algorithms = [
        'adaboost',
        'ard_regression',
        'decision_tree',
        'extra_trees',
        'gaussian_process',
        'gradient_boosting',
        'k_nearest_neighbors',
        'liblinear_svr',
        'libsvm_svr',
        'random_forest',
        'ridge_regression',
        'sgd',
        'xgradient_boosting',
      ]
    }
    return algorithms.filter(a => !disableList.includes(a))
  }

  @computed
  get defaultTrain() {
    const measurement = this.problemType === 'Classification' && 'auc' || this.problemType === 'Regression' && 'r2' || this.problemType === 'Clustering' && 'CVNN' || this.problemType === 'Outlier' && 'score'

    return {
      train2Finished: false,
      train2ing: false,
      train2Error: false,
      criteria: 'default',
      costOption: { TP: 0, FP: 0, FN: 0, TN: 0 },
      speedVSaccuracy: 5,
      ensembleSize: 20,
      // maxTime: 10,
      randSeed: 0,
      resampling: 'no',
      runWith: this.totalLines < 10000 ? 'cross' : 'holdout',
      crossCount: 5,
      dataRange: 'all',
      customField: '',
      customRange: [],
      algorithms: this.defaultAlgorithms,
      measurement,
      selectId: '',
      version: [1, 2, 4],
      trainHeader: [],
      customHeader: [],
      newVariable: [],
      newType: {},
      expression: {},
      validationRate: 20,
      holdoutRate: 20,
      hasSendEtl: false,
      dataViews: null,
      dataViewsLoading: false,
      preImportanceLoading: false,
      preImportance: {},
      mappingKey: '',
      newVariablePath: '',
      newVariableViews: {},
      distribution: 0,
      weights: {},
      standardType: 'standard',
      searchTime: 5,
      kValue: 5,
      kType: 'auto',
      trainModel: {},
      stopIds: [],
      features: ['Extra Trees', 'Random Trees', 'Fast ICA', 'Kernel PCA', 'PCA', 'Polynomial', 'Feature Agglomeration', 'Kitchen Sinks', 'Linear SVM', 'Nystroem Sampler', 'Select Percentile', 'Select Rates'],
      ssPlot: null
    } as {
      train2Finished: boolean,
      train2ing: boolean,
      train2Error: boolean,
      criteria: string,
      costOption: { TP: 0, FP: 0, FN: 0, TN: 0 },
      speedVSaccuracy: number,
      ensembleSize: number,
      // maxTime: 10,
      randSeed: number,
      resampling: string,
      runWith: string,
      crossCount: number,
      dataRange: string,
      customField: string,
      customRange: string[],
      algorithms: string[],
      measurement: string,
      selectId: string,
      version: number[],
      trainHeader: string[],
      customHeader: string[],
      newVariable: string[],
      newType: unknown,
      expression: unknown,
      validationRate: number,
      holdoutRate: number,
      hasSendEtl: boolean,
      dataViews: null,
      dataViewsLoading: boolean,
      preImportanceLoading: boolean,
      preImportance: NumberObject,
      mappingKey: string,
      newVariablePath: string,
      newVariableViews: unknown,
      distribution: number,
      weights: NumberObject,
      standardType: string,
      searchTime: number,
      kValue: number,
      kType: string,
      trainModel: unknown,
      stopIds: string[],
      features: string[],
      ssPlot: null
    }
  }

  @computed
  get settingName(): string {
    if (this.currentSetting) return this.currentSetting.name
    return ''
  }

  @computed
  get currentSetting(): Settings | undefined {
    return this.settings.find((s: any) => s.id === this.settingId)
  }

  @computed
  get sortHeader(): string[] {
    const { target, dataHeader } = this
    if (!target) return dataHeader
    return [target, ...dataHeader.filter(v => target !== v)]
  }

  @computed
  get sortData(): string[][] {
    const { target, sortHeader, uploadData, rawHeader } = this
    if (!uploadData.length) return []
    if (!target) return uploadData
    return uploadData.map(row => {
      const newRow: string[] = []
      sortHeader.forEach(v => {
        const index = rawHeader.indexOf(v)
        if (index > -1) newRow.push(row[index])
      })
      return newRow
    })
  }

  @action
  goback = () => {
    const { mainStep, lastSubStep } = this
    let backStep = mainStep
    let backSubStep = lastSubStep
    if (lastSubStep === 1) {
      backStep--;
      backSubStep = backStep === 2 ? 3 : 1
    } else {
      backSubStep--
    }
    this.updateProject({
      curStep: backStep,
      mainStep: backStep,
      lastSubStep: backSubStep,
      subStepActive: backSubStep
    })
  }

  @action
  jump = (routeIndex: number, subStepActive: number) => ({ subStepActive, curStep: routeIndex })

  @action
  nextMainStep = (routeIndex: number) => {
    let obj;
    if (routeIndex <= this.mainStep) {
      obj = {
        curStep: routeIndex,
        subStepActive: 1
      };
    } else
      obj = {
        curStep: routeIndex,
        mainStep: routeIndex,
        subStepActive: 1,
        lastSubStep: 1
      };
    return obj
  }

  @action
  nextSubStep = (subStepIndex: number, routeIndex: number) => {
    let obj;
    if (routeIndex === this.mainStep) {
      if (subStepIndex > this.lastSubStep) {
        obj = {
          subStepActive: subStepIndex,
          lastSubStep: subStepIndex
        };
      } else {
        obj = {
          subStepActive: subStepIndex
        };
      }
    } else {
      obj = {
        subStepActive: subStepIndex
      };
    }
    return obj
  };

  @action
  upIsHoldout(isHoldout: boolean) {
    // if(this.problemType === "Classification"){
    //   const {chartData,holdoutChartData,fitIndex} = this.selectModel;
    //   const {roc:{Threshold:data}} = !isHoldout?holdoutChartData:chartData;
    //   const {roc:{Threshold:nextData}} = isHoldout?holdoutChartData:chartData;
    //
    //   const od = data[fitIndex];
    //
    //   const nextValue = Object.values(nextData).sort((a,b)=>Math.abs(a-od)-Math.abs(b-od))[0];
    //
    //   const newFitIndex = Object.entries(nextData).filter(itm=>itm[1] === nextValue)[0][0];
    //   this.selectModel.fitIndex = +newFitIndex;
    // }
    this.isHoldout = isHoldout;
  };

  @action
  updateProject = (data: Object) => {
    this.loading = true;

    return socketStore.ready().then(api => {
      return api.updateProject({ ...data, id: this.id })
    })
  }

  @action
  initProject = () => {
    if (this.init) return
    socketStore.ready().then(api => {
      api.initProject({ id: this.id }).then(result => {
        const { status, message, project } = result
        if (status !== 200) return antdMessage.error(message)
        this.setProperty({ ...project, init: true })
        // Object.assign(this, project, { init: true })


        this.autorun.push(autorun(async () => {
          if (!this.originalIndex) {
            this.uploadData = []
          } else {
            // this.readData(this.originPath).then(data => {
            //   this.uploadData = data.slice(1)
            // })
            this.uploadData = await this.readIndex(this.originalIndex)
          }
        }))
      })
    })
  }

  @action
  clean = () => {
    this.init = false
    this.autorun.forEach(f => f())
    this.uploadData = []
    // this.cleanData = []
  }

  @action
  setProperty = (data: Partial<Project>) => {
    //   if (typeof data !== 'object') {
    //     return false;
    //   }
    //   if (Array.isArray(data)) {
    //     return false;
    //   }

    //  const result =  _.chain(data).omit(['totalLines','userId','id']).omitBy((value)=>{
    //       return typeof value === 'function'
    //   }).assign({
    //     changeProjectType: _.isEmpty(data.problemType) ? data.changeProjectType : data.problemType,
    //     noComputeTemp: _.isEmpty(data.noCompute) ? data.noComputeTemp : data.noCompute,
    //   }).value();

    //   for (const key in result){
    //     if(result.hasOwnProperty(key)){
    //       this[key] = result[key]
    //     }
    //   }

    Reflect.deleteProperty(data, 'totalLines')
    Reflect.deleteProperty(data, 'userId')
    Reflect.deleteProperty(data, 'id')
    for (let key in data) {
      // const value = data[key]
      const value = Reflect.get(data, key)
      // let value = (data as Project)[(key as keyof Project)]
      if (typeof value === 'function') {
        Reflect.deleteProperty(data, key)
        continue;
      }
      if (key === 'problemType') {
        Reflect.set(data, 'changeProjectType', value)
      }
      if (key === 'noCompute') {
        Reflect.set(data, 'noComputeTemp', value)
      }
      if (key === 'weights') {
        Reflect.set(data, 'weightsTemp', value)
      }
      if (key === 'standardType') {
        Reflect.set(data, 'standardTypeTemp', value)
      }
    }
    // data.updateTime = +new Date()
    Object.assign(this, data)
  }

  /**---------------------------------------------problem-------------------------------------------------*/
  @action
  saveProblem = async () => {
    const updObj: {
      statement: string
      business: string
      problemType: string
      measurement?: string
    } = {
      statement: this.statement,
      business: this.business,
      problemType: this.changeProjectType
    };
    updObj.measurement = this.changeProjectType === 'Classification' && 'auc' || this.changeProjectType === 'Regression' && 'r2' || this.changeProjectType === 'Clustering' && 'CVNN' || this.changeProjectType === 'Outlier' && 'score' || ''
    if (this.problemType && this.changeProjectType !== this.problemType) {
      await this.abortTrainByEtl()
      //全部恢复到problem步骤
      const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTrain, updObj, {
        mainStep: 2,
        curStep: 2,
        lastSubStep: 1,
        subStepActive: 1,
      })

      this.updateProject(backData);
    } else {
      this.updateProject(Object.assign({}, updObj, this.nextMainStep(2)));
    }
  }

  /**---------------------------------------------data-------------------------------------------------*/
  //修改上传文件
  @action
  fastTrackInit = async (data: UploadProps) => {

    await this.abortTrainByEtl()

    const api = await socketStore.ready()
    const { header } = await api.getHeader({ index: data.originalIndex })

    const totalRawLines = data.totalRawLines
    const fileName = data.fileName
    const originalIndex = data.originalIndex
    const mapHeader = data.rawHeader.map(_h => _h.trim())
    const rawHeader = header
    const dataHeader = header
    const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTrain, {
      rawHeader,
      dataHeader,
      mapHeader,
      totalRawLines,
      originalIndex,
      fileName,
      mainStep: 2,
      curStep: 2,
      lastSubStep: 1,
      subStepActive: 1
    })
    this.etling = true
    await this.updateProject(backData)
    // const pass = await this.etl()
    const result = await this.originalStats()
    if (result.status !== 200) {
      antdMessage.error(result.message)
      this.updateProject({ fileName: '', originalIndex: '', etling: false })
    }
  }

  @action
  originalStats = async () => {
    const api = await socketStore.ready()
    return await api.originalStats({ index: this.originalIndex, projectId: this.id, headers: toJS(this.rawHeader) })
  }

  @action
  autoFixHeader = () => {
    /**
   * 自动修改header
   */
    const temp: NumberObject = {};
    const header = this.mapHeader.map((h, i) => {
      h = h.trim();
      if (/^$/.test(h)) {
        h = `Unnamed: ${i}`;
      }
      if (!temp[h]) {
        temp[h] = 1;
      } else {
        h = h + '.' + temp[h];
        temp[h]++;
      }
      return h;
    });

    // 上传文件，target为空
    return this.updateProject({
      mapHeader: header,
    });
  }

  @computed
  get headerTemp() {
    //查看是否存在相同名称的header
    let temp: { [key: string]: number[] } = {};
    let isMissed = false;
    let isDuplicated = false;
    this.mapHeader.forEach((h, i) => {
      h = h.trim();
      if (!h) {
        isMissed = true;
        return;
      }
      if (!temp[h]) {
        temp[h] = [i];
      } else {
        isDuplicated = true;
        temp[h].push(i);
      }
    });
    return {
      temp,
      isMissed,
      isDuplicated
    };
  }

  @action
  endSchema = async () => {
    this.etling = true
    await this.abortTrainByEtl()
    const data: {
      target: string,
      colType: StringObject,
      dataHeader: string[],
      noCompute: boolean,
      nullFillMethod: StringObject,
      nullFillMethodTemp: StringObject,
      outlierFillMethod: StringObject,
      outlierFillMethodTemp: StringObject,
      crossCount?: number
    } = {
      target: this.target,
      colType: { ...this.colType },
      dataHeader: [...this.dataHeader],
      noCompute: this.noComputeTemp,
      nullFillMethod: this.nullFillMethod,
      nullFillMethodTemp: this.nullFillMethodTemp,
      outlierFillMethod: this.outlierFillMethod,
      outlierFillMethodTemp: this.outlierFillMethodTemp,
    }
    if (this.noComputeTemp) {
      if (this.problemType === 'Classification') {
        const min = Math.min(...Object.values(this.targetCounts).sort((a, b) => b - a).slice(0, 2))
        if (min < 3) {
          console.error("数量太小");
          return await Promise.reject()
        }
        if (min < 5) data.crossCount = min - 1
      }
      await this.updateProject(Object.assign(this.defaultDataQuality, this.defaultTrain, data))
      await this.newEtl()
      await this.updateProject({
        curStep: 3,
        mainStep: 3,
        subStepActive: 1,
        lastSubStep: 1
      })
      // this.etling = false
    } else {
      const step = {
        curStep: 2,
        mainStep: 2,
        subStepActive: 3,
        lastSubStep: 3
      }
      this.etling = false
      await this.updateProject(Object.assign(this.defaultDataQuality, this.defaultTrain, data, step))
    }
  }

  @computed
  get qualityHasChanged() {
    return true
    // let hasChange = false
    // const list = ['targetMap', 'outlierDict', 'nullFillMethod', 'mismatchFillMethod', 'outlierFillMethod']
    // for (const item of list) {
    //   const before = this[item]
    //   const after = this[item + "Temp"]
    //   hasChange = this.hasChanged(before, after)
    //   if (hasChange) break
    // }
    // return hasChange
  }

  @action
  endQuality = async () => {
    if (!this.qualityHasChanged) return await Promise.resolve()
    this.etling = true
    await this.abortTrainByEtl()
    const data = Object.assign(this.defaultTrain, {
      targetMap: toJS(this.targetMapTemp),
      targetArray: toJS(this.targetArrayTemp),
      outlierDict: toJS(this.outlierDictTemp),
      nullFillMethod: toJS(this.nullFillMethodTemp),
      mismatchFillMethod: toJS(this.mismatchFillMethodTemp),
      outlierFillMethod: toJS(this.outlierFillMethodTemp),
      missingReason: toJS(this.missingReasonTemp),
      curStep: 2,
      mainStep: 2,
      subStepActive: 3,
      lastSubStep: 3
    })

    if (this.problemType === 'Classification') {
      const min = Math.min(...Object.values(this.targetCounts))
      if (min < 3) {
        console.error("数量太小");
        return await Promise.reject()
      }
      if (min < 5) data.crossCount = min - 1
    }
    await this.updateProject(data)
    // await this.etl()
    await this.newEtl()
    this.etling = false
  }

  newEtl = async () => {
    const api = await socketStore.ready()
    await api.newEtl({ projectId: this.id }, ({ progress }: { progress: number }) => {
      this.etlProgress = progress
    })
    this.etlProgress = 0
    this.etling = false
  }

  hasChanged = (before: Object, after: Object): boolean => {
    if (Object.keys(before).length === Object.keys(after).length) {
      for (const key in before) {
        if (before.hasOwnProperty(key)) {
          const bvalue = Reflect.get(before, key)
          const avalue = Reflect.get(after, key)
          if (typeof bvalue === 'object') {
            const changed = this.hasChanged(bvalue as Object, avalue as Object)
            if (changed) return changed
          } else {
            if (bvalue !== avalue) return true
          }
        }
      }
      return false
    }
    return true
  }

  @computed
  get targetCounts() {
    const { colValueCounts, target, nullLineCounts, targetArrayTemp, targetMapTemp } = this
    const countData = { ...colValueCounts[target] }
    if (nullLineCounts[target]) countData[''] = nullLineCounts[target]
    return (!targetArrayTemp.length ? countData : targetArrayTemp.map((v, k) => {
      let n = 0
      Object.entries(targetMapTemp).forEach(([key, value]) => {
        if (value === k) n += countData ? (countData[key] || 0) : 0
      })
      return { [v]: n }
    }).reduce((start, item) => {
      return Object.assign(start, item)
    }, {})) || {}
  }

  @computed
  get issues() {
    const data = {
      rowIssue: false,
      dataIssue: false,
      targetIssue: false,
      targetRowIssue: false
    }
    const { problemType, totalRawLines, targetCounts, rawDataView, rawHeader, target, variableIssueCount, outlierLineCounts, mismatchLineCounts, nullLineCounts } = this;

    if (problemType === "Classification") {
      data.targetIssue = Object.keys(targetCounts).length > 2;
    } else if (problemType === "Regression") {
      const dataview = Reflect.get(rawDataView, target)
      const unique = dataview.uniqueValues || 1000
      data.targetIssue = unique < Math.min((rawHeader.length - 1) * 6, 1000)
    }

    if (totalRawLines < 1000) {
      data.rowIssue = true;
    }

    if (target && (+outlierLineCounts[target] + +mismatchLineCounts[target] + +nullLineCounts[target]) > 0) {
      data.targetRowIssue = true
    }

    if ((+variableIssueCount.nullCount + +variableIssueCount.mismatchCount + +variableIssueCount.outlierCount) > 0) {
      data.dataIssue = true
    }

    return data
  }

  @computed
  get variableIssues() {
    const { dataHeader, nullLineCounts, mismatchLineCounts, outlierLineCounts, colType, totalRawLines, problemType, target } = this;
    const obj = {
      mismatchRow: {},
      nullRow: {},
      outlierRow: {}
    }

    dataHeader.forEach(h => {
      if (colType[h] === "Numerical" && mismatchLineCounts[h]) {
        obj.mismatchRow = Object.assign(obj.mismatchRow, { [h]: (mismatchLineCounts[h] || 0) / (totalRawLines || 1) * 100 })
      }
      if (nullLineCounts[h]) {
        obj.nullRow = Object.assign(obj.nullRow, { [h]: (nullLineCounts[h] || 0) / (totalRawLines || 1) * 100 })
      }
      if ((problemType === 'Clustering' || h === target) && colType[h] === "Numerical" && outlierLineCounts[h]) {
        obj.outlierRow = Object.assign(obj.outlierRow, { [h]: (outlierLineCounts[h] || 0) / (totalRawLines || 1) * 100 })
      }
    })
    return obj
  }

  @computed
  get variableIssueCount() {
    const { nullLineCounts, mismatchLineCounts, outlierLineCounts, target, colType, problemType, dataHeader } = this
    const nullCount = Object.entries(Object.assign({}, nullLineCounts, { [target]: 0 }) || {}).filter(([_k]) => dataHeader.includes(_k)).reduce((sum, [k, v]) => sum + (Number.isInteger(v) ? v : 0), 0)
    const mismatchCount = Object.entries(Object.assign({}, mismatchLineCounts, { [target]: 0 }) || {}).filter(([_k]) => dataHeader.includes(_k)).reduce((sum, [k, v]) => sum + (colType[k] === 'Numerical' && Number.isInteger(v) ? v : 0), 0)
    const outlierCount = problemType === 'Clustering' ? Object.entries(Object.assign({}, outlierLineCounts, { [target]: 0 }) || {}).filter(([_k]) => dataHeader.includes(_k)).reduce((sum, [k, v]) => sum + (colType[k] === 'Numerical' && Number.isInteger(v) ? v : 0), 0) : 0

    return { nullCount, mismatchCount, outlierCount }
  }

  @computed
  get targetColMap() {
    const { colValueCounts, target, nullLineCounts } = this
    const countData = { ...colValueCounts[target] }
    if (nullLineCounts[target]) countData[''] = nullLineCounts[target]
    let n = 0
    const array = Object.entries(countData || {}).sort((a, b) => b[1] - a[1]) || []
    const map = array.reduce((start, [k]) => {
      return Object.assign(start, { [k]: n++ })
    }, {})
    return map
  }

  @computed
  get targetIssuesCountsOrigin() {
    const { target, outlierLineCounts, mismatchLineCounts, nullLineCounts, colType } = this;
    const arr = {
      mismatchRow: colType[target] !== "Categorical" ? (mismatchLineCounts[target] || 0) : 0,
      nullRow: nullLineCounts[target] || 0,
      outlierRow: colType[target] !== "Categorical" ? (outlierLineCounts[target] || 0) : 0,
    }
    return arr
  }

  @action
  dataView = () => {
    // const key = isClean ? 'dataViews' : 'rawDataView'
    // const featureLabel = [...this.dataHeader, ...this.newVariable].filter(v => !Object.keys(this[key]).includes(v))
    // if(!featureLabel.length) return Promise.resolve()
    return socketStore.ready().then(api => {
      // const command = {
      //   projectId: this.id,
      //   command: 'dataView',
      //   actionType: isClean ? 'clean' : 'raw',
      //   feature_label
      // };
      const readyLabels = Object.keys(this.newVariableViews)
      // const data_label = this.dataHeader.filter(v => !readyLabels.includes(v))
      const feature_label = this.newVariable.filter(v => !readyLabels.includes(v))
      // const feature_label = [...data_label, ...new_label]
      if (!feature_label.length || feature_label.length === 0) return Promise.resolve()

      const command = {
        projectId: this.id,
        command: 'top.dataView',
        actionType: 'clean',
        feature_label,
      };
      // if (new_label.length) {
      //   const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
      //   command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      // }
      this.dataViewsLoading = true
      return api.dataView(command)
        .then((returnValue: BaseResponse) => {
          const { status, result } = returnValue
          if (status < 0) {
            // this.setProperty({ dataViews: null })
            return antdMessage.error(result['processError'])
          }
          // this.setProperty({ newVariableViews: result.data, dataViewsLoading: false })
        })
    })
  }

  @action
  fixTarget = () => {
    this.updateProject({
      targetMapTemp: this.targetMapTemp,
      targetArrayTemp: this.targetArrayTemp,
      otherMap: this.otherMap
    })
  }

  @action
  fixFillMethod = () => {
    this.updateProject({
      outlierDictTemp: toJS(this.outlierDictTemp),
      nullFillMethodTemp: toJS(this.nullFillMethodTemp),
      mismatchFillMethodTemp: toJS(this.mismatchFillMethodTemp),
      outlierFillMethodTemp: toJS(this.outlierFillMethodTemp),
      missingReasonTemp: toJS(this.missingReasonTemp)
    })
  }

  // @action
  // addNewVariable = (variableName, variables, exp, type) => {
  //   const fullExp = `${variables.map(v => "@" + v).join(",")}=${exp}`
  //   const oldExp = Object.values(this.expression).join(";")
  //   const allExp = `${oldExp};${fullExp}`

  //   return socketStore.ready().then(api => {
  //     const command = {
  //       projectId: this.id,
  //       command: 'top.createNewVariable',
  //       csvScript: allExp.replace(/\|/g, ",")
  //     };
  //     return api.createNewVariable(command, progressResult => {
  //     }).then(returnValue => {
  //       const { status, result } = returnValue
  //       if (status < 0) {
  //         antdMessage.error(result.msg)
  //         return false
  //       }
  //       const newVariable = [...this.newVariable, ...variables]
  //       const trainHeader = [...this.trainHeader, ...variables]
  //       const newType = Object.assign({}, this.newType, variables.reduce((start, v) => {
  //         start[v] = type
  //         return start
  //       }, {}))
  //       const expression = Object.assign({}, this.expression, { [variableName]: fullExp })
  //       this.updateProject({
  //         newVariable,
  //         trainHeader,
  //         expression,
  //         newType,
  //         correlationMatrixData: null,
  //         correlationMatrixHeader: null,
  //         cleanPath: ''
  //       })
  //       return true
  //     })
  //   })
  // }

  @action
  addNewVariable2 = (variables: NewVariable[], type: StringObject) => {
    const scripts = [...Object.values(this.expression), ...variables].map(v => ({
      name: v.nameArray.map(n => ({
        value: n,
        type: "ID",
        name: n
      })), script: v.exps
    }))

    return socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'top.createNewVariable',
        csvScript: scripts
      };
      return api.createNewVariable(command).then((returnValue: BaseResponse) => {
        const { status, result } = returnValue
        if (status < 0) {
          antdMessage.error(result.processError)
          return false
        }
        const variablenames = variables.reduce((prev, _v) => [...prev, ..._v.nameArray], [])
        const newVariable = [...this.newVariable, ...variablenames]
        const trainHeader = [...this.trainHeader, ...variablenames]
        const newType = Object.assign({}, this.newType, type)
        const variableExp = variables.reduce((prev, _v) => {
          prev[_v.name] = _v
          return prev
        }, {} as { [key: string]: NewVariable })
        const expression = Object.assign({}, this.expression, variableExp)
        return this.updateProject({
          newVariable,
          trainHeader,
          expression,
          newType,
          correlationMatrixData: null,
          correlationMatrixHeader: null,
          cleanPath: ''
        }).then(() => true)
      })
    })
  }

  /**---------------------------------------------train------------------------------------------------*/
  @computed
  get selectModel() {
    if (this.selectId) return this.models.find(m => m.id === this.selectId) || this.recommendModel
    return this.recommendModel
  }

  @computed
  get recommendModel() {
    const { costOption, criteria, models, problemType, defualtRecommendModel, targetCounts, distribution } = this
    const [v0, v1] = Object.values(targetCounts)
    const percent0 = parseFloat(formatNumber((v1 / (v0 + v1)).toString(), 4))
    const percentNew = distribution ? distribution / 100 : percent0
    let model
    if (problemType === 'Classification') {
      const { TP, FN, FP, TN } = criteria === 'cost' ? costOption : { TP: 0, FN: 0, FP: 0, TN: 0 }
      if (TP || FN || FP || TN) {
        if (!!defualtRecommendModel.length) {
          for (let i = 0; i < Math.ceil(defualtRecommendModel.length * 0.3); i++) {
            if (!model) {
              model = defualtRecommendModel[i];
              continue;
            }
            if (model.getBenefit(TP, FN, FP, TN, percentNew, percent0).benefit < defualtRecommendModel[i].getBenefit(TP, FN, FP, TN, percentNew, percent0).benefit) {
              model = defualtRecommendModel[i];
            }
          }
        }
      }
    }
    if (model) return model
    if (!!defualtRecommendModel.length) return defualtRecommendModel[0]
    return models[0]
  }

  // @computed
  // get defualtRecommendModel() {
  //   const { models, measurement, problemType } = this
  //   const currentMeasurement = measurement || (problemType === 'Classification' ? 'auc' : 'r2')
  //   const endWithSe = currentMeasurement.endsWith("se")
  //   const filterModels = models.filter(_m => {
  //     const { score } = _m
  //     const { validateScore, holdoutScore } = score || {}
  //     if (!validateScore || !holdoutScore) return false
  //     const [validate, holdout] = [parseFloat(validateScore[currentMeasurement]), parseFloat(holdoutScore[currentMeasurement])]
  //     if (isNaN(validate) || isNaN(holdout)) return false
  //     // if (validate < 0 || holdout < 0) return false
  //     return true
  //   }).map(m => {
  //     const { score, id } = m
  //     const { validateScore, holdoutScore } = score || {}
  //     const validate = formatNumber(validateScore[currentMeasurement], 6)
  //     const holdout = formatNumber(holdoutScore[currentMeasurement], 6)
  //     const diff = formatNumber(Math.abs(validate - holdout), 6)
  //     const base = endWithSe ? formatNumber(validate / holdout, 6) : formatNumber(holdout / validate, 6)
  //     return { validate, holdout, diff, id, base }
  //   })
  //   // 没有有效值的model就推荐第一个
  //   if (!filterModels.length) return models[0]
  //   const data = filterModels.filter(m => {
  //     const { validate, holdout } = m
  //     if (validate < 0 || holdout < 0) return false
  //     return true
  //   })
  //   // 有效值都小于0 推荐holdout最大的
  //   let recommend
  //   if (!data.length) {
  //     recommend = [...filterModels].sort((a, b) => b.holdout - a.holdout)[0]
  //   } else {
  //     const holdoutArr = endWithSe ? [...data].sort((a, b) => b.holdout - a.holdout) : [...data].sort((a, b) => a.holdout - b.holdout)
  //     const diffArr = [...data].sort((a, b) => b.diff - a.diff)
  //     data.forEach(d => {
  //       const { id, base } = d
  //       const diffIndex = diffArr.indexOf(d) + 1
  //       const holdoutIndex = holdoutArr.indexOf(d) + 1
  //       const score = formatNumber(base * diffIndex * holdoutIndex, 6)
  //       if (!recommend) return recommend = { id, score }
  //       if (recommend.score < score) return recommend = { id, score }
  //     })
  //   }
  //   // recommend
  //   return models.find(m => m.id === recommend.id)
  // }

  //temp
  @computed
  get defualtRecommendModel() {
    const { currentSetting, models, measurement, problemType } = this
    const currentMeasurement = measurement || (problemType === 'Classification' && 'auc' || problemType === 'Regression' && 'r2' || problemType === 'Clustering' && 'CVNN' || problemType === 'Outlier' && 'score')
    const sort = (currentMeasurement === 'CVNN' || currentMeasurement.endsWith("se")) ? -1 : 1
    return models.filter(_m => (currentSetting && currentSetting.models && currentSetting.models.length) ? currentSetting.models.includes(_m.id) : true)
      .map(m => {
        const { score } = m
        const { validateScore, holdoutScore } = score
        let validate, holdout
        if (problemType === 'Classification') {
          validate = currentMeasurement === 'auc' ? validateScore.auc : Reflect.get(m, currentMeasurement + 'Validation')  //m[currentMeasurement + 'Validation']
          holdout = currentMeasurement === 'auc' ? holdoutScore.auc : Reflect.get(m, currentMeasurement + 'Holdout') //m[currentMeasurement + 'Holdout']
        } else if (problemType === 'Regression') {
          validate = Reflect.get(validateScore, currentMeasurement) //validateScore[currentMeasurement]
          holdout = Reflect.get(holdoutScore, currentMeasurement) //holdoutScore[currentMeasurement]
        } else if (problemType === 'Clustering' || problemType === 'Outlier') {
          validate = Reflect.get(score, currentMeasurement) //score[currentMeasurement]
          holdout = Reflect.get(score, currentMeasurement) //score[currentMeasurement]
        }
        if (isNaN(+(validate)) || isNaN(+(holdout))) return null
        return { id: m.id, value: validate + holdout }
        // const value = validate + holdout
        // if (!recommend) return recommend = { id: m.id, value }
        // if ((recommend.value - value) * sort < 0) recommend = { id: m.id, value }
      })
      .filter(_m => {
        return !!_m
      })
      .sort((a, b) => (b.value - a.value) * sort)
      .map(_m => models.find(m => m.id === _m.id))
    // if (!!recommend) return models.find(m => m.id === recommend.id)
    // return models[0]
  }

  @action
  fastTrain = () => {
    if (this.train2ing) return antdMessage.error("Your project is already training, please stop it first.")
    const {
      id,
      problemType,
      target,
      dataHeader,
      colType
    } = this;

    let command = '';
    let trainData: TrainCommand = {}

    const featureLabel = dataHeader.filter(d => d !== target).filter(h => colType[h] !== 'Raw');
    if (!featureLabel.length) return antdMessage.error("no feature label");
    const setting = this.settings.find(s => s.id === this.settingId)
    if (!setting || !setting.name) return antdMessage.error("setting error")

    switch (problemType) {
      case 'Clustering':
        command = 'clustering.train';
        const algorithms = this.totalLines > 50000 ? [
          'KMeans',
          'GMM',
          'Birch',
          'MeanShift',
        ] : this.totalLines > 20000 ? [
          'KMeans',
          'GMM',
          'Birch',
          'MeanShift',
          'Agg',
          'DBSCAN'
        ] : [
              'KMeans',
              'GMM',
              'Birch',
              'Agg',
              'SpectralClustering',
              'DBSCAN',
              'MeanShift',
            ]
        trainData = {
          kType: "auto",
          kValue: undefined,
          algorithms: algorithms,
          standardType: "standard",
          searchTime: 5,
          metricsMethod: "CVNN",
          featureLabel: featureLabel,
          randomSeed: 0,
          projectId: id,
          command,
          settingName: setting.name,
          applyWeights: {},
          problemType,
          targetLabel: target ? [target] : []
        };
        break;
      case 'Outlier':
        command = 'outlier.train';
        trainData = {
          algorithms: [
            'HBOS',
            'PCA',
            'IsolationForest',
            'MCD',
            'EllipticEnvelope',
          ],
          standardType: "standard",
          searchTime: 5,
          featureLabel: featureLabel,
          randomSeed: 0,
          projectId: id,
          command,
          settingName: setting.name,
          applyWeights: {},
          problemType,
          targetLabel: target ? [target] : []
        };
        break;
      case 'Classification':
        command = 'clfreg.train';
        trainData = {
          problemType,
          featureLabel,
          targetLabel: [target],
          projectId: id,
          version: '1,2,3,4',
          command,
          sampling: 'no',
          speedVSaccuracy: 5,
          ensembleSize: 20,
          randSeed: 0,
          measurement: "auc",
          settingName: setting.name,
          holdoutRate: 0.2,
          algorithms: [
            'adaboost',
            'bernoulli_nb',
            'decision_tree',
            'extra_trees',
            'gaussian_nb',
            'gradient_boosting',
            'k_nearest_neighbors',
            'lda',
            'liblinear_svc',
            'libsvm_svc',
            'multinomial_nb',
            'passive_aggressive',
            'qda',
            'random_forest',
            'sgd',
            'xgradient_boosting',
            'r2-logistics',
          ],
          featuresPreprocessor: ['Extra Trees', 'Random Trees', 'Fast ICA', 'Kernel PCA', 'PCA', 'Polynomial', 'Feature Agglomeration', 'Kitchen Sinks', 'Linear SVM', 'Nystroem Sampler', 'Select Percentile', 'Select Rates'].map(fe => Reflect.get(formatFeature('Classification'), fe))
        };
        if (this.totalLines > 10000) {
          trainData.validationRate = 0.2
        } else {
          trainData.nfold = 5
        }
        break;
      case 'Regression':
        command = 'clfreg.train';
        trainData = {
          problemType,
          featureLabel,
          targetLabel: [target],
          projectId: id,
          version: '1,2,3,4',
          command,
          sampling: 'no',
          speedVSaccuracy: 5,
          ensembleSize: 20,
          randSeed: 0,
          measurement: "r2",
          settingName: setting.name,
          holdoutRate: 0.2,
          algorithms: [
            'adaboost',
            'ard_regression',
            'decision_tree',
            'extra_trees',
            'gaussian_process',
            'gradient_boosting',
            'k_nearest_neighbors',
            'liblinear_svr',
            'libsvm_svr',
            'random_forest',
            'ridge_regression',
            'sgd',
            'xgradient_boosting',
          ],
          featuresPreprocessor: ['Extra Trees', 'Random Trees', 'Fast ICA', 'Kernel PCA', 'PCA', 'Polynomial', 'Feature Agglomeration', 'Kitchen Sinks', 'Linear SVM', 'Nystroem Sampler', 'Select Percentile', 'Select Rates'].map(fe => Reflect.get(formatFeature('Regression'), fe))
        };
        if (this.totalLines > 10000) {
          trainData.validationRate = 0.2
        } else {
          trainData.nfold = 5
        }
        break;
      default:
        return
    }

    // id: request ID
    // projectId: project ID
    // csv_location: csv 文件相对路径
    // problem_type: 预测类型 Classification , Regression
    // feature_label: 特征列名
    // target_label:  目标列
    // fill_method:  无效值
    // model_option: model的额外参数，不同model参数不同
    // kwargs:
    // const trainData = {
    //   problemType,
    //   featureLabel,
    //   targetLabel: target,
    //   projectId: id,
    //   version: '1,2',
    //   command,
    //   sampling: 'no',
    //   speedVSaccuracy: 5,
    //   ensembleSize: 20,
    //   randSeed: 0,
    //   measurement: problemType === "Classification" ? "auc" : "r2",
    //   settingName: setting.name,
    //   holdoutRate: 0.2
    // };

    this.modeling(trainData, Object.assign({
      train2Finished: false,
      train2ing: true,
      train2Error: false,
      selectId: '',
      settings: this.settings,
      settingId: this.settingId
    }, this.nextSubStep(2, 3)))
  }

  advancedModeling = () => {
    if (this.train2ing) return antdMessage.error("Your project is already training, please stop it first.")
    const {
      id,
      problemType,
      target,
      dataHeader,
      weightsTemp,
      newVariable,
      trainHeader,
      colType,
      features,
      standardTypeTemp
    } = this;

    let command = '';
    let trainData: TrainCommand = {}

    const featureLabel = [...dataHeader, ...newVariable].filter(d => d !== target && !trainHeader.includes(d)).filter(h => colType[h] !== 'Raw');
    if (!featureLabel.length) return antdMessage.error("no feature label")
    const setting = this.settings.find(s => s.id === this.settingId)
    if (!setting || !setting.name) return antdMessage.error("setting error")

    switch (problemType) {
      case 'Clustering':
        command = 'clustering.train';
        const disableItems = [...(this.totalLines > 20000 ? ['SpectralClustering'] : []), ...(this.totalLines > 50000 ? ['Agg', 'DBSCAN'] : []), ...(this.kType === 'no_more_than' ? ['DBSCAN', 'MeanShift'] : [])]

        trainData = {
          kType: this.kType,
          kValue: this.kValue,
          algorithms: this.algorithms.filter(al => !disableItems.includes(al)),
          standardType: standardTypeTemp,
          searchTime: this.searchTime,
          metricsMethod: this.measurement,
          featureLabel: featureLabel,
          randomSeed: this.randSeed,
          projectId: id,
          command,
          settingName: setting.name,
          applyWeights: weightsTemp,
          problemType,
          targetLabel: target ? [target] : []
        };
        break;
      case 'Outlier':
        command = 'outlier.train';
        trainData = {
          algorithms: this.algorithms,
          standardType: standardTypeTemp,
          searchTime: this.searchTime,
          featureLabel: featureLabel,
          randomSeed: this.randSeed,
          projectId: id,
          command,
          settingName: setting.name,
          applyWeights: weightsTemp,
          problemType,
          targetLabel: target ? [target] : []
        };
        break;
      default:
        command = 'clfreg.train';
        let featureList: string[] = []
        if (problemType === "Classification") {
          if (this.algorithms.some(al => [
            'adaboost',
            'decision_tree',
            'extra_trees',
            'gradient_boosting',
            'k_nearest_neighbors',
            'liblinear_svc',
            'random_forest',
            'gaussian_nb',
            'xgradient_boosting',
          ].includes(al))) featureList = featureList.concat(['Extra Trees', 'Random Trees', 'fast ICA', 'PCA', 'Polynomial', 'feature agglomeration', 'linear SVM', 'Select Percentile', 'Select Rates'])
          if (this.algorithms.includes('multinomial_nb')) featureList = featureList.concat(['Extra Trees', 'Random Trees', 'Polynomial', 'Feature Agglomeration', 'linear SVM', 'Nystroem Sampler', 'Select Percentile', 'Select Rates'])
          if (this.algorithms.some(al => ["bernoulli_nb", "lda", "libsvm_svc", "passive_aggressive", "qda", "sgd"].includes(al))) featureList = featureList.concat(["Fast ICA", "Kernel PCA", "Kitchen Sinks", "Linear SVM"])
        } else {
          if (this.algorithms.some(al => [
            'adaboost',
            'decision_tree',
            'extra_trees',
            'gradient_boosting',
            'k_nearest_neighbors',
            'random_forest',
            'gaussian_process',
            'xgradient_boosting',
          ].includes(al))) featureList = featureList.concat(['Extra Trees', 'Random Trees', 'fast ICA', 'PCA', 'Polynomial', 'Feature Agglomeration', 'linear SVM', 'Nystroem Sampler', 'Select Percentile', 'Select Rates'])
          if (this.algorithms.some(al => ["ard_regression", "liblinear_svr", "libsvm_svr", "ridge_regression", "sgd"].includes(al))) featureList = featureList.concat(["Fast ICA", "Kernel PCA", "Kitchen Sinks", "Linear SVM"])
        }
        const featuresPreprocessor = features.filter(fe => featureList.includes(fe)).map(fe => {
          const curFeature = formatFeature(problemType === "Classification" ? "Classification" : "Regression")
          return Reflect.get(curFeature, fe)
        })
        trainData = {
          problemType,
          featureLabel,
          targetLabel: [target],
          projectId: id,
          version: this.version.join(','),
          command,
          sampling: this.resampling,
          speedVSaccuracy: this.speedVSaccuracy,
          ensembleSize: this.ensembleSize,
          randSeed: this.randSeed,
          measurement: this.measurement,
          settingName: setting.name,
          holdoutRate: this.holdoutRate / 100,
          algorithms: this.algorithms,
          featuresPreprocessor
        };
        if (this.runWith === 'holdout') {
          trainData.validationRate = this.validationRate / 100
        } else {
          trainData.nfold = this.crossCount
        }
    }

    // id: request ID
    // projectId: project ID
    // csv_location: csv 文件相对路径
    // problem_type: 预测类型 Classification , Regression
    // feature_label: 特征列名
    // target_label:  目标列
    // fill_method:  无效值
    // model_option: model的额外参数，不同model参数不同
    // kwargs:
    // const trainData = {
    //   problemType,
    //   featureLabel,
    //   targetLabel: target,
    //   projectId: id,
    //   version: '1,2',
    //   command,
    //   sampling: 'no',
    //   speedVSaccuracy: 5,
    //   ensembleSize: 20,
    //   randSeed: 0,
    //   measurement: problemType === "Classification" ? "auc" : "r2",
    //   settingName: setting.name,
    //   holdoutRate: 0.2
    // };


    this.modeling(trainData, Object.assign({
      train2Finished: false,
      train2ing: true,
      train2Error: false,
      selectId: '',
      settings: this.settings,
      settingId: this.settingId,
      kType: this.kType,
      kValue: this.kValue,
      algorithms: this.algorithms,
      standardType: standardTypeTemp,
      searchTime: this.searchTime,
      measurement: this.measurement,
      randSeed: this.randSeed,
      weights: weightsTemp,
      features,
      version: this.version,
      resampling: this.resampling,
      speedVSaccuracy: this.speedVSaccuracy,
      ensembleSize: this.ensembleSize,
      holdoutRate: this.holdoutRate,
      validationRate: this.validationRate,
      crossCount: this.crossCount
    }, this.nextSubStep(2, 3)))
  }

  newSetting = (type = 'auto') => {
    const { features, problemType, kType, kValue, weights, standardType, searchTime, dataHeader, newVariable, trainHeader, version, validationRate, holdoutRate, randSeed, measurement, runWith, resampling, crossCount, dataRange, customField, customRange, algorithms, speedVSaccuracy, ensembleSize } = this;
    const featureLabel = [...dataHeader, ...newVariable].filter(h => !trainHeader.includes(h))

    let setting

    switch (problemType) {
      case 'Clustering':
        setting = type === 'auto' ? {
          kType,
          kValue,
          measurement,
          algorithms: [
            'KMeans',
            'GMM',
            'Birch',
            'Agg',
            'SpectralClustering',
            'DBSCAN',
            'MeanShift',
          ],
          standardType: 'standard',
          searchTime: 5,
          featureLabel,
          randSeed: 0,
          weights: {},
        } : {
            kType,
            kValue,
            measurement,
            algorithms,
            standardType,
            searchTime,
            featureLabel,
            randSeed,
            weights,
          };
        break;
      case 'Outlier':
        setting = type === 'auto' ? {
          algorithms: [
            'HBOS',
            'PCA',
            'IsolationForest',
            'MCD',
            'EllipticEnvelope',
          ],
          standardType: 'standard',
          searchTime: 5,
          featureLabel,
          randSeed: 0,
          weights: {},
        } : {
            algorithms,
            standardType,
            searchTime,
            featureLabel,
            randSeed,
            weights,
          };
        break;
      default:
        setting = type === 'auto' ? {
          version: [1, 2, 4],
          validationRate: 20,
          holdoutRate: 20,
          randSeed: 0,
          measurement: problemType === "Classification" ? "auc" : "r2",
          runWith: this.totalLines < 10000 ? 'cross' : 'holdout',
          resampling: 'no',
          crossCount: '5',
          dataRange: 'all',
          customField: '',
          customRange: [],
          features: ['Extra Trees', 'Random Trees', 'Fast ICA', 'Kernel PCA', 'PCA', 'Polynomial', 'Feature Agglomeration', 'Kitchen Sinks', 'Linear SVM', 'Nystroem Sampler', 'Select Percentile', 'Select Rates'],
          algorithms: problemType === "Classification" ? [
            'adaboost',
            'bernoulli_nb',
            'decision_tree',
            'extra_trees',
            'gaussian_nb',
            'gradient_boosting',
            'k_nearest_neighbors',
            'lda',
            'liblinear_svc',
            'libsvm_svc',
            'multinomial_nb',
            'passive_aggressive',
            'qda',
            'random_forest',
            'sgd',
            'xgradient_boosting',
            'r2-logistics',
          ] : [
              'adaboost',
              'ard_regression',
              'decision_tree',
              'extra_trees',
              'gaussian_process',
              'gradient_boosting',
              'k_nearest_neighbors',
              'liblinear_svr',
              'libsvm_svr',
              'random_forest',
              'ridge_regression',
              'sgd',
              'xgradient_boosting',
            ],
          speedVSaccuracy: 5,
          ensembleSize: 20,
          featureLabel
        } : {
            version,
            validationRate,
            holdoutRate,
            randSeed,
            measurement,
            runWith,
            resampling,
            crossCount,
            dataRange,
            customField,
            customRange,
            algorithms,
            speedVSaccuracy,
            ensembleSize,
            featureLabel,
            features
          }
    }

    const name = `${type}.${moment().format('MM.DD.YYYY_HH:mm:ss')}`
    const id = uuid.v4()
    this.settingId = id
    this.settings.push({
      id,
      name: name,
      setting,
      models: []
    })
  }

  removeCurSetting = () => {
    this.settings = this.settings.filter(st => st.id !== this.settingId)
    const curSetting = this.settings[this.settings.length - 1]
    this.settingId = curSetting ? curSetting.id : ''
  }

  modeling = (trainData: TrainCommand, updateData: Object) => {
    if (this.etling) return antdMessage.error('modeling error')
    this.train2ing = true
    this.isAbort = false
    // socketStore.ready().then(api => api.train({...trainData, data: updateData,command: "clfreg.train"}, progressResult => {
    socketStore.ready().then(api => api.train({ ...trainData, data: updateData })).then(returnValue => {
      this.trainingId = ''
      const { status, message } = returnValue
      if (status !== 200) {
        antdMessage.error(message)
      }
    })
  }

  abortTrain = (stopId: string, isLoading: boolean = false) => {
    if (!stopId) return Promise.resolve()
    if (this.stopModel) return Promise.resolve()
    this.stopModel = true
    const command = {
      command: 'stop',
      action: 'train',
      projectId: this.id,
      isLoading,
      stopId
    }
    this.isAbort = true
    return socketStore.ready().then(api => api.abortTrain(command).then((returnValue: BaseResponse) => {
      const { status, message, result, id } = returnValue
      if (id !== this.id) return
      if (status !== 200) return antdMessage.error(message)
      this.setProperty({ ...result, stopModel: false })
    }))
  }

  abortTrainByEtl = async () => {
    this.models = []
    if (this.train2ing && !!this.stopIds.length) {
      for (let si of this.stopIds) {
        await this.abortTrain(si)
      }
      return
      // const arr = this.stopIds.map(si => this.abortTrain(si))
      // return Promise.all(arr)
    }
    return
  }

  setModel = (data: Model) => {
    if (this.mainStep !== 3 || this.lastSubStep !== 2) return
    if (this.isAbort) return
    // if (this.trainModel && data.modelName === this.trainModel.name) this.trainModel = null
    const model = new Model(this.id, { ...data, measurement: this.measurement })
    if (!!this.models.length) {
      const { problemType } = model
      const key = problemType === 'Classification' ? 'auc' : 'r2'
      const min = problemType === 'Classification' ? 0.5 : 0;
      const { validateScore } = model.score;
      if (validateScore) {
        const isBad = validateScore[key] < min
        if (isBad) return
      }
    }
    this.models = [...this.models.filter(m => data.id !== m.id), model]
    if (data.chartData && this.criteria === "cost") {
      const { TP, FP, FN, TN } = this.costOption
      const [v0, v1] = Object.values(this.targetCounts)
      const percent0 = parseFloat(formatNumber((v1 / (v0 + v1)).toString(), 4))
      const percentNew = this.distribution ? this.distribution / 100 : percent0
      const { index } = model.getBenefit(TP, FP, FN, TN, percentNew, percent0)
      if (index === model.fitIndex) return
      model.updateModel({ fitIndex: index })
    }
  }

  setModelField = (data: Partial<Model>, times: number = 0) => {
    const model = this.models.find(m => data.id === m.id)
    if (!model) {
      if (times > 10) return
      setTimeout(() => this.setModelField(data, times + 1), 100)
      return
    }
    model.setProperty(data)
    if (data.chartData && this.criteria === "cost") {
      const { TP, FP, FN, TN } = this.costOption;
      const [v0, v1] = Object.values(this.targetCounts);
      const percent0 = parseFloat(formatNumber((v1 / (v0 + v1)).toString(), 4));
      const percentNew = this.distribution ? this.distribution / 100 : percent0;
      const { index } = model.getBenefit(TP, FP, FN, TN, percentNew, percent0);
      if (index === model.fitIndex) return;
      model.updateModel({ fitIndex: index })
    }
  }

  setSelectModel = (id: string) => {
    this.updateProject({ selectId: id })
  }

  initModels = () => {
    this.loadModel = true
    let show = true
    let count = 0
    const so = setTimeout(() => {
      if (!count) {
        show = false
        antdMessage.error(EN.timeoutRetry, 3)
        this.initModels()
      }
    }, 60000)
    this.models = []
    socketStore.ready().then(api => api.queryModelList({ id: this.id }, (progressResult: BaseResponse) => {
      const { status, message, model } = progressResult
      if (status !== 200) return antdMessage.error(message)
      count++
      this.setModel(model)
    })).then(result => {
      if (!show) return
      clearTimeout(so)
      const { status, message } = result
      if (status !== 200) return alert(message)
      // this.models = []
      this.loadModel = false
      // list.forEach(m => {
      //   this.setModel(m)
      // });
    })
  }

  preTrainImportance = () => {
    if (this.preImportanceLoading) return Promise.resolve()
    return socketStore.ready().then(api => {
      const readyLabels = this.preImportance ? Object.keys(this.preImportance) : []
      const data_label = this.dataHeader.filter(v => !readyLabels.includes(v) && v !== this.target)
      const new_label = this.newVariable.filter(v => !readyLabels.includes(v) && v !== this.target)
      const feature_label = [...data_label, ...new_label]
      if (!feature_label.length || feature_label.length === 0) return Promise.resolve()

      let cmd = 'clfreg.preTrainImportance'
      // switch (this.problemType) {
      //   case 'Clustering':
      //     cmd = 'clustering.train';
      //     break;
      //   case 'Outlier':
      //     cmd = 'outlier.train';
      //     break;
      //   default:
      //     cmd = 'clfreg.train';
      // }

      const command = {
        projectId: this.id,
        command: cmd,
        feature_label
      };
      // if (new_label.length) {
      //   const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
      //   command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      // }
      this.preImportanceLoading = true
      return api.preTrainImportance(command)
        .then((returnValue: BaseResponse) => {
          const { status, result } = returnValue
          if (status < 0) {
            return antdMessage.error(result['processError'])
          }
          // this.setProperty({
          //   preImportance: result.preImportance,
          //   informativesLabel: result.informativesLabel,
          //   preImportanceLoading: false
          // })
        })
    })
  }

  clusterPreTrainImportance = () => {
    if (this.preImportanceLoading) return Promise.resolve()
    if (this.problemType !== 'Clustering') return Promise.resolve()

    const allLabel = [...this.dataHeader, ...this.newVariable].filter(v => v !== this.target)
    //移除, 现由views判断
    // const before = allLabel.reduce((prev, la) => {
    //   prev[la] = this.weights[la] || 1
    //   return prev
    // }, {} as NumberObject)
    // const after = allLabel.reduce((prev, la) => {
    //   prev[la] = this.weightsTemp[la] || 1
    //   return prev
    // }, {} as NumberObject)

    // const isChange = !Object.keys(this.preImportance).length || this.hasChanged(before, after) || this.standardTypeTemp !== this.standardType

    // if (!isChange) return Promise.resolve()

    return socketStore.ready().then(api => {
      let cmd = 'clustering.preTrainImportance'
      // switch (this.problemType) {
      //   case 'Clustering':
      //     cmd = 'clustering.train';
      //     break;
      //   case 'Outlier':
      //     cmd = 'outlier.train';
      //     break;
      //   default:
      //     cmd = 'clfreg.train';
      // }

      const command = {
        projectId: this.id,
        command: cmd,
        feature_label: allLabel,
        standardType: this.standardTypeTemp,
        weights: allLabel.reduce((prev, la) => {
          prev.push(this.weightsTemp[la] || 1)
          // prev[la] =
          return prev
        }, [] as number[]),
      };
      // if (new_label.length) {
      //   const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
      //   command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      // }
      this.preImportanceLoading = true
      return api.preTrainImportance(command)
        .then((returnValue: BaseResponse) => {
          const { status, result } = returnValue
          if (status < 0) {
            return antdMessage.error(result['processError'])
          }
          // this.setProperty({
          //   preImportance: result.preImportance,
          //   informativesLabel: result.informativesLabel,
          //   preImportanceLoading: false
          // })
        })
    })
  }

  /**------------------------------------------------chart---------------------------------------------------------*/
  correlationMatrix = () => {
    if (this.correlationMatrixLoading) return Promise.resolve()
    this.correlationMatrixLoading = true
    return socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'correlationMatrix',
        featureLabel: this.dataHeader.filter(n => n !== this.target)
      };
      return api.correlationMatrix(command).then((returnValue: BaseResponse) => {
        const { status, result } = returnValue
        this.correlationMatrixLoading = false
        if (status < 0) return antdMessage.error(result['processError'])
        this.correlationMatrixHeader = result.header;
        this.correlationMatrixData = result.data;
      })
    })
  }

  univariatePlot = (field: string) => {
    if (!field) return
    if (field === this.target) return
    if (!this.newVariable.includes(field)) return
    if (this.univariatePlots.hasOwnProperty(field)) return
    Reflect.deleteProperty(this.univariatePlots, field)
    // this.univariatePlots[field] = ''
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'clfreg.univariatePlot',
        feature_label: [field]
      };
      // if (field) {
      //   if (this.newVariable.includes(field)) {
      //     command.feature_label = [...this.newVariable]
      //   } else {
      //     command.feature_label = [field]
      //   }
      // }
      api.univariatePlot(command, (progressResult: BaseResponse) => {
        const { result } = progressResult
        const { field: plotKey, Data, progress } = result;
        if (progress && progress === "start") return
        const univariatePlots = Object.assign({}, this.univariatePlots);
        univariatePlots[plotKey] = Data
        this.setProperty({ univariatePlots })
      }).then(this.handleError)
    })
  }

  histgramPlot = (field: string) => {
    if (!field) return
    if (!this.newVariable.includes(field)) return
    if (this.histgramPlots.hasOwnProperty(field)) return
    Reflect.deleteProperty(this.histgramPlots, field)
    // this.histgramPlots[field] = ''
    socketStore.ready().then(api => {
      const command: {
        projectId: string,
        command: string,
        feature_label: string[],
        newFeatureLabel?: NumberObject
      } = {
        projectId: this.id,
        command: 'top.histgramPlot',
        feature_label: [field]
      };
      if (field === this.target) {
        const newFeatureLabel = {}
        Object.keys(this.targetColMap).slice(0, 2).forEach((k, index) => {
          const rename = this.renameVariable[k]
          if (!!rename) Reflect.set(newFeatureLabel, rename, index)
        })
        if (!!Object.keys(newFeatureLabel).length) command.newFeatureLabel = newFeatureLabel
      }
      // if (field) {
      //   if (this.newVariable.includes(field)) {
      //     command.feature_label = [...this.newVariable]
      //   } else {
      //     command.feature_label = [field]
      //   }
      // }
      api.histgramPlot(command, (progressResult: BaseResponse) => {
        const { result } = progressResult
        const { field: plotKey, Data, progress } = result;
        if (progress && progress === "start") return
        const histgramPlots = Object.assign({}, this.histgramPlots);
        histgramPlots[plotKey] = Data
        this.setProperty({ histgramPlots })
      }).then(this.handleError)
    })
  }

  getSsPlot = () => {
    return socketStore.ready().then(api => {
      return api.ssPlot({
        command: 'clustering.ssPlot',
        projectId: this.id
      }, (prosss: BaseResponse) => {
      }).then((returnValue: BaseResponse) => {
        const { status, result } = returnValue
        if (status < 0) antdMessage.error(`${result['processError']}`)
      })
    })
  }

  handleError = (returnValue: BaseResponse) => {
    const { result, status, command } = returnValue
    if (status < 0) antdMessage.error(`command:${command}, error:${result['processError']}`)
  }

  getSample = () => {
    return socketStore.ready()
      .then(api => api.getSample({ problemType: this.problemType }))
      .then(res => {
        return res.list || []
      })
      .catch(e => {
        console.error(e.message, "sample error")
        antdMessage.error("fetch sample error")
        return []
      })
  }

  etlCleanData = () => {
    const { dataHeader, newVariable } = this
    const fields = [...dataHeader, ...newVariable]
    return socketStore.ready().then(api => {
      const command = {
        feature_label: fields,
        command: 'etlCleanData',
        projectId: this.id
      }
      this.etlCleanDataLoading = true
      return api.etlCleanData(command)
    })
  }

  allPlots = async (changeReportProgress: (str: string, num: number) => boolean) => {
    const variableCount = this.dataHeader.length - 1
    const api = await socketStore.ready()
    type plotCommand = {
      projectId: string,
      command: string,
      feature_label: string[]
    }
    const univariateCommand: plotCommand = {
      projectId: this.id,
      command: 'univariatePlot',
      feature_label: []
    }
    const histogramCommand: plotCommand = {
      projectId: this.id,
      command: 'histgramPlot',
      feature_label: []
    }
    const rawHistogramCommand: plotCommand = {
      projectId: this.id,
      command: 'rawHistgramPlot',
      feature_label: [this.target]
    }
    if (changeReportProgress('preparing univariate plot.', 75)) return
    let univariatePlotCount = 0
    await api.univariatePlot(univariateCommand, (progressResult: BaseResponse) => {
      univariatePlotCount++
      const { result } = progressResult
      const { field: plotKey, imageSavePath, progress } = result;
      if (result.name === 'progress') return
      if (progress && progress === "start") return
      this.univariatePlotsBase64[plotKey] = imageSavePath
      changeReportProgress(`preparing univariate plot.(${univariatePlotCount}/${variableCount})`, 75 + 5 * univariatePlotCount / variableCount)
    })
    if (changeReportProgress('preparing histogram plot.', 80)) return
    let histgramPlotCount = 0
    await api.histgramPlot(histogramCommand, (progressResult: BaseResponse) => {
      histgramPlotCount++
      const { result } = progressResult
      const { field: plotKey, imageSavePath, progress } = result;
      if (result.name === 'progress') return
      if (progress && progress === "start") return
      this.histgramPlotsBase64[plotKey] = imageSavePath
      changeReportProgress(`preparing histogram plot.(${histgramPlotCount}/${variableCount})`, 80 + 5 * histgramPlotCount / variableCount)
    })
    if (changeReportProgress('preparing target histogram plot.', 85)) return
    await api.rawHistgramPlot(rawHistogramCommand, (progressResult: BaseResponse) => {
      const { result } = progressResult
      const { field: plotKey, imageSavePath, progress } = result;
      if (result.name === 'progress') return
      if (progress && progress === "start") return
      this.rawHistgramPlotsBase64[plotKey] = imageSavePath
    })
  }

  getBase64Image = (img: HTMLImageElement) => {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL // return dataURL.replace("data:image/png;base64,", "");
  }

  translateToBase64 = (imagePath: string) => {
    if (!imagePath) return Promise.resolve('')
    const url = `http://${config.host}:${config.port}/redirect/download/${imagePath}?projectId=${this.id}`
    return new Promise((resolve, reject) => {
      var img = document.createElement('img');
      img.src = url
      img.onload = () => resolve(this.getBase64Image(img))
      img.onerror = () => reject()
    })
  }

  generateReportHtml = async (jsonData: string) => {
    const script = 'script'
    const body = 'body'
    const link = 'link'
    const style = 'style'
    const htmlResp = await axios.get('/index.html')
    let html = htmlResp.data
    html = html.replace(`<${link} rel="manifest" href="/manifest.json">`, '')
    html = html.replace(`<${link} rel="shortcut icon" href="/favicon.ico">`, '')
    const cssVersionStartStr = `<${link} href="/static/css/main.`
    const cssVersionStart = html.indexOf(cssVersionStartStr) + cssVersionStartStr.length
    const cssVersionEnd = html.indexOf('.', cssVersionStart)
    const cssVersion = html.slice(cssVersionStart, cssVersionEnd)

    const cssUrl = `/static/css/main.${cssVersion}.chunk.css`
    const cssLink = `<${link} href="/static/css/main.${cssVersion}.chunk.css" rel="stylesheet">`
    const cssResp = await axios.get(cssUrl)
    const cssData = cssResp.data
    const cssTag = `<${style}>${cssData}</${style}>`
    html = html.replace(cssLink, '')


    const cssChunkVersionStartStr = `<${link} href="/static/css/2.`
    const cssChunkVersionStart = html.indexOf(cssChunkVersionStartStr) + cssChunkVersionStartStr.length
    const cssChunkVersionEnd = html.indexOf('.', cssChunkVersionStart)
    const cssChunkVersion = html.slice(cssChunkVersionStart, cssChunkVersionEnd)

    const cssChunkUrl = `/static/css/2.${cssChunkVersion}.chunk.css`
    const cssChunkLink = `<${link} href="/static/css/2.${cssChunkVersion}.chunk.css" rel="stylesheet">`
    const cssChunkResp = await axios.get(cssChunkUrl)
    const cssChunkData = cssChunkResp.data
    const cssChunkTag = `<${style}>${cssChunkData}</${style}>`
    html = html.replace(cssChunkLink, '')

    const jsVersionStartStr = `<${script} src="/static/js/main.`
    const jsVersionStart = html.indexOf(jsVersionStartStr) + jsVersionStartStr.length
    const jsVersionEnd = html.indexOf('.', jsVersionStart)
    const jsVersion = html.slice(jsVersionStart, jsVersionEnd)

    const jsUrl = `/static/js/main.${jsVersion}.chunk.js`
    const jsLink = `<${script} src="/static/js/main.${jsVersion}.chunk.js"></${script}>`
    const jsResp = await axios.get(jsUrl)
    const jsData = jsResp.data
    const jsTag = `<${script}>` + jsData + `</${script}>`
    html = html.replace(jsLink, '')

    const jsChunkVersionStartStr = `<${script} src="/static/js/2.`
    const jsChunkVersionStart = html.indexOf(jsChunkVersionStartStr) + jsChunkVersionStartStr.length
    const jsChunkVersionEnd = html.indexOf('.', jsChunkVersionStart)
    const jsChunkVersion = html.slice(jsChunkVersionStart, jsChunkVersionEnd)

    const jsChunkUrl = `/static/js/2.${jsChunkVersion}.chunk.js`
    const jsChunkLink = `<${script} src="/static/js/2.${jsChunkVersion}.chunk.js"></${script}>`
    const jsChunkResp = await axios.get(jsChunkUrl)
    const jsChunkData = jsChunkResp.data
    const jsChunkTag = `<${script}>` + jsChunkData + `</${script}>`
    html = html.replace(jsChunkLink, '')

    html = html.replace(`</${body}>`, '')
    // cannot use replace with js code ($$typeof wrong)
    html = html + `<${script}>window.r2Report=${jsonData}</${script}>${jsChunkTag}${jsTag}${cssChunkTag}${cssTag}</${body}>`
    return html
  }

  histogram(field: string) {
    const { colType, dataViews, etlIndex } = this;
    const value: Stats = Reflect.get(dataViews, field)
    if (!value) {
      return {}
    }
    if (colType[field] === 'Numerical') {
      const { min, max } = value;
      return {
        "name": "histogram-numerical",
        "data": {
          field,
          id: etlIndex,
          interval: (max - min) / 100
        }
      }
    } else {
      const { uniqueValues } = dataViews[field];
      return {
        "name": "histogram-categorical",
        "data": {
          field,
          id: etlIndex,
          size: uniqueValues > 8 ? 8 : uniqueValues,
        }
      }
    }
  }

  univariant(value: string) {
    const { target, problemType, etlIndex, colType, dataViews } = this;
    const type = colType[value];
    const dataUn: Stats = Reflect.get(dataViews, value)
    if (!dataUn) {
      return {}
    }

    if (problemType === "Regression") {
      if (type === 'Numerical') {//散点图
        return {
          name: 'regression-numerical',
          data: {
            y: target,
            x: value,
            id: etlIndex,
          }
        };
      } else {//回归-分类 箱线图
        return {
          name: 'regression-categorical',
          data: {
            target,
            value,
            id: etlIndex,
          }
        };
      }
    } else {//Univariant
      const { min, max } = dataUn;
      const data = {
        target,
        value,
        id: etlIndex,
        interval: Math.floor((max - min) / 20) || 1,
      };

      if (type === 'Numerical') {
        return {
          name: 'classification-numerical',
          data,
        };
      } else {//?
        return {
          name: 'classification-categorical',
          data,
        };
      }
    }
  }

  //在这里获取所以直方图折线图数据
  allVariableList = (model: any) => {
    const { target, colType, etlIndex, dataHeader, newVariable, preImportance, trainHeader } = this;

    const list = [];
    list.push(this.histogram(target));

    const fields = Object.entries(toJS(colType))
      .filter(itm => itm[1] === 'Numerical')
      .map(itm => itm[0]);

    list.push({
      name: 'correlation-matrix',
      data: {
        fields,
        id: etlIndex,
      }
    });


    const allVariables = [...dataHeader.filter(h => h !== target), ...newVariable];
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v));
    [allVariables].map(v => v.sort().toString()).indexOf(checkedVariables.sort().toString());
    allVariables.sort((a, b) => {
      return preImportance ? -1 * ((preImportance[a] || 0) - (preImportance[b] || 0)) : 0
    });

    for (let itm of allVariables) {
      list.push(this.histogram(itm));
      list.push(this.univariant(itm));
    }

    const { validatePlotData, holdoutPlotData } = model;
    if (validatePlotData) {
      list.push({
        name: 'predicted-vs-actual-plot',
        data: {
          url: validatePlotData,
        },
      });
      list.push({
        name: 'predicted-vs-actual-plot',
        data: {
          url: holdoutPlotData,
        },
      });
      list.push({
        name: 'fit-plot',
        data: {
          url: validatePlotData,
        },
      });
      list.push({
        name: 'fit-plot',
        data: {
          url: holdoutPlotData,
        },
      });
    }



    return request.post({
      url: '/graphics/list',
      data: list.filter(itm => itm),
    })
  };


  // 点击导出的按钮
  generateReport = async (modelId: string, aaa?: Object) => {
    console.log(aaa)
    // aaa.routing.history.push('/report')
    console.log(this, 'ttttttttttttttttttttttt')

    // const data = {
    //   field: "sex",
    //   id: this.etlIndex,
    // };
    // const { uniqueValues } = this.dataViews["sex"];
    // data.size = uniqueValues > 8 ? 8 : uniqueValues;
    // request.post({
    //   url: '/graphics/histogram-categorical',
    //   data,
    // })

    // this.dataViews.forEach((res) => {
    //   console.log(res)
    // })


    // let cancel = false
    // const changeReportProgress = action((text, progress) => {
    //   if (!cancel) {
    //     if (text) this.reportProgressText = text
    //     if (progress) this.reportProgress = progress
    //   }
    // })
    //
    // const report = async (modelId) => {
    //   changeReportProgress('initializing report.', 0)


    const model: any = this.models.find(m => m.id === modelId);
    //在这里获取所以直方图折线图数据
    // changeReportProgress('preparing univariate plot.', 75)
    model.graphicList = await this.allVariableList(model);
    // changeReportProgress('preparing univariate plot.', 100)
    const json = JSON.stringify([{ ...this, ...{ models: [model] } }]);

    console.log(json, ' jjjjjjjjjjjjjjjj')
    //   // preImportance
    //   this.preImportance = null
    //
    //   const dataViewDisposer = autorun(() => changeReportProgress('preparing variable data.', this.dataViewProgress ? this.dataViewProgress / 10 : 0))
    //   await this.dataView()
    //   dataViewDisposer()
    //   if (cancel) return
    //   const preTrainImportanceDisposer = autorun(() => changeReportProgress('preparing variable preimportance.', 10 + (this.importanceProgress ? this.importanceProgress / 2 : 0)))
    //   await this.preTrainImportance()
    //   preTrainImportanceDisposer()
    //   if (cancel) return
    //   // correlation matrix
    //   changeReportProgress('preparing variable correlation matrix.', 70)
    //   await this.correlationMatrix()
    //   if (cancel) return
    //   // plots
    //   this.univariatePlotsBase64 = {}
    //   this.histgramPlotsBase64 = {}
    //   this.rawHistgramPlotsBase64 = {}
    //   await this.allPlots(changeReportProgress)
    //   if (cancel) return
    //   // translate image to base64
    //   try {
    //     const univariatePlots = Object.keys(this.univariatePlotsBase64)
    //     const histgramPlots = Object.keys(this.histgramPlotsBase64)
    //     const rawHistgramPlots = Object.keys(this.rawHistgramPlotsBase64)
    //     const imageCount = univariatePlots.length + histgramPlots.length + rawHistgramPlots.length + (this.problemType === 'Regression' ? 2 : 0)
    //     let count = 0
    //     changeReportProgress(`downloading plots. (0/${imageCount})`, 90)
    //     await Promise.all(univariatePlots.map(async (k, index) => {
    //       this.univariatePlotsBase64[k] = await this.translateToBase64(this.univariatePlotsBase64[k])
    //       changeReportProgress(`downloading plots. (${++count}/${imageCount})`, 90 + (count / imageCount * 10))
    //     }))
    //     if (cancel) return
    //     await Promise.all(histgramPlots.map(async k => {
    //       this.histgramPlotsBase64[k] = await this.translateToBase64(this.histgramPlotsBase64[k])
    //       changeReportProgress(`downloading plots. (${++count}/${imageCount})`, 90 + (count / imageCount * 10))
    //     }))
    //     if (cancel) return
    //     await Promise.all(rawHistgramPlots.map(async k => {
    //       this.rawHistgramPlotsBase64[k] = await this.translateToBase64(this.rawHistgramPlotsBase64[k])
    //       changeReportProgress(`downloading plots. (${++count}/${imageCount})`, 90 + (count / imageCount * 10))
    //     }))
    //     if (cancel) return
    //     if (this.problemType === 'Regression') {
    //       // fit plot
    //       model.fitPlotBase64 = await this.translateToBase64(model.fitPlot)
    //       if (cancel) return
    //       changeReportProgress(`downloading plots. (${++count}/${imageCount})`, 90 + (count / imageCount * 10))
    //       // residual plot
    //       model.residualPlotBase64 = await this.translateToBase64(model.residualPlot)
    //       if (cancel) return
    //       changeReportProgress(`downloading plots. (${++count}/${imageCount})`, 90 + (count / imageCount * 10))
    //     }
    //   } catch (e) {
    //   }
    //   // generate json
    //   const json = JSON.stringify([{ ...this, ...{ models: [model] } }])
    //
    //   changeReportProgress(`generating report file`, 100)
    //   const html = await this.generateReportHtml(json)
    //   if (cancel) {
    //     changeReportProgress(`init`, 0)
    //     return
    //   }
    //   loadFile(`R2Learn_Report_${this.id}.html`, html)
    //   changeReportProgress(`init`, 0)
    // }
    // report(modelId)
    // const json = JSON.stringify(c1)

    // changeReportProgress(`generating report file`, 100)
    const html = await this.generateReportHtml(json)
    // if (cancel) {
    //   // changeReportProgress(`init`, 0)
    //   return
    // }
    loadFile(`R2Learn_Report_${this.id}.html`, html)
    // changeReportProgress(`init`, 0)
    return action(() => {
      // cancel = true
      setTimeout(action(() => {
        this.reportProgressText = 'init'
      }), 10)
      this.reportProgress = 0
    })
  }
}

function loadFile(fileName: string, content: string) {
  var aLink = document.createElement('a');
  var blob = new Blob([content], {
    type: 'text/plain'
  });
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();
  URL.revokeObjectURL(blob.toString());
}

function formatFeature(pt: 'Classification' | 'Regression') {
  const obj = {
    Classification: {
      'Extra Trees': 'extra_trees_preproc_for_classification',
      'Random Trees': 'random_trees_embedding',
      'Fast ICA': 'fast_ica',
      'Kernel PCA': 'kernel_pca',
      'PCA': 'pca',
      'Polynomial': 'polynomial',
      'Feature Agglomeration': 'feature_agglomeration',
      'Kitchen Sinks': 'kitchen_sinks',
      'Linear SVM': 'linear_svc_preprocessor',
      'Nystroem Sampler': 'nystroem_sampler',
      'Select Percentile': 'select_percentile_classification',
      'Select Rates': 'select_rates',
    },
    Regression: {
      'Extra Trees': 'extra_trees_preproc_for_regression',
      'Random Trees': 'random_trees_embedding',
      'Fast ICA': 'fast_ica',
      'Kernel PCA': 'kernel_pca',
      'PCA': 'pca',
      'Polynomial': 'polynomial',
      'Feature Agglomeration': 'feature_agglomeration',
      'Kitchen Sinks': 'kitchen_sinks',
      'Linear SVM': 'linear_svc_preprocessor',
      'Nystroem Sampler': 'nystroem_sampler',
      'Select Percentile': 'select_percentile_regression',
      'Select Rates': 'select_rates',
    }
  }
  return obj[pt]
}

export default Project
