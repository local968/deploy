import { observable, action, when, computed } from 'mobx';
import socketStore from './SocketStore';
import requestStore from './RequestStore.js';
import moment from 'moment';

const Classification = 'Classification';
const MinRow = 1000;

export default class Project {
	@observable description;

	@observable deployFileName = '';
	@observable uploadFileName = '';

	//problem
	@observable problemType = '';
	@observable statement = '';
	@observable business = '';

	//changeproblem
	//初始化时与problemType相同，作为展示值
	//修改并点击下一步时  表示确认修改type
	//删除上传文件，model 及其相关数据
	@observable changeProjectType = '';

	@observable target = '';

	// fast track
	@observable train2Finished = false;
	@observable deploy2Finished = false;
	@observable train2ing = false;
	@observable deploy2ing = false;
	@observable deploy2Error = false;
	@observable train2Error = false;

	// observed values from other tabs
	@observable dataHeader = [];
	@observable uploadData = [];
	@observable rawHeader = [];
	@observable colType = [];
	@observable totalLines = 0;

	@observable mainStep = 0;
	@observable curStep = 0;
	@observable lastSubStep = 1;
	@observable subStepActive = 1;

	@observable overfit = 5;
	@observable speed = 5;
	@observable version = 2;

	// etl
	// @observable fillMethod = {};
	@observable validationRate = 0.1;
	@observable holdoutRate = 0.1;

	@observable mismatchFillMethod = {}
	@observable mismatchIndex = {}
	@observable nullFillMethod = {}
	@observable nullIndexes = {}
	@observable outlierFillMethod = {}
	@observable outlierIndex = {}
	@observable dataViews = null
	@observable outlierDict = {}


	@observable criteria = 'defualt';

	constructor(userId, projectId, project = null) {
		this.userId = userId;
		this.projectId = projectId;
		this.id = `${this.userId}-${this.projectId}`;
		this.trainStartTime = 0;

		this.initCallback();

		if (!project) {
			this.createProject();
		} else {
			Object.assign(this, project);
			//初始化赋值为相同值
			this.changeProjectType = this.problemType;
		}
	}

	@action
	createProject() {
		const now = new Date();
		const dateFormat = `${now.getMonth() +
			1}.${now.getDate()}.${now.getFullYear()}`;

		const item = {
			id: this.id,
			userId: this.userId,
			projectId: this.projectId,
			date: dateFormat,
			name: `project ${new Date().toLocaleString()}`,
			industries: null,
			businessFunctions: null,
			createdAt: +now,
			updatedAt: +now
		};

		Object.assign(this, item);

		when(
			() => socketStore.isready,
			() => {
				socketStore.send('changeProject', {
					projectId: this.projectId,
					args: item
				});
			}
		);
	}

	nextMainStep(routeIndex) {
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
		// this.projectShare(obj);
		this.updateProject(obj);
	}

	nextSubStep(subStepIndex, routeIndex) {
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
		// this.projectShare(obj);
		this.updateProject(obj);
	}

	saveProblem() {
		if (this.problemType && this.changeProjectType !== this.problemType) {
			this.changeType();
		} else {
			this.updateProject({
				statement: this.statement,
				business: this.business,
				problemType: this.changeProjectType
			});
			this.nextMainStep(2);
		}
	}

	// 修改problemType后执行删除
	changeType() {
		when(
			() => socketStore.isready,
			() =>
				socketStore.send('changeProblemType', {
					projectId: this.projectId
				})
		);
	}

	backToProblemStep() {
		//全部恢复到problem步骤
		const problemStepData = {
			statement: this.statement,
			business: this.business,
			problemType: this.changeProjectType,
			target: '',
			train2Finished: false,
			deploy2Finished: false,
			train2ing: false,
			deploy2ing: false,
			deploy2Error: false,
			train2Error: false,
			dataHeader: [],
			uploadData: [],
			rawHeader: [],
			colType: [],
			totalLines: 0,
			mainStep: 2,
			curStep: 2,
			lastSubStep: 1,
			subStepActive: 1,
			overfit: 5,
			speed: 5,
			version: 2,
			validationRate: 0.1,
			holdoutRate: 0.1,
			mismatchFillMethod: {},
			mismatchIndex: {},
			nullFillMethod: {},
			nullIndexes: {},
			outlierFillMethod: {},
			outlierIndex: {},
			dataViews: null
		};
		this.updateProject(problemStepData);
		Object.assign(this, problemStepData);
	}

	@action
	fastTrackInit(name) {
		this.updateProject({
			deploy2ing: false,
			train2ing: false,
			deploy2Finished: false,
			train2Error: false,
			deploy2Error: false,
			train2Finished: false,
			uploadFileName: name,
			dataHeader: [],
			uploadData: [],
			rawHeader: []
		});
	}

