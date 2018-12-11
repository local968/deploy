import { observable, action, computed, toJS, autorun } from "mobx";
import socketStore from "./SocketStore";
import Model from "./Model";
import moment from 'moment';
import config from 'config';
import uuid from 'uuid';
import Papa from 'papaparse';
import { message as antdMessage } from 'antd';

export default class Project {
  @observable models = []
  @observable trainModel = null

  @observable id = "";
  @observable exist = true;
  @observable loading = false;
  @observable host = '';

  //step
  @observable mainStep = 0;
  @observable curStep = 0;
  @observable lastSubStep = 1;
  @observable subStepActive = 1;

  //project
  @observable name;
  // @observable description;

  //problem
  @observable problemType = '';
  @observable statement = '';
  @observable business = '';
  @observable changeProjectType = '';

  //etl
  @observable etling = false;
  @observable etlProgress = 0

  // upload data
  @observable dataHeader = [];
  @observable uploadData = [];
  @observable rawHeader = [];
  @observable colType = [];
  @observable totalLines = 0;
  @observable totalRawLines = 0;
  @observable firstEtl = true;
  @observable target = '';
  @observable noCompute = false;
  @observable validationRate = 20;
  @observable holdoutRate = 20;
  @observable uploadFileName = [];
  @observable fileNames = [];
  @observable cleanData = []
  @observable originPath = '';
  @observable cleanPath = ''

  @observable noComputeTemp = false;

  //data quality
  @observable mismatchFillMethod = {}
  @observable mismatchIndex = {}
  @observable nullFillMethod = {}
  @observable nullIndex = {}
  @observable outlierFillMethod = {}
  @observable outlierIndex = {}
  @observable outlierDict = {}
  @observable targetMap = {};
  @observable targetArray = []
  @observable rawDataViews = null;
  @observable preImportance = null;
  @observable histgramPlots = {};
  @observable univariatePlots = {};
  @observable correlationMatrixImg = '';
  @observable newVariable = [];
  @observable expression = {}
  @observable newType = {}
  @observable informativesLabel = []
  @observable colValueCounts = {}
  @observable totalFixedLines = 0
  @observable nullLineCounts = {}
  @observable mismatchLineCounts = {}
  @observable outlierLineCounts = {}
  @observable renameVariable = {}

  //not save
  @observable targetMapTemp = {};
  @observable targetArrayTemp = [];

  // train
  // 训练状态
  @observable train2Finished = false;
  @observable train2ing = false;
  @observable train2Error = false;

  @observable trainingId = ''
  // 不需要参加训练的label
  @observable trainHeader = []
  // 暂时移除
  @observable criteria = 'defualt';
  @observable costOption = { TP: 0, FP: 0, FN: 0, TN: 0 }

  // Advanced Modeling Setting
  @observable settingId = '';
  @observable settings = []

  // correlation
  @observable correlationMatrixHeader;
  @observable correlationMatrixData;

  // 训练速度和过拟合
  @observable speedVSaccuracy = 5;

  @observable ensembleSize = 20;
  @observable randSeed = 0;
  @observable measurement = '';
  @observable resampling = "no";
  @observable runWith = 'holdout';
  @observable crossCount = 5;
  @observable dataRange = 'all';
  @observable customField = '';
  @observable customRange = [];
  @observable algorithms = [];
  @observable selectId = '';
  @observable version = [1, 2]
  @observable dataViews = null;

  @observable stopModel = false

  constructor(id, args) {
    this.id = id
    this.setProperty(args)

    autorun(async () => {
      if (!this.uploadFileName || this.uploadFileName.length === 0) return
      const api = await socketStore.ready()
      const fileNames = (await api.getFiles({ files: this.uploadFileName.toJS() })).fileNames
      this.fileNames = fileNames
      return
    })
    autorun(() => {
      if (!this.originPath) return this.uploadData = []
      this.readData(this.originPath).then(data => {
        this.uploadData = data.filter(r => r.length === this.rawHeader.length)
      })
    })
    // autorun(() => {
    //   if (!this.cleanPath) return this.cleanData = []
    //   this.readData(this.cleanPath).then(data => {
    //     this.cleanData = data
    //   })
    // })
  }

