import { observable, action, computed, toJS, when } from "mobx";
import socketStore from "./SocketStore";
import Model from "./Model";
import moment from 'moment';
import config from 'config';
import Papa from 'papaparse';

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

  //step
  @observable mainStep = 0;
  @observable curStep = 0;
  @observable lastSubStep = 1;
  @observable subStepActive = 1;

  //project
  @observable name;
  @observable description;

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
  @observable validationRate = 0.1;
  @observable holdoutRate = 0.1;
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
  @observable histgramPlots = null;
  @observable univariatePlots = null;
  @observable correlationMatrixImg = '';
  //not save
  @observable targetMapTemp = {};

  // train
  @observable train2Finished = false;
  @observable train2ing = false;
  @observable train2Error = false;
  @observable criteria = 'defualt';
  @observable overfit = 5;
  @observable speed = 5;
  @observable advancedSize = 0;
  @observable maxTime = 0;
  @observable randSeed = 0;
  @observable measurement = '';
  @observable resampling = "no";
  @observable runWith = 'holdout';
  @observable crossCount = 5;

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
      validationRate: 0.1,
      holdoutRate: 0.1
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
    return {
      train2Finished: false,
      train2ing: false,
      train2Error: false,
      criteria: 'defualt',
      overfit: 5,
      speed: 5
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
      csvLocation: [...uploadFileName],
      projectId: id,
      time: moment().valueOf(),
      command,
      validationRate: this.validationRate,
      holdoutRate: this.holdoutRate
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

    if (this.noCompute || this.firstEtl) {
      data.noCompute = true;
    }
    this.etling = true;
    // id: request ID
    // userId: user ID
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
          const url = `http://${config.uploadServer}/download/${path}`
          Papa.parse(url, {
            download: true,
            preview: 100,
            complete: result => {
              if (result.errors.length !== 0) {
                console.error('parse error: ', result.errors[0].message);
                return;
              }
              this.newFileInit(result.data);
            }
          });
        }
        // this.project.setProperty(result)
        // this.updateProject(result)
      }))
      .then(returnValue => {
        this.etling = false;
        let { result } = returnValue;
        Object.keys(result).forEach(k => {
          if (k === "name") {
            delete result[k];
          }
          if (k.includes("FillMethod")) {
            Object.keys(result[k]).forEach(key => {
              if (result[k][key] === "ignore") delete result[k][key]
            })
          }
        })
        result.dataViews = null;
        result.firstEtl = false;

        when(
          () => !!this.uploadData.length,
          () => this.updateProject(Object.assign(result, this.next()))
        )
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
      return false
    }
  }

  @action
  dataView = () => {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'dataView'
      };
      api.dataView(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) return alert("dataview error")
        this.setProperty({
          dataViews: result.data
        })
      })
    })
  }

  @action
  fixTarget() {
    this.updateProject({
      targetMap: this.targetMapTemp
    })
    this.etl();
  }

  @action
  fixFillMethod() {
    this.updateProject({
      outlierDict: toJS(this.outlierDict),
      nullFillMethod: toJS(this.nullFillMethod),
      mismatchFillMethod: toJS(this.mismatchFillMethod),
      outlierFillMethod: toJS(this.outlierFillMethod)
    })
    this.etl();
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
        if (model.score.holdoutScore.auc < m.score.holdoutScore.auc) {
          model = m;
        }
      } else {
        if (1 - model.score.holdoutScore.rmse + model.score.holdoutScore.r2 < 1 - m.score.holdoutScore.rmse + m.score.holdoutScore.r2) {
          model = m;
        }
      }
    }
    return model
  }

  @action
  fastTrain = () => {
    const {
      userId,
      id,
      problemType,
      target,
      dataHeader,
      uploadFileName,
      speed,
      overfit
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

    // id: request ID
    // userId: user ID
    // projectId: project ID
    // csv_location: csv 文件相对路径
    // problem_type: 预测类型 Classification , Regression
    // feature_label: 特征列名
    // target_label:  目标列
    // fill_method:  无效值
    // speed:  1-10  默认5
    // overfit:   1-10 默认5
    // model_option: model的额外参数，不同model参数不同
    // kwargs:
    const trainData = {
      csvLocation: uploadFileName,
      problemType,
      featureLabel,
      targetLabel: target,
      projectId: id,
      userId,
      speed,
      overfit,
      command
    };

    socketStore.ready().then(api => api.train(trainData, progressResult => {
      if (progressResult.progress === "start") return;
      if (progressResult.status !== 200) return
      let result = progressResult.result
      let index = this.models.findIndex(m => {
        return result.id === m.id
      })
      if (this.problemType === "Classification") result.predicted = this.calcPredicted(result)
      if (index === -1) {
        this.models.push(new Model(this.id, result))
      } else {
        this.models[index] = new Model(this.id, result)
      }
    })).then(() => {
      this.updateProject({
        train2Finished: true,
        train2ing: false
      });
    })
  }

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
        if (this.problemType === "Classification") m.predicted = this.calcPredicted(m)
        this.models.push(new Model(this.id, m))
      });
    })
  }

  preTrainImportance() {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'preTrainImportance'
      };
      api.preTrainImportance(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) return alert("preTrainImportance error")
        this.setProperty({
          preImportance: result.data
        })
      })
    })
  }

  /**------------------------------------------------chart---------------------------------------------------------*/
  correlationMatrix() {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'correlationMatrix',
        featureLabel: toJS(this.dataHeader)
      };
      api.correlationMatrix(command, progressResult => {
      }).then(returnValue => {
        const { status, result } = returnValue
        if (status < 0) return alert("correlationMatrix error")
        this.correlationMatrixImg = result.imageSavePath
      })
    })
  }

  univariatePlot() {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'univariatePlot',
      };
      api.univariatePlot(command, progressResult => {
        const { result } = progressResult
        const { field: plotKey, imageSavePath, progress } = result;
        if (progress && progress === "start") return
        const univariatePlots = Object.assign({}, this.univariatePlots);
        univariatePlots[plotKey] = imageSavePath
        this.setProperty({ univariatePlots })
      }).then(returnValue => {
      })
    })
  }

  histgramPlot() {
    socketStore.ready().then(api => {
      const command = {
        projectId: this.id,
        command: 'histgramPlot',
      };
      api.histgramPlot(command, progressResult => {
        const { result } = progressResult
        const { field: plotKey, imageSavePath, progress } = result;
        if (progress && progress === "start") return
        const histgramPlots = Object.assign({}, this.histgramPlots);
        histgramPlots[plotKey] = imageSavePath
        this.setProperty({ histgramPlots })
      }).then(returnValue => {
      })
    })
  }

  chartData = () => {
    socketStore.ready().then(api => {
      const request = {
        action: 'all',
        version: this.models.map(m => m.name).toString(),
        command: 'chartData',
        csvLocation: [...this.uploadFileName],
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
}