	@action
	newFileInit(uploadData) {
		const header = uploadData[0];
		const data = uploadData.slice(1);

		// 上传文件，target为空
		this.updateProject({
			uploadData: data,
			dataHeader: header,
			rawHeader: header,
			target: ''
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

	autoFixHeader() {
		const { rawHeader } = this;
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

		this.updateProject({
			dataHeader: header,
			rawHeader: header
		});
	}

	etl() {
		const { userId, projectId, problemType, dataHeader, uploadFileName } = this;

		const command = 'etl';
		const id = `${command}-${userId}-${projectId}`;

		const data = {
			csvLocation: uploadFileName,
			problemType,
			featureLabel: [...dataHeader],
			projectId,
			userId,
			time: moment().valueOf(),
			command,
			validationRate: this.validationRate,
			holdoutRate: this.holdoutRate,
			version: this.version
		}

		if(this.colType.length) {
			data.colType= [...this.colType];
		}

		if(this.target) {
			data.targetLabel = this.target;
		}

		if(this.mismatchFillMethod && Object.keys(this.mismatchFillMethod).length) {
			data.mismatchFillMethod = {...this.mismatchFillMethod};
		}

		if(this.nullFillMethod && Object.keys(this.nullFillMethod).length) {
			data.nullFillMethod = {...this.nullFillMethod};
		}

		if(this.outlierFillMethod && Object.keys(this.outlierFillMethod).length) {
			data.outlierFillMethod = {...this.outlierFillMethod};
		}

		if(this.targetMap && Object.keys(this.targetMap).length) {
			data.targetMap = {...this.targetMap};
		}

		if(this.outlierDict && Object.keys(this.outlierDict).length) {
			data.outlierDict = {...this.outlierDict};
		}

		console.log(data)
		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// problem_type: 预测类型 Classification , Regression
		// feature_label: 特征列名
		// fill_method:  无效值
		// kwargs:
		requestStore.sendRequest(id, data);
	}

	setProperty(data) {
		if (typeof data !== 'object') {
			return false;
		}
		if (Array.isArray(data)) {
			return false;
		}
		delete data.userId;
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
	fixClassification(targetMap) {
		this.updateProject({
			targetMap: targetMap
		})
		this.etl();
	}

	@action
	fixRegression() {
		this.updateProject({
			outlierDict: this.outlierDict
		})
		this.etl();
	}

	@computed
	get issues() {
		const data = {
			rowIssue: false,
			dataIssue: false,
			targetIssue: false
		}
		const {problemType, totalRawLines, target,  colMap, issueRows, colType} = this;

		if(problemType === Classification) {
			if(colType[target] === 'Categorical') {
				data.targetIssue = Object.keys(colMap[target]).length > 2;
			}else{
				data.targetIssue = true
			}
		}else{
			if(colType[target] === 'Categorical') {
				data.targetIssue = Object.keys(colMap[target]).length < 10;
			}
		}

		if(totalRawLines < MinRow) {
			data.rowIssue = true;
		}

		if(issueRows.errorRow.length) {
			data.dataIssue = true
		}
		
		return data
	}

	@computed
	get issueRows(){
		const {dataHeader, mismatchIndex, nullIndex, outlierIndex, colMap} = this;
		const arr = {
			mismatchRow: [],
			nullRow: [],
			outlierRow: [],
			errorRow: []
		}

		dataHeader.forEach(h => {
			if(mismatchIndex[h]&&!!mismatchIndex[h].length) {
				arr.mismatchRow = Array.from(new Set(arr.mismatchRow.concat([...mismatchIndex[h]])));
				arr.errorRow = Array.from(new Set(arr.errorRow.concat([...mismatchIndex[h]])));
			}
			if(nullIndex[h]&&!!nullIndex[h].length) {
				arr.nullRow = Array.from(new Set(arr.nullRow.concat([...nullIndex[h]])));
				arr.errorRow = Array.from(new Set(arr.errorRow.concat([...nullIndex[h]])));
			}
			if(colMap[h]!=="Categorical"&&outlierIndex[h]&&!!outlierIndex[h].length) {
				arr.outlierRow = Array.from(new Set(arr.outlierRow.concat([...outlierIndex[h]])));
				arr.errorRow = Array.from(new Set(arr.errorRow.concat([...outlierIndex[h]])));
			}
		})
		return arr
	}

	setOutlier(key, data) {
		this.outlierDict[key] = data;
	}

	fastTrain() {
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
		this.trainStartTime = moment().valueOf();
		const command = 'train2';

		this.updateProject({
			train2Finished: false,
			train2ing: true,
			train2Error: false
		});

		when(
			() => socketStore.isready,
			() => socketStore.send('train', { projectId })
		);

		const id = `${command}-${userId}-${projectId}`;
		const featureLabel = dataHeader.filter(d => d !== target);
		// this.cleanResultByCommand(this.modelingResultTable, { command: 'train2' });

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
		// version: 控制选择何种model，目前有gbm，cat，默认两种全部使用。
		// projectName: 名称
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			problemType,
			featureLabel,
			targetLabel: target,
			projectId,
			userId,
			speed,
			overfit,
			time: this.trainStartTime,
			command,
			projectName: this.name,
			version: this.version
		});

		// this.nextSubStep(3, 2);
	}

	initDeployFile(filename) {
		this.updateProject({
			deployFileName: filename
		});
	}

	finishTrain2() {
		this.updateProject({
			train2Finished: true,
			train2ing: false
		});
	}

	correlationMatrix() {
		const { userId, projectId, uploadFileName, dataHeader } = this;

		const command = 'correlationMatrix';

		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version,
			featureLabel: [...dataHeader]
		});
	}

	fitPlotAndResidualPlot() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'fitPlotAndResidualPlot';

		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	pointToShow() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'pointToShow';

		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	preTrainImportance() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'preTrainImportance';
		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	univariatePlot() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'univariatePlot';
		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	histgramPlot() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'histgramPlot';
		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	modelInsights() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'modelInsights';
		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	dataView() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'dataView';
		const id = `${command}-${userId}-${projectId}`;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		requestStore.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
			version: this.version.toString()
		});
	}

	modelingError() {
		this.updateProject({
			train2Error: true,
			train2ing: false
		});
	}

	initCallback() {
		const callback = {
			changeProject: data => {
				console.log(data);
			}
		};

		socketStore.addMessageArr(callback);
	}

	@action
	updateProject(item) {
		const data = { id: this.id, ...item };

		when(
			() => socketStore.isready,
			() => {
				socketStore.send('changeProject', {
					projectId: this.projectId,
					args: data
				});
			}
		);
		Object.assign(this, data);
	}
}
