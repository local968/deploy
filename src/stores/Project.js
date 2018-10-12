import { observable, action, computed, toJS, when } from "mobx";
import socketStore from "./SocketStore";
import Model from "./Model";
import moment from 'moment';

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


  /**---------------------------------------------data-------------------------------------------------*/
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
    console.log(data)
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
        console.log(progressResult, "progressResult")
        // let { result } = progressResult;
        // if (!this.etling) return;
        // Object.keys(result).forEach(k => {
        //   if (k === "name") {
        //     delete result[k];
        //   }
        //   if (k.includes("FillMethod")) {
        //     Object.keys(result[k]).forEach(key => {
        //       if (result[k][key] === "ignore") delete result[k][key]
        //     })
        //   }
        // })
        // console.log(result, "etl progress")
        // // this.project.setProperty(result)
        // this.updateProject(result)
      }))
      .then(returnValue => {
        console.log(returnValue, "etl result")
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

  /**---------------------------------------------train------------------------------------------------*/
  @action
  fastTrain = () => {
    const {
      userId,
      projectId,
      problemType,
      target,
      dataHeader,
      uploadFileName,
      speed,
      overfit
    } = this;
    const command = 'train2';

    this.updateProject(Object.assign({
      train2Finished: false,
      train2ing: true,
      train2Error: false
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
      projectId,
      userId,
      speed,
      overfit,
      command
    };

    socketStore.ready().then(api => api.train(trainData, progressResult => {
      console.log(progressResult, "train progressResult")
      if (Array.isArray(progressResult)) {
        [progressResult] = progressResult
      }
      if (progressResult && progressResult.name) {
        let index = this.models.findIndex(m => {
          return progressResult.name === m.name
        })
        if (index === -1) {
          this.models.push(new Model(this.userId, this.projectId, progressResult))
        } else {
          this.models[index] = new Model(this.userId, this.projectId, progressResult)
        }
      }
    })).then(returnValue => {
      console.log(returnValue, "train result")
      this.updateProject({
        train2Finished: true,
        train2ing: false
      });
    })
  }
}