  readData = path => {
    const url = `http://${config.host}:${config.port}/redirect/download/${path}?projectId=${this.id}`
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        delimiter: ',',
        complete: result => {
          if (result.errors.length !== 0) {
            console.error('parse error: ', result.errors[0].message);
            return;
          }
          return resolve(result.data.slice(1))
          // this.newFileInit(result.data);
        }
      });
      return
    })
  }

  @computed
  get defaultUploadFile() {
    this.noComputeTemp = false
    this.uploadData = []

    return {
      uploadFileName: [],
      dataHeader: [],
      rawHeader: [],
      colType: [],
      totalLines: 0,
      totalRawLines: 0,
      firstEtl: true,
      target: '',
      noCompute: false,
      rawDataViews: null,
    }
  }

  @computed
  get defaultDataQuality() {
    this.targetMapTemp = {};
    this.targetArrayTemp = []

    return {
      mismatchFillMethod: {},
      mismatchIndex: {},
      nullFillMethod: {},
      nullIndex: {},
      outlierFillMethod: {},
      outlierIndex: {},
      dataViews: null,
      outlierDict: {},
      targetMap: {},
      targetArray: [],
      totalFixedLines: 0,
      nullLineCounts: {},
      mismatchLineCounts: {},
      outlierLineCounts: {},
      renameVariable: {}
    }
  }

  @computed
  get defaultTrain() {
    const measurement = this.problemType === "Classification" ? "auc" : "r2"
    this.models = []

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
      runWith: 'holdout',
      crossCount: 5,
      dataRange: 'all',
      customField: '',
      customRange: [],
      algorithms: [],
      measurement,
      selectId: '',
      version: [1, 2],
      trainHeader: [],
      newVariable: [],
      newType: {},
      expression: {},
      validationRate: 20,
      holdoutRate: 20,
    }
  }

  @computed
  get settingName() {
    if (this.currentSetting) return this.currentSetting.name
    return ''
  }

  @computed
  get currentSetting() {
    return this.settings.find(s => s.id === this.settingId)
  }

  @computed
  get sortHeader() {
    const { target, rawHeader } = this
    if (!target) return rawHeader
    return [target, ...rawHeader.filter(v => target !== v)]
  }

  @computed
  get sortData() {
    const { target, rawHeader, uploadData } = this
    if (!target) return uploadData
    const index = rawHeader.indexOf(target)
    return uploadData.map(row => {
      const value = row[index]
      return [value, ...row.slice(0, index), ...row.slice(index + 1)]
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
  nextMainStep = (routeIndex) => {
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
  nextSubStep = (subStepIndex, routeIndex) => {
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
  }

  @action
  updateProject = data => {
    this.loading = true;
    data.id = this.id

    return socketStore.ready().then(api => {
      return api.updateProject(data).then(result => {
        const { status, message } = result
        this.loading = false;
        if (status !== 200) {
          return alert(message)
        }
        this.setProperty(data)
      })
    })
  }

  @action
  queryProject = () => {
    this.loading = true;
    return socketStore.ready().then(api => {
      return api.queryProject({ id: this.id }).then(result => {
        this.loading = false;
        if (result.status === 200) {
          this.setProperty(result.data)
          return
        }
        alert(result.message)
      })
    })
  }

  @action
  setProperty = (data) => {
    if (typeof data !== 'object') {
      return false;
    }
    if (Array.isArray(data)) {
      return false;
    }
    delete data.userId;
    delete data.id;
    for (let key in data) {
      if (typeof data[key] === 'function') {
        delete data[key];
        continue;
      }
      if (key === 'problemType') {
        data.changeProjectType = data[key]
      }

      if (key === 'targetMap') {
        data.targetMapTemp = data[key];
      }

      if (key === 'targetArray') {
        data.targetArrayTemp = data[key];
      }
    }
    Object.assign(this, data)
  }

  /**---------------------------------------------problem-------------------------------------------------*/
  @action
  saveProblem = () => {
    const updObj = {
      statement: this.statement,
      business: this.business,
      problemType: this.changeProjectType
    };
    updObj.measurement = this.changeProjectType === "Classification" ? "auc" : "r2"
    if (this.problemType && this.changeProjectType !== this.problemType) {
      //全部恢复到problem步骤
      const backData = Object.assign({}, updObj, this.defaultUploadFile, this.defaultDataQuality, this.defaultTrain, {
        mainStep: 2,
        curStep: 2,
        lastSubStep: 1,
        subStepActive: 1
      })
      this.etling = false;
      this.etlProgress = 0

      this.updateProject(backData);
    } else {
      this.updateProject(Object.assign({}, updObj, this.nextMainStep(2)));
    }
  }

  /**---------------------------------------------data-------------------------------------------------*/
  //修改上传文件
  @action
  fastTrackInit = (name) => {
    const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTrain, { uploadFileName: [name] }, {
      mainStep: 2,
      curStep: 2,
      lastSubStep: 1,
      subStepActive: 1
    })
    this.etling = false;
    this.etlProgress = 0
    this.updateProject(backData).then(() => this.etl())
  }

  //读取预览文件
  // @action
  // newFileInit = (uploadData) => {
  //   const rawHeader = uploadData[0].map((h) => h.trim());
  //   const data = uploadData.slice(1);

  //   // 上传文件，不需要修改header
  //   this.updateProject({
  //     uploadData: data,
  //     dataHeader: rawHeader,
  //     rawHeader: rawHeader
  //   });

  /**
   * 自动修改header
   */
  // const temp = {};
  // const header = rawHeader.map((h, i) => {
  //   h = h.trim();
  //   if (/^$/.test(h)) {
  //     h = `Unnamed: ${i}`;
  //   }
  //   if (!temp[h]) {
  //     temp[h] = 1;
  //   } else {
  //     h = h + '.' + temp[h];
  //     temp[h]++;
  //   }
  //   return h;
  // });

  // // 上传文件，target为空
  // this.updateProject({
  //   uploadData: data,
  //   dataHeader: header,
  //   rawHeader: header,
  // });
  // }

  @action
  autoFixHeader = () => {
    /**
   * 自动修改header
   */
    const temp = {};
    const header = this.rawHeader.map((h, i) => {
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
      dataHeader: header,
      rawHeader: header,
    });
  }

  @computed
  get headerTemp() {
    //查看是否存在相同名称的header
    let temp = {};
    let isMissed = false;
    let isDuplicated = false;
    this.rawHeader.forEach((h, i) => {
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

  @computed
  get issues() {
    const data = {
      rowIssue: false,
      dataIssue: false,
      targetIssue: false,
      targetRowIssue: false
    }
    const { problemType, totalRawLines, targetColMap, issueRows, targetIssues } = this;

    if (problemType === "Classification") {
      data.targetIssue = this.targetArray.length < 2 && Object.keys(targetColMap).length > 2;
    }

    if (totalRawLines < 1000) {
      data.rowIssue = true;
    }

    if (targetIssues.errorRow.length) {
      data.targetRowIssue = true
    }

    if (issueRows.errorRow.length) {
      data.dataIssue = true
    }

    return data
  }

  @computed
  get variableIssues() {
    const { dataHeader, nullLineCounts, mismatchLineCounts, outlierLineCounts, colType, totalRawLines } = this;
    const obj = {
      mismatchRow: {},
      nullRow: {},
      outlierRow: {}
    }

    dataHeader.forEach(h => {
      if (colType[h] !== "Categorical" && mismatchLineCounts[h]) {
        obj.mismatchRow = Object.assign(obj.mismatchRow, { [h]: (mismatchLineCounts[h] || 0) / (totalRawLines || 1) * 100 })
      }
      if (nullLineCounts[h]) {
        obj.nullRow = Object.assign(obj.nullRow, { [h]: (nullLineCounts[h] || 0) / (totalRawLines || 1) * 100 })
      }
      if (colType[h] !== "Categorical" && outlierLineCounts[h]) {
        obj.outlierRow = Object.assign(obj.outlierRow, { [h]: (outlierLineCounts[h] || 0) / (totalRawLines || 1) * 100 })
      }
    })
    return obj
  }

  @computed
  get targetColMap() {
    const { colValueCounts, target } = this
    let n = 0
    const array = Object.entries(colValueCounts[target] || {}).sort((a, b) => b[1] - a[1]) || []
    const map = array.reduce((start, [k]) => {
      return Object.assign(start, { [k]: n++ })
    }, {})
    return map
  }

  parseChartData(result, model) {
    if (!result) return { chart: null, fitIndex: null };
    let fitIndex;
    let initialFitIndex;
    const charts = ['density', 'lift', 'roc'];
    charts.forEach(chart => {
      result[chart] = this.parseJson(result[chart])
    });
    if (result.roc) {
      const { TP, FN, FP, TN } = this.costOption
      initialFitIndex = this.indexOfMax(result.roc);
      fitIndex = initialFitIndex
      if (!!TP || !!FN || !!FP || !!TN) {
        const benefit = model.getBenefit(TP, FN, FP, TN, result)
        fitIndex = benefit.index
      }
      this.roundN(result.roc);
    }
    return { chart: result, fitIndex, initialFitIndex };
  }

  indexOfMax(arr) {
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

  @computed
  get targetIssues() {
    const { target, mismatchIndex, nullIndex, outlierIndex, colType } = this;
    const arr = {
      mismatchRow: colType[target] !== "Categorical" ? mismatchIndex[target] : [],
      nullRow: nullIndex[target] || [],
      outlierRow: colType[target] !== "Categorical" ? (outlierIndex[target] || []) : [],
    }

    arr.errorRow = Array.from(new Set([...arr.mismatchRow, ...arr.nullRow, ...arr.outlierRow]))
    return arr
  }

  @computed
  get issueRows() {
    const { dataHeader, mismatchIndex, nullIndex, outlierIndex, colType, target } = this;
    const arr = {
      mismatchRow: [],
      nullRow: [],
      outlierRow: [],
      errorRow: []
    }

    dataHeader.forEach(h => {
      if (h === target) return;
      if (colType[h] !== "Categorical" && mismatchIndex[h] && !!mismatchIndex[h].length) {
        arr.mismatchRow = Array.from(new Set(arr.mismatchRow.concat([...mismatchIndex[h]])));
        arr.errorRow = Array.from(new Set(arr.errorRow.concat([...mismatchIndex[h]])));
      }
      if (nullIndex[h] && !!nullIndex[h].length) {
        arr.nullRow = Array.from(new Set(arr.nullRow.concat([...nullIndex[h]])));
        arr.errorRow = Array.from(new Set(arr.errorRow.concat([...nullIndex[h]])));
      }
      if (colType[h] !== "Categorical" && outlierIndex[h] && !!outlierIndex[h].length) {
        arr.outlierRow = Array.from(new Set(arr.outlierRow.concat([...outlierIndex[h]])));
        arr.errorRow = Array.from(new Set(arr.errorRow.concat([...outlierIndex[h]])));
      }
    })
    return arr
  }

  etl = () => {
    const { id, problemType, dataHeader, uploadFileName, rawHeader } = this;

    const command = 'etl';

    const data = {
      projectId: id,
      time: moment().valueOf(),
      command
    }

    if (this.colType && Object.keys(this.colType).length) {
      data.colType = { ...this.colType };
    }

    if (this.target) {
      data.targetLabel = this.target;
      data.problemType = problemType;
    }

    if (dataHeader.length !== rawHeader.length) {
      data.featureLabel = toJS(dataHeader)
    }

    if (this.mismatchFillMethod && Object.keys(this.mismatchFillMethod).length) {
      data.mismatchFillMethod = toJS(this.mismatchFillMethod);
    }

    if (this.nullFillMethod && Object.keys(this.nullFillMethod).length) {
      data.nullFillMethod = toJS(this.nullFillMethod);
    }

    if (this.outlierFillMethod && Object.keys(this.outlierFillMethod).length) {
      data.outlierFillMethod = toJS(this.outlierFillMethod);
    }

    if (this.targetArray && this.targetArray.length) {
      data.targetMap = toJS(this.targetMap);
    }

    if (this.outlierDict && Object.keys(this.outlierDict).length) {
      data.outlierDict = toJS(this.outlierDict);
    }

    if (this.noCompute) {
      data.noCompute = true;
    }

    if (this.firstEtl) {
      data.firstEtl = true;
    }

    if (this.firstEtl) {
      data.csvLocation = [...uploadFileName]
    }
    this.etling = true;
    // id: request ID
    // projectId: project ID
    // csv_location: csv 文件相对路径
    // problem_type: 预测类型 Classification , Regression
    // feature_label: 特征列名
    // fill_method:  无效值
    // kwargs:
    return socketStore.ready()
      .then(api => api.etl(data, progressResult => {
        let { result } = progressResult;
        if (!this.etling) return;
        const { name, value, key } = result
        if (name === "progress" && key === 'etl') {
          this.etlProgress = value
        }
      }))
      .then(returnValue => {
        const { result, status } = returnValue;
        if (status !== 200) return antdMessage.error(result['process error'])
        this.setProperty(result)
        this.etling = false;
        this.etlProgress = 0
      })
  }

  next = () => {
    const { curStep, subStepActive, noCompute } = this;
    if (curStep === 2 && subStepActive < 3) {
      if (noCompute && subStepActive !== 1) {
        return this.nextMainStep(3)
      }
      const nextStep = subStepActive + 1;
      return this.nextSubStep(nextStep, curStep)
    } else {
      return {}
    }
  }

  @action
  dataView = (isClean = true, progress) => {
    const key = isClean ? 'dataViews' : 'rawDataViews'
    // const featureLabel = [...this.dataHeader, ...this.newVariable].filter(v => !Object.keys(this[key]).includes(v))
    // if(!featureLabel.length) return Promise.resolve()
    return socketStore.ready().then(api => {
      // const command = {
      //   projectId: this.id,
      //   command: 'dataView',
      //   actionType: isClean ? 'clean' : 'raw',
      //   feature_label
      // };

      const readyLabels = this[key] ? Object.keys(this[key]) : []
      const data_label = this.dataHeader.filter(v => !readyLabels.includes(v))
      const new_label = this.newVariable.filter(v => !readyLabels.includes(v))
      const feature_label = [...data_label, ...new_label]
      if (!feature_label.length || feature_label.length === 0) return Promise.resolve()
      const command = {
        projectId: this.id,
        command: 'dataView',
        actionType: isClean ? 'clean' : 'raw',
        feature_label
      };
      if (new_label.length) {
        const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
        command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      }
      return api.dataView(command, progressResult => {
        if (progress && typeof progress === 'function') {
          const { result } = progressResult
          const { name, value } = result
          if (name === "progress") return progress(value)
        }
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          this.setProperty({ [key]: null })
          return antdMessage.error("dataview error")
        }
        this.setProperty({ [key]: result.data })
      })
    })
  }

  @action
  fixTarget = () => {
    this.updateProject({ targetMap: this.targetMapTemp, targetArray: this.targetArrayTemp, renameVariable: this.renameVariable })
  }

  @action
  fixFillMethod = () => {
    this.updateProject({
      outlierDict: toJS(this.outlierDict),
      nullFillMethod: toJS(this.nullFillMethod),
      mismatchFillMethod: toJS(this.mismatchFillMethod),
      outlierFillMethod: toJS(this.outlierFillMethod)
    })
  }

  @action
  addNewVariable = (variableName, variables, exp, type) => {
    const fullExp = `${variables.map(v => "@" + v).join(",")}=${exp}`

    return socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'createNewVariable',
        csvScript: fullExp.replace(/\|/g, ",")
      };
      return api.createNewVariable(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          antdMessage.error(result.msg)
          return false
        }
        const newVariable = [...this.newVariable, ...variables]
        const trainHeader = [...this.trainHeader, ...variables]
        const newType = Object.assign({}, this.newType, variables.reduce((start, v) => {
          start[v] = type
          return start
        }, {}))
        const expression = Object.assign({}, this.expression, { [variableName]: fullExp })
        this.updateProject({
          newVariable,
          trainHeader,
          expression,
          newType
        })
        return true
      })
    })
  }
  /**---------------------------------------------train------------------------------------------------*/
  @computed
  get selectModel() {
    const { selectId, costOption, criteria } = this
    if (selectId) {
      const model = this.models.find(m => m.id === selectId)
      if (model) return model
    }
    let model;
    const { TP, FN, FP, TN } = criteria === 'cost' ? costOption : { TP: 0, FN: 0, FP: 0, TN: 0 }
    for (let m of this.models) {
      if (!model) {
        model = m;
        continue;
      }
      if (model.getScore(TP, FN, FP, TN) < m.getScore(TP, FN, FP, TN)) {
        model = m;
      }
    }
    return model
  }

  @action
  fastTrain = () => {
    if (this.train2ing) return antdMessage.error("Your project is already training, please stop it first.")
    const {
      id,
      problemType,
      target,
      dataHeader
    } = this;
    const command = 'train';

    const featureLabel = dataHeader.filter(d => d !== target);

    // id: request ID
    // projectId: project ID
    // csv_location: csv 文件相对路径
    // problem_type: 预测类型 Classification , Regression
    // feature_label: 特征列名
    // target_label:  目标列
    // fill_method:  无效值
    // model_option: model的额外参数，不同model参数不同
    // kwargs:
    const trainData = {
      problemType,
      featureLabel,
      targetLabel: target,
      projectId: id,
      version: '1,2',
      command,
      sampling: 'no',
      speedVSaccuracy: 5,
      ensembleSize: 20,
      randSeed: 0,
      measurement: problemType === "Classification" ? "auc" : "r2",
      settingId: this.settingId,
      holdoutRate: 0.2
    };

    if (this.totalRawLines > 10000) {
      trainData.validationRate = 0.2
    } else {
      trainData.nfold = 5
    }

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
      trainHeader,
      dataHeader,
      expression,
      newVariable
    } = this;
    const command = 'train';

    const featureLabel = dataHeader.filter(v => !trainHeader.includes(v) && v !== target)
    const newVariableLabel = newVariable.filter(v => !trainHeader.includes(v))

    const trainData = {
      problemType,
      featureLabel: [...featureLabel, ...newVariableLabel],
      targetLabel: target,
      projectId: id,
      command,
      sampling: this.resampling,
      // maxTime: this.maxTime,
      randSeed: this.randSeed,
      speedVSaccuracy: this.speedVSaccuracy,
      version: this.version.join(","),
      algorithms: [...this.algorithms],
      ensembleSize: this.ensembleSize,
      settingId: this.settingId,
      measurement: this.measurement
    };

    if (this.dataRange === "all") {
      trainData.holdoutRate = this.holdoutRate / 100
      if (this.runWith === "holdout") {
        trainData.validationRate = this.validationRate / 100
      } else {
        trainData.nfold = this.crossCount
      }
    } else {
      trainData.splitBy = [this.customField, ...this.customRange]
    }
    if (newVariableLabel.length) {
      const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
      trainData.csvScript = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
    }

    const { version, validationRate, holdoutRate, randSeed, measurement, runWith, resampling, crossCount, dataRange, customField, customRange, algorithms, speedVSaccuracy } = this;
    const setting = { version, validationRate, holdoutRate, randSeed, measurement, runWith, resampling, crossCount, dataRange, customField, customRange, algorithms, speedVSaccuracy }
    this.settings.find(s => s.id === this.settingId).setting = setting

    this.modeling(trainData, Object.assign({
      train2Finished: false,
      train2ing: true,
      train2Error: false,
      selectId: '',
      validationRate: this.validationRate,
      holdoutRate: this.holdoutRate,
      resampling: this.resampling,
      // maxTime: this.maxTime,
      measurement: this.measurement,
      randSeed: this.randSeed,
      dataRange: this.dataRange,
      customField: this.customField,
      customRange: [...this.customRange],
      algorithms: [...this.algorithms],
      speedVSaccuracy: this.speedVSaccuracy,
      ensembleSize: this.ensembleSize,
      runWith: this.runWith,
      crossCount: this.crossCount,
      version: this.version,
      trainHeader: this.trainHeader,
      settings: this.settings,
      settingId: this.settingId
    }, this.nextSubStep(2, 3)))
  }

  newSetting = (type = 'auto') => {
    const { version, validationRate, holdoutRate, randSeed, measurement, runWith, resampling, crossCount, dataRange, customField, customRange, algorithms, speedVSaccuracy, ensembleSize } = this;
    const setting = { version, validationRate, holdoutRate, randSeed, measurement, runWith, resampling, crossCount, dataRange, customField, customRange, algorithms, speedVSaccuracy, ensembleSize }
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

  modeling = (trainData, updateData) => {
    this.train2ing = true
    this.isAbort = false
    socketStore.ready().then(api => api.train({ ...trainData, data: updateData }, progressResult => {
      // if (this.isAbort) return
      // if (progressResult.name === "progress") {
      //   if (progressResult.trainId) this.trainingId = progressResult.trainId
      //   if (!progressResult.model) return
      //   if (!progressResult.value) return
      //   if(this.trainModel && this.trainModel.value && progressResult.value > this.trainModel.value)
      //   this.trainModel = progressResult
      //   return
      // }
      // if (progressResult.status !== 200) return
      //暂时移除  保证命令只发一次
      // let result = progressResult.model
      // this.setModel(result)
    })).then(returnValue => {
      this.trainingId = ''
      const { status, message } = returnValue
      if (status !== 200) {
        antdMessage.error(message)
      }
    })
  }

  abortTrain = (isLoading = false) => {
    if (this.stopModel) return
    this.stopModel = true
    const command = {
      command: 'stop',
      action: 'train',
      projectId: this.id,
      isLoading
    }
    this.isAbort = true
    socketStore.ready().then(api => api.abortTrain(command).then(returnValue => {
      const { status, message, result, id } = returnValue
      if (id !== this.id) return
      if (status !== 200) return antdMessage.error(message)
      this.setProperty({ ...result, stopModel: false })
    }))
  }

  setModel = data => {
    if (this.mainStep !== 3 || this.lastSubStep !== 2) return
    if (this.isAbort) return
    if (this.trainModel && data.name === this.trainModel.name) this.trainModel = null
    this.models = [...this.models.filter(m => data.id !== m.id), new Model(this.id, data)]
    if (this.problemType === 'Classification') {
      if (!data.chartData) this.chartData(data.name);
    } else {
      if (!data.residualPlot || !data.fitPlot) this.fitPlotAndResidualPlot(data.name)
      if (!data.qcut) this.pointToShow(data.name)
    }
  }

  setSelectModel = id => {
    this.updateProject({ selectId: id })
  }

  initModels = () => {
    socketStore.ready().then(api => api.queryModelList({ id: this.id })).then(result => {
      const { status, message, list } = result
      if (status !== 200) return alert(message)
      this.models = []
      list.forEach(m => {
        this.setModel(m)
      });
    })
  }

  preTrainImportance = (progress) => {
    return socketStore.ready().then(api => {
      const readyLabels = this.preImportance ? Object.keys(this.preImportance) : []
      const data_label = this.dataHeader.filter(v => !readyLabels.includes(v) && v !== this.target)
      const new_label = this.newVariable.filter(v => !readyLabels.includes(v) && v !== this.target)
      const feature_label = [...data_label, ...new_label]
      if (!feature_label.length || feature_label.length === 0) return Promise.resolve()
      const command = {
        projectId: this.id,
        command: 'preTrainImportance',
        feature_label
      };
      if (new_label.length) {
        const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
        command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      }
      return api.preTrainImportance(command, progressResult => {
        if (progress && typeof progress === 'function') {
          const { result } = progressResult
          const { name, value } = result
          if (name === "progress") return progress(value)
        }
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          return antdMessage.error("preTrainImportance error")
        }
        this.setProperty({ preImportance: result.preImportance, informativesLabel: result.informativesLabel })
      })
    })
  }

  /**------------------------------------------------chart---------------------------------------------------------*/
  correlationMatrix = () => {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'correlationMatrix',
        featureLabel: this.dataHeader.filter(n => n !== this.target)
      };
      api.correlationMatrix(command).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) return alert("correlationMatrix error")
        this.correlationMatrixHeader = result.header;
        this.correlationMatrixData = result.data;
      })
    })
  }

  univariatePlot = field => {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'univariatePlot',
      };
      if (field) {
        if (this.newVariable.includes(field)) {
          command.feature_label = [...this.newVariable]
        } else {
          command.feature_label = [field]
        }
      }
      api.univariatePlot(command, progressResult => {
        const { result } = progressResult
        const { field: plotKey, imageSavePath, progress } = result;
        if (progress && progress === "start") return
        const univariatePlots = Object.assign({}, this.univariatePlots);
        univariatePlots[plotKey] = imageSavePath
        this.setProperty({ univariatePlots })
      }).then(this.handleError)
    })
  }

  histgramPlot = field => {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'histgramPlot',
      };
      if (field) {
        if (this.newVariable.includes(field)) {
          command.feature_label = [...this.newVariable]
        } else {
          command.feature_label = [field]
        }
      }
      api.histgramPlot(command, progressResult => {
        const { result } = progressResult
        const { field: plotKey, imageSavePath, progress } = result;
        if (progress && progress === "start") return
        const histgramPlots = Object.assign({}, this.histgramPlots);
        histgramPlots[plotKey] = imageSavePath
        this.setProperty({ histgramPlots })
      }).then(this.handleError)
    })
  }

  pointToShow = name => {
    if (this.models.length === 0) {
      return;
    }
    let version
    if (name) {
      const model = this.models.find(m => m.name === name)
      if (model && model.qcut) return
      version = name
    } else {
      const all = name || this.models.map(m => {
        if (m.qcut) return ''
        return m.name
      }).filter(n => !!n).toString()
      if (!all) return
      version = all
    }
    socketStore.ready().then(api => {
      const request = {
        version: version,
        projectId: this.id,
        command: 'pointToShow'
      }
      api.pointToShow(request, points => {
        const name = points.result.model;
        if (name === "progress") return;
        const model = this.models.find(m => {
          return name === m.name
        })
        if (model) {
          model.updateModel({
            qcut: points.result.data
          });
        }
      }).then(this.handleError)
    })
  }

  chartData = name => {
    if (this.models.length === 0) {
      return;
    }
    let version
    if (name) {
      const model = this.models.find(m => m.name === name)
      if (model && model.chartData) return
      version = name
    } else {
      const all = name || this.models.map(m => {
        if (m.chartData) return ''
        return m.name
      }).filter(n => !!n).toString()
      if (!all) return
      version = all
    }
    socketStore.ready().then(api => {
      const request = {
        action: 'all',
        version: version,
        command: 'chartData',
        // csvLocation: [...this.uploadFileName],
        projectId: this.id
      };
      api.chartData(request, chartResult => {
        const { result } = chartResult;
        if (result.progress === 'start') return;
        const model = this.models.find(m => {
          return result.model === m.name;
        })
        if (model) {
          const { fitIndex, chart, initialFitIndex } = this.parseChartData(result.data, model);
          model.updateModel({
            fitIndex,
            initialFitIndex,
            chartData: chart
          })
        }
      }).then(this.handleError)
    })
  }

  fitPlotAndResidualPlot = name => {
    if (this.models.length === 0) {
      return;
    }
    let version
    if (name) {
      const model = this.models.find(m => m.name === name)
      if (model && model.residualPlot && model.fitPlot) return
      version = name
    } else {
      const all = name || this.models.map(m => {
        if (m.residualPlot && m.fitPlot) return ''
        return m.name
      }).filter(n => !!n).toString()
      if (!all) return
      version = all
    }
    socketStore.ready().then(api => {
      const request = {
        projectId: this.id,
        version: version,
        command: 'fitPlotAndResidualPlot',
        featureLabel: this.dataHeader.filter(n => n !== this.target)
      }
      api.fitPlotAndResidualPlot(request, chartResult => {
        const { result } = chartResult;
        if (result.progress === 'start') return;
        const model = this.models.find(m => {
          return result.model === m.name;
        })
        if (model) {
          model.updateModel({
            [result.action]: `http://${config.host}:${config.port}/redirect/download/${result.imageSavePath}?projectId=${this.id}`
          });
        }
      }).then(this.handleError)
    })
  }

  handleError = returnValue => {
    const { result, status, command } = returnValue
    if (status < 0) antdMessage.error(`command:${command}, error:${result['process error']}`)
  }
}
