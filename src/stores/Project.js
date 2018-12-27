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
  @observable autorun = []

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
  @observable createTime
  @observable updateTime
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
  @observable cleanHeader = []
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
  @observable rawDataViewsLoading = false
  @observable preImportance = null;
  @observable preImportanceLoading = false;
  @observable histgramPlots = {};
  @observable univariatePlots = {};
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
  @observable missingReason = {}


  @observable targetMapTemp = {};
  @observable targetArrayTemp = [];
  @observable missingReasonTemp = {}
  @observable mismatchFillMethodTemp = {}
  @observable nullFillMethodTemp = {}
  @observable outlierFillMethodTemp = {}
  @observable outlierDictTemp = {}

  // train
  // 训练状态
  @observable train2Finished = false;
  @observable train2ing = false;
  @observable train2Error = false;

  @observable trainingId = ''
  // 不需要参加训练的label
  @observable trainHeader = []
  @observable customHeader = []
  @observable criteria = 'defualt';
  @observable costOption = { TP: 0, FP: 0, FN: 0, TN: 0 }

  // Advanced Modeling Setting
  @observable settingId = '';
  @observable settings = []

  // correlation
  @observable correlationMatrixHeader;
  @observable correlationMatrixData;
  @observable correlationMatrixLoading = false

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
  @observable dataViewsLoading = false

  @observable stopModel = false
  @observable stopEtl = false

  constructor(id, args) {
    this.id = id
    this.setProperty(args)
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
          return resolve(result.data)
          // this.newFileInit(result.data);
        }
      });
      return
    })
  }

  @computed
  get defaultUploadFile() {
    this.noComputeTemp = false

    return {
      cleanHeader: [],
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
      rawDataViewsLoading: false
    }
  }

  @computed
  get defaultDataQuality() {
    return {
      mismatchFillMethod: {},
      mismatchIndex: {},
      nullFillMethod: {},
      nullIndex: {},
      outlierFillMethod: {},
      outlierIndex: {},
      dataViews: null,
      dataViewsLoading: false,
      outlierDict: {},
      targetMap: {},
      targetArray: [],
      totalFixedLines: 0,
      nullLineCounts: {},
      mismatchLineCounts: {},
      outlierLineCounts: {},
      renameVariable: {},
      missingReason: {},
      targetMapTemp: {},
      targetArrayTemp: [],
      mismatchFillMethodTemp: {},
      nullFillMethodTemp: {},
      outlierFillMethodTemp: {},
      outlierDictTemp: {},
      preImportanceLoading: false
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
      runWith: (this.totalLines > 0 && this.totalLines < 10000) ? 'cross' : 'holdout',
      crossCount: 5,
      dataRange: 'all',
      customField: '',
      customRange: [],
      algorithms: [],
      measurement,
      selectId: '',
      version: [1, 2],
      trainHeader: [],
      customHeader: [],
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
    if (!uploadData.length) return []
    if (!target) return uploadData
    const index = rawHeader.indexOf(target)
    return uploadData.filter(r => r.length === rawHeader.length).map(row => {
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
  initProject = () => {
    this.autorun.push(autorun(async () => {
      if (this.uploadFileName && this.uploadFileName.length > 0) {
        const api = await socketStore.ready()
        const fileNames = (await api.getFiles({ files: this.uploadFileName.toJS() })).fileNames
        this.fileNames = fileNames
      }
    }))
    this.autorun.push(autorun(async () => {
      if (!this.originPath) {
        this.uploadData = []
      } else {
        this.readData(this.originPath).then(data => {
          this.uploadData = data.slice(1)
        })
      }
    }))
    this.autorun.push(autorun(async () => {
      if (!this.cleanPath) {
        this.cleanData = []
      } else {
        this.readData(this.cleanPath).then(data => {
          this.cleanData = data
        })
      }
    }))
  }

  @action
  clean = () => {
    this.autorun.forEach(f => f())
    this.uploadData = []
    this.cleanData = []
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
    }
    data.updateTime = +new Date()
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
  fastTrackInit = (name) => {
    const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTrain, { uploadFileName: [name] }, {
      mainStep: 2,
      curStep: 2,
      lastSubStep: 1,
      subStepActive: 1
    })
    return this.updateProject(backData).then(() => this.etl())
  }

  @action
  autoFixHeader = () => {
    //   /**
    //  * 自动修改header
    //  */
    //   const temp = {};
    //   const header = this.rawHeader.map((h, i) => {
    //     h = h.trim();
    //     if (/^$/.test(h)) {
    //       h = `Unnamed: ${i}`;
    //     }
    //     if (!temp[h]) {
    //       temp[h] = 1;
    //     } else {
    //       h = h + '.' + temp[h];
    //       temp[h]++;
    //     }
    //     return h;
    //   });

    // 上传文件，target为空
    return this.updateProject({
      rawHeader: this.cleanHeader,
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

  @action
  endSchema = () => {
    this.etling = true
    return this.updateProject(Object.assign(this.defaultDataQuality, this.defaultTrain, {
      target: this.target,
      colType: { ...this.colType },
      dataHeader: [...this.dataHeader],
      noCompute: this.noComputeTemp,
      outlierFillMethod: this.outlierFillMethod,
      outlierFillMethodTemp: this.outlierFillMethodTemp
    }))
      .then(() => this.etl())
  }

  @action
  endQuality = () => {
    let hasChange = false
    const list = ['targetMap', 'outlierDict', 'nullFillMethod', 'mismatchFillMethod', 'outlierFillMethod']
    for (const item of list) {
      const before = this[item]
      const after = this[item + "Temp"]
      hasChange = this.hasChanged(before, after)
      if (hasChange) break
    }

    const data = Object.assign(this.defaultTrain, {
      targetMap: toJS(this.targetMapTemp),
      targetArray: toJS(this.targetArrayTemp),
      outlierDict: toJS(this.outlierDictTemp),
      nullFillMethod: toJS(this.nullFillMethodTemp),
      mismatchFillMethod: toJS(this.mismatchFillMethodTemp),
      outlierFillMethod: toJS(this.outlierFillMethodTemp),
      missingReason: toJS(this.missingReasonTemp)
    })
    if (hasChange) this.etling = true
    return this.updateProject(data)
      .then(() => {
        if (hasChange) return this.etl()
      })
  }

  hasChanged = (before, after) => {
    if (Object.keys(before).length === Object.keys(after).length) {
      for (const key in before) {
        if (typeof before[key] === 'object') {
          const changed = this.hasChanged(before[key], after[key])
          if (changed) return changed
        } else {
          if (before[key] !== after[key]) return true
        }
      }
      return false
    }
    return true
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
      data.targetIssue = this.targetArrayTemp.length < 2 && Object.keys(targetColMap).length > 2;
    } else {
      // const uniqueValue = Math.min(1000, this.rawHeader.length * 6)
      // data.targetIssue = this.targetArrayTemp.length < 2 && Object.keys(targetColMap).length > 2;
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
    const { id, problemType, dataHeader, uploadFileName, train2ing, models } = this;

    if (train2ing) this.abortTrain(!!models.length)

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

    if (dataHeader.length) {
      data.featureLabel = dataHeader.filter(v => v !== this.target)
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
      data.targetMap = { [this.target]: toJS(this.targetMap) };
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
      .then(api => api.etl(data))
      .then(returnValue => {
        const { result, status } = returnValue;
        if (status !== 200) return antdMessage.error(result['process error'])
        this.setProperty(result)
      })
  }

  abortEtl = () => {
    if (this.stopEtl) return
    this.stopEtl = true
    const command = {
      command: 'stop',
      action: 'etl',
      projectId: this.id
    }
    this.isAbort = true
    socketStore.ready().then(api => api.abortEtl(command).then(returnValue => {
      const { status, message, result, id } = returnValue
      if (id !== this.id) return
      if (status !== 200) return antdMessage.error(message)
      this.setProperty({ ...result, stopEtl: false })
    }))
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
      // if (new_label.length) {
      //   const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
      //   command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      // }
      this[`${key}Loading`] = true
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
          return antdMessage.error(result['process error'])
        }
        this.setProperty({ [key]: result.data, [`${key}Loading`]: false })
      })
    })
  }

  @action
  fixTarget = () => {
    this.updateProject({ targetMapTemp: this.targetMapTemp, targetArrayTemp: this.targetArrayTemp })
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

  @action
  addNewVariable = (variableName, variables, exp, type) => {
    const fullExp = `${variables.map(v => "@" + v).join(",")}=${exp}`
    const oldExp = Object.values(this.expression).join(";")
    const allExp = `${oldExp};${fullExp}`

    return socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'createNewVariable',
        csvScript: allExp.replace(/\|/g, ",")
      };
      return api.createNewVariable(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          antdMessage.error(result.msg)
          return false
        }
        const newVariable = [...this.newVariable, ...variables]
        // const trainHeader = [...this.trainHeader, ...variables]
        const newType = Object.assign({}, this.newType, variables.reduce((start, v) => {
          start[v] = type
          return start
        }, {}))
        const expression = Object.assign({}, this.expression, { [variableName]: fullExp })
        this.updateProject({
          newVariable,
          // trainHeader,
          expression,
          newType,
          correlationMatrixData: null,
          correlationMatrixHeader: null
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
    const setting = this.settings.find(s => s.id === this.settingId)
    if (!setting || !setting.name) return antdMessage.error("setting error")
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
      settingName: setting.name,
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
      // expression,
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
    // if (newVariableLabel.length) {
    //   const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
    //   trainData.csvScript = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
    // }

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
      settingId: this.settingId,
      customHeader: this.customHeader
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
    if (this.etling) return antdMessage.error('modeling error')
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
    const model = new Model(this.id, data)
    this.models = [...this.models.filter(m => data.id !== m.id), model]
    if (data.chartData) {
      const { TP, FP, FN, TN } = this.costOption
      const { index } = model.getBenefit(TP, FP, FN, TN)
      if (index === model.fitIndex) return
      model.updateModel({ fitIndex: index })
    }
  }

  setModelField = data => {
    const times = data.times || 0
    const model = this.models.find(m => data.id === m.id)
    if (!model) {
      if (times > 5) return
      const fn = () => this.setModelField({ data, times: times + 1 })
      return setTimeout(fn, 500)
    }
    model.setProperty(data)
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
      // if (new_label.length) {
      //   const variables = [...new Set(new_label.map(label => label.split("_")[1]))]
      //   command.csvScript = variables.map(v => this.expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")
      // }
      this.preImportanceLoading = true
      return api.preTrainImportance(command, progressResult => {
        if (progress && typeof progress === 'function') {
          const { result } = progressResult
          const { name, value } = result
          if (name === "progress") return progress(value)
        }
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          return antdMessage.error(result['process error'])
        }
        this.setProperty({ preImportance: result.preImportance, informativesLabel: result.informativesLabel, preImportanceLoading: false })
      })
    })
  }

  /**------------------------------------------------chart---------------------------------------------------------*/
  correlationMatrix = () => {
    if (this.correlationMatrixLoading) return
    this.correlationMatrixLoading = true
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'correlationMatrix',
        featureLabel: this.dataHeader.filter(n => n !== this.target)
      };
      api.correlationMatrix(command).then(returnValue => {
        const { status, result } = returnValue
        this.correlationMatrixLoading = false
        if (status < 0) return antdMessage.error(result['process error'])
        this.correlationMatrixHeader = result.header;
        this.correlationMatrixData = result.data;
      })
    })
  }

  univariatePlot = field => {
    if (!field) return
    if (this.univariatePlots.hasOwnProperty(field)) return
    this.univariatePlots[field] = ''
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'univariatePlot',
        feature_label: [field]
      };
      // if (field) {
      //   if (this.newVariable.includes(field)) {
      //     command.feature_label = [...this.newVariable]
      //   } else {
      //     command.feature_label = [field]
      //   }
      // }
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
    if (!field) return
    if (this.histgramPlots.hasOwnProperty(field)) return
    this.histgramPlots[field] = ''
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'histgramPlot',
        feature_label: [field]
      };
      // if (field) {
      //   if (this.newVariable.includes(field)) {
      //     command.feature_label = [...this.newVariable]
      //   } else {
      //     command.feature_label = [field]
      //   }
      // }
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

  handleError = returnValue => {
    const { result, status, command } = returnValue
    if (status < 0) antdMessage.error(`command:${command}, error:${result['process error']}`)
  }
}
