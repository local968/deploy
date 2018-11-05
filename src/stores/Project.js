import { observable, action, computed, toJS, when } from "mobx";
import socketStore from "./SocketStore";
import Model from "./Model";
import moment from 'moment';
import config from 'config';
import Papa from 'papaparse';
import { message as antdMessage } from 'antd';

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

export default class Project {
  @observable models = []

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
  @observable validationRate = 15;
  @observable holdoutRate = 5;
  @observable uploadFileName = [];

  //data quality
  @observable mismatchFillMethod = {}
  @observable mismatchIndex = {}
  @observable nullFillMethod = {}
  @observable nullIndexes = {}
  @observable outlierFillMethod = {}
  @observable outlierIndex = {}
  @observable outlierDict = {}
  @observable targetMap = {};
  @observable dataViews = null;
  @observable preImportance = null;
  @observable histgramPlots = {};
  @observable univariatePlots = {};
  @observable correlationMatrixImg = '';
  @observable csvScript = [];
  @observable newVariable = [];

  //not save
  @observable targetMapTemp = {};

  // train
  // 训练状态
  @observable train2Finished = false;
  @observable train2ing = false;
  @observable train2Error = false;

  // 暂时移除
  @observable criteria = 'defualt';

  // 训练速度和过拟合
  @observable speedVSaccuracy = 5;

  @observable advancedSize = 0;
  @observable maxTime = 10;
  @observable randSeed = 0;
  @observable measurement = '';
  @observable resampling = "auto";
  @observable runWith = 'holdout';
  @observable crossCount = 3;
  @observable dataRange = 'all';
  @observable customField = '';
  @observable customRange = [];
  @observable algorithms = [];

  @observable selectId = '';

  constructor(id, args) {
    this.id = id
    this.setProperty(args)
  }

  @computed
  get defaultUploadFile() {
    this.etling = false;

    return {
      uploadFileName: [],
      dataHeader: [],
      uploadData: [],
      rawHeader: [],
      colType: [],
      totalLines: 0,
      totalRawLines: 0,
      firstEtl: true,
      target: '',
      noCompute: false,
      validationRate: 15,
      holdoutRate: 5
    }
  }

  @computed
  get defaultDataQuality() {
    this.targetMapTemp = {};

    return {
      mismatchFillMethod: {},
      mismatchIndex: {},
      nullFillMethod: {},
      nullIndexes: {},
      outlierFillMethod: {},
      outlierIndex: {},
      dataViews: null,
      outlierDict: {},
      targetMap: {}
    }
  }

