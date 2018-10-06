import { observable, action, computed } from "mobx";
import socketStore from "./SocketStore";

export default class Project {
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
	@observable uploadFileName = '';

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
			uploadFileName: '',
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
    this.updateProject(obj);
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
    this.updateProject(obj);
  }

  @action
  updateProject = data => {
    this.loading = true;
    data.id = this.id

    return socketStore.ready().then(api => {
      return api.updateProject(data).then(result => {
        const { status, message, id } = result
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
  setProperty(data) {
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
}