  @computed
  get defaultTarin() {
    const measurement = this.changeProjectType === "Classification" ? "auc" : "r2"

    return {
      train2Finished: false,
      train2ing: false,
      train2Error: false,
      criteria: 'defualt',
      speedVSaccuracy: 5,
      advancedSize: 0,
      maxTime: 10,
      randSeed: 0,
      resampling: 'auto',
      runWith: 'holdout',
      crossCount: 3,
      dataRange: 'all',
      customField: '',
      customRange: [],
      algorithms: [],
      measurement,
      selectId: ''
    }
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
        if (result.status === 200) return this.setProperty(result.data)
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
      this.models = []
      //全部恢复到problem步骤
      const backData = Object.assign({}, updObj, this.defaultUploadFile, this.defaultDataQuality, this.defaultTarin, {
        mainStep: 2,
        curStep: 2,
        lastSubStep: 1,
        subStepActive: 1
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
    const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTarin, { uploadFileName: [name] }, {
      mainStep: 2,
      curStep: 2,
      lastSubStep: 1,
      subStepActive: 1
    })
    this.updateProject(backData).then(() => this.etl())
  }

  //读取预览文件
  @action
  newFileInit = (uploadData) => {
    const rawHeader = uploadData[0].map((h) => h.trim());
    const data = uploadData.slice(1);

    const temp = {};
    const header = rawHeader.map((h, i) => {
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
    this.updateProject({
      uploadData: data,
      dataHeader: header,
      rawHeader: header,
    });
    // this.nextSubStep(2, 2);
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
      targetIssue: false
    }
    const { problemType, totalRawLines, target, colMap, issueRows, colType } = this;

    if (problemType === "Classification") {
      if (colType[target] === 'Categorical') {
        data.targetIssue = Object.keys(this.targetMap).length < 2 && Object.keys(colMap[target]).length > 2;
      } else {
        data.targetIssue = true
      }
    } else {
      if (colType[target] === 'Categorical') {
        data.targetIssue = Object.keys(colMap[target]).length < 10;
      }
    }

    if (totalRawLines < 1000) {
      data.rowIssue = true;
    }

    if (issueRows.errorRow.length) {
      data.dataIssue = true
    }

    return data
  }

  parseChartData(result) {
    if (!result) return { chart: null, fitIndex: null };
    let fitIndex;
    const charts = ['density', 'lift', 'roc'];
    charts.forEach(chart => {
      result[chart] = this.parseJson(result[chart])
    });
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

  @computed
  get issueRows() {
    const { dataHeader, mismatchIndex, nullIndexes, outlierIndex, colType } = this;
    const arr = {
      mismatchRow: [],
      nullRow: [],
      outlierRow: [],
      errorRow: []
    }

    dataHeader.forEach(h => {
      if (mismatchIndex[h] && !!mismatchIndex[h].length) {
        arr.mismatchRow = Array.from(new Set(arr.mismatchRow.concat([...mismatchIndex[h]])));
        arr.errorRow = Array.from(new Set(arr.errorRow.concat([...mismatchIndex[h]])));
      }
      if (nullIndexes[h] && !!nullIndexes[h].length) {
        arr.nullRow = Array.from(new Set(arr.nullRow.concat([...nullIndexes[h]])));
        arr.errorRow = Array.from(new Set(arr.errorRow.concat([...nullIndexes[h]])));
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

    if (this.colType.length) {
      data.colType = [...this.colType];
    }

    if (this.target) {
      data.targetLabel = this.target;
      data.problemType = problemType;
    }

    if (dataHeader.length !== rawHeader.length) {
      data.featureLabel = toJS(...dataHeader)
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

    if (this.targetMap && Object.keys(this.targetMap).length) {
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
    socketStore.ready()
      .then(api => api.etl(data, progressResult => {
        let { result } = progressResult;
        if (!this.etling) return;
        const { progress, name, path } = result
        if (progress === "start") return
        if (name === "csvHeader") {
          const url = `http://${config.host}:${config.port}/redirect/download/${path}?projectId=${this.id}`
          Papa.parse(url, {
            download: true,
            preview: 100,
            delimiter: ',',
            complete: result => {
              console.log(result)
              if (result.errors.length !== 0) {
                console.error('parse error: ', result.errors[0].message);
                return;
              }
              this.newFileInit(result.data);
            }
          });
        }
        console.log(progressResult)
        // this.project.setProperty(result)
        // this.updateProject(result)
      }))
      .then(returnValue => {
        this.etling = false;
        let { result, status, message } = returnValue;

        if (status !== 200) return antdMessage.error(message)
        this.setProperty(result)
        // when(
        //   () => !!this.uploadData.length,
        //   () => this.updateProject(this.next())
        // )
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
  dataView = () => {
    const exp = this.csvScript.join(";")
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'dataView'
      };
      if (exp) command.csvScript = exp.replace(/\|/g, ",")
      api.dataView(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          this.setProperty({ dataViews: {} })
          return antdMessage.error("dataview error")
        }
        this.setProperty({ dataViews: result.data })
      })
    })
  }

  @action
  fixTarget = () => {
    this.updateProject({ targetMap: this.targetMapTemp })
    this.etl();
  }

  @action
  fixFillMethod = () => {
    this.updateProject({
      outlierDict: toJS(this.outlierDict),
      nullFillMethod: toJS(this.nullFillMethod),
      mismatchFillMethod: toJS(this.mismatchFillMethod),
      outlierFillMethod: toJS(this.outlierFillMethod)
    })
    this.etl();
  }

  @action
  addNewVariable = (variables, exp) => {
    const fullExp = `${variables.map(v => "@" + v).join(",")}=${exp}`
    const exps = [...this.csvScript, fullExp]

    return socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'createNewVariable',
        csvScript: exps.join(";").replace(/\|/g, ",")
      };
      return api.createNewVariable(command, progressResult => {
        // console.log(progressResult)
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          antdMessage.error(result.msg)
          return false
        }
        const newVariable = [...this.newVariable, ...variables]
        this.updateProject({
          csvScript: exps,
          newVariable
        })
        return true
      })
    })
  }
  /**---------------------------------------------train------------------------------------------------*/
  @computed
  get selectModel() {
    const { problemType, selectId } = this
    if (selectId) {
      const model = this.models.find(m => m.id === selectId)
      if (model) return model
    }
    let model;
    for (let m of this.models) {
      if (!model) {
        model = m;
        continue;
      }
      if (problemType === "Classification") {
        if (model.score.validateScore.auc + model.score.validateScore.acc < m.score.validateScore.auc + m.score.validateScore.acc) {
          model = m;
        }
      } else {
        if (1 - model.score.validateScore.rmse + model.score.validateScore.r2 < 1 - m.score.validateScore.rmse + m.score.validateScore.r2) {
          model = m;
        }
      }
    }
    return model
  }

  @action
  fastTrain = () => {
    const {
      id,
      problemType,
      target,
      dataHeader,
      csvScript
    } = this;
    const command = 'train';

    this.updateProject(Object.assign({
      train2Finished: false,
      train2ing: true,
      train2Error: false,
      selectId: ''
    }, this.nextSubStep(2, 3)));

    this.models = []

    const featureLabel = dataHeader.filter(d => d !== target);

    const exps = csvScript.join(";")
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
      version: "1,2",
      command
    };

    if (exps) trainData.csvScript = exps.replace(/\|/g, ",")

    this.modeling(trainData)
  }

  advancedModeling = () => {
    const {
      id,
      problemType,
      target,
      dataHeader,
      csvScript
    } = this;
    const command = 'train';

    this.updateProject(Object.assign({
      train2Finished: false,
      train2ing: true,
      train2Error: false,
      selectId: '',
      validationRate: this.validationRate,
      holdoutRate: this.holdoutRate,
      resampling: this.resampling,
      maxTime: this.maxTime,
      measurement: this.measurement,
      randSeed: this.randSeed,
      dataRange: this.dataRange,
      customField: this.customField,
      customRange: [...this.customRange],
      algorithms: [...this.algorithms],
      speedVSaccuracy: this.speedVSaccuracy,
      runWith: this.runWith,
      crossCount: this.crossCount
    }, this.nextSubStep(2, 3)));

    this.models = []

    const featureLabel = dataHeader.filter(d => d !== target);
    const exps = csvScript.join(";")

    const trainData = {
      problemType,
      featureLabel,
      targetLabel: target,
      projectId: id,
      command,
      sampling: this.resampling,
      maxTime: this.maxTime,
      randSeed: this.randSeed,
      speedVSaccuracy: this.speedVSaccuracy,
      version: "1,2,3",
      algorithms = [...this.algorithms]
    };
    
    if (this.dataRange === "all") {
      trainData.holdoutRate = this.holdoutRate / 100
      if(this.runWith === "holdout") {
        trainData.validationRate = this.validationRate / 100
      }else{
        trainData.nfold = this.crossCount
      }
    } else {
      trainData.splitBy = [this.customField, ...this.customRange]
    }
    if (exps) trainData.csvScript = exps.replace(/\|/g, ",")

    this.modeling(trainData)
  }

  modeling = trainData => {
    socketStore.ready().then(api => api.train(trainData, progressResult => {
      if (progressResult.progress === "start") return;
      if (progressResult.status !== 200) return
      let result = progressResult.model
      this.setModel(result)
    })).then(returnValue => {
      const { status, message } = returnValue
      // if (status === -1 && this.models.length === 0) {
      //   return this.modelingError()
      // }
      if (status < -1) {
        antdMessage.error(message)
        // return this.concurrentError(message)
      }
      // this.updateProject({
      //   train2Finished: true,
      //   train2ing: false
      // });
    })
  }

  setModel = data => {
    if (this.problemType === "Classification") data.predicted = this.calcPredicted(data)
    const index = this.models.findIndex(m => {
      return data.id === m.id
    })
    if (index === -1) {
      this.models.push(new Model(this.id, data))
    } else {
      this.models[index] = new Model(this.id, data)
    }
  }

  // modelingError = () => {
  //   this.updateProject({
  //     train2Finished: true,
  //     train2ing: false,
  //     train2Error: true,
  //     selectId: '',
  //   });
  // }

  // concurrentError = message => {
  //   antdMessage.error(message)
  //   this.updateProject({
  //     train2Finished: false,
  //     train2ing: false,
  //     train2Error: false,
  //     selectId: '',
  //     mainStep: 3,
  //     curStep: 3,
  //     lastSubStep: 1,
  //     subStepActive: 1
  //   });
  // }

  calcPredicted = model => {
    const { targetMap, colMap, target } = this;
    const targetCol = colMap ? colMap[target] : {}
    const map = Object.assign({}, targetCol, targetMap);
    let actual = [[0, 0], [0, 0]]
    Object.keys(model.targetMap).forEach(k => {
      //映射的index
      const actualIndex = map[k];
      if (actualIndex !== 0 && actualIndex !== 1) {
        return;
      }
      //返回数组的index
      const confusionMatrixIndex = model.targetMap[k];
      //遍历当前那一列数组
      model.confusionMatrix[confusionMatrixIndex] && model.confusionMatrix[confusionMatrixIndex].forEach((item, i) => {
        const key = Object.keys(model.targetMap).find(t => model.targetMap[t] === i);
        const pridict = map[key];
        if (pridict !== 0 && pridict !== 1) {
          return;
        }
        actual[actualIndex][pridict] += item;
      })
    })
    const predicted = [actual[0][0] / ((actual[0][0] + actual[0][1]) || 1), actual[1][1] / ((actual[1][0] + actual[1][1]) || 1)];
    return predicted
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

  preTrainImportance = () => {
    const exp = this.csvScript.join(";")
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'preTrainImportance'
      };
      if (exp) command.csvScript = exp.replace(/\|/g, ",")
      api.preTrainImportance(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) {
          this.setProperty({ preImportance: {} })
          return antdMessage.error("preTrainImportance error")
        }
        this.setProperty({ preImportance: result.data })
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
        this.correlationMatrixImg = result.imageSavePath
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
      })
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
      })
    })
  }

  chartData = () => {
    if (this.models.length === 0) {
      return;
    }
    socketStore.ready().then(api => {
      const request = {
        action: 'all',
        version: this.models.map(m => m.name).toString(),
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
          const { fitIndex, chart } = this.parseChartData(result.data);
          model.updateModel({
            fitIndex,
            chartData: chart
          })
        }
      })
    })
  }

  fitPlotAndResidualPlot = () => {
    if (this.models.length === 0) {
      return;
    }
    socketStore.ready().then(api => {
      const request = {
        projectId: this.id,
        version: this.models.map(m => m.name).toString(),
        command: 'fitPlotAndResidualPlot',
        featureLabel: this.dataHeader.filter(n => n !== this.target)
      }
      api.fitPlotAndResidualPlot(request, chartResult => {
        const { result } = chartResult;
        if (result.progress === 'start') return;
        const model = this.models.find(m => {
          return result.name.split(' ')[0] === m.name;
        })
        if (model) {
          model.updateModel({
            [result.action]: `http://${config.host}:${config.port}/redirect/download/${result.imageSavePath}?projectId=${this.id}`
          });
        }
      })
    })
  }
}
