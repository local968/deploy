import { observable, action, when, computed } from 'mobx';
import socketStore from './SocketStore';
import moment from 'moment';

const Classification = 'Classification';
const MinRow = 1000;

export default class Project {
	//project
	@observable description;
	@observable exist = true;

	//problem
	@observable problemType = '';
	@observable statement = '';
	@observable business = '';

	//changeproblem
	//初始化时与problemType相同，作为展示值
	//修改并点击下一步时  表示确认修改type
	//删除上传文件，model 及其相关数据
	@observable changeProjectType = '';

	@observable mainStep = 0;
	@observable curStep = 0;
	@observable lastSubStep = 1;
	@observable subStepActive = 1;

	// etl
	@observable etling = false;
	// @observable fillMethod = {};
	
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
	//not save
	@observable targetMapTemp = {};
	@observable dataViewing = false;
	@observable preImportanceing = false;

	// train
	@observable train2Finished = false;
	@observable train2ing = false;
	@observable train2Error = false;
	@observable criteria = 'defualt';
	@observable overfit = 5;
	@observable speed = 5;

	constructor(userId, projectId, project = null) {
		this.userId = userId;
		this.projectId = projectId;
		this.id = `${this.userId}-${this.projectId}`;
		this.trainStartTime = 0;

		if (!project) {
			this.createProject();
		} else {
			Object.assign(this, project);
			//初始化赋值为相同值
			this.changeProjectType = this.problemType;
		}
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
		this.dataViewing = false;
		this.preImportanceing = false;
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
		this.updateProject({
			statement: this.statement,
			business: this.business,
			problemType: this.changeProjectType
		});
		if (this.problemType && this.changeProjectType !== this.problemType) {
			this.changeType();
		} else {
			this.nextMainStep(2);
		}
	}

	// 修改problemType后执行删除
	changeType() {
		when(
			() => socketStore.isready,
			() => socketStore.send('changeProblemType', {
				projectId: this.projectId
			})
		);
	}

	backToProblemStep() {
		//全部恢复到problem步骤
		const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTarin, {
			mainStep: 2,
			curStep: 2,
			lastSubStep: 1,
			subStepActive: 1
		})
		this.updateProject(backData);
		Object.assign(this, backData);
	}

	//修改上传文件
	@action
	fastTrackInit(name) {
		const backData = Object.assign({}, this.defaultUploadFile, this.defaultDataQuality, this.defaultTarin, {uploadFileName: name}, {
			mainStep: 2,
			curStep: 2,
			lastSubStep: 1,
			subStepActive: 1
		})
		this.updateProject(backData);
	}

	//读取预览文件
	@action
	newFileInit(uploadData) {
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

	etl() {
		const { userId, projectId, problemType, dataHeader, uploadFileName, rawHeader } = this;

		const command = 'etl';
		const id = `${command}-${userId}-${projectId}`;

		const data = {
			csvLocation: uploadFileName,
			projectId,
			userId,
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
			data.featureLabel = [...dataHeader]
		}

		if (this.mismatchFillMethod && Object.keys(this.mismatchFillMethod).length) {
			data.mismatchFillMethod = { ...this.mismatchFillMethod };
		}

		if (this.nullFillMethod && Object.keys(this.nullFillMethod).length) {
			data.nullFillMethod = { ...this.nullFillMethod };
		}

		if (this.outlierFillMethod && Object.keys(this.outlierFillMethod).length) {
			data.outlierFillMethod = { ...this.outlierFillMethod };
		}

		if (this.targetMap && Object.keys(this.targetMap).length) {
			data.targetMap = { ...this.targetMap };
		}

		if (this.outlierDict && Object.keys(this.outlierDict).length) {
			data.outlierDict = { ...this.outlierDict };
		}

		if (this.noCompute || this.firstEtl) {
			data.noCompute = true;
		}
		this.etling = true
		console.log(data)
		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// problem_type: 预测类型 Classification , Regression
		// feature_label: 特征列名
		// fill_method:  无效值
		// kwargs:
		this.sendRequest(id, data);
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
			if (key === 'problemType') {
				data.changeProjectType = data[key]
			}

			if (key === 'targetMap') {
				data.targetMapTemp = data[key];
			}
		}
		Object.assign(this, data)
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
			outlierDict: this.outlierDict,
			nullFillMethod: this.nullFillMethod,
			mismatchFillMethod: this.mismatchFillMethod,
			outlierFillMethod: this.outlierFillMethod
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
		const { problemType, totalRawLines, target, colMap, issueRows, colType } = this;

		if (problemType === Classification) {
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

		if (totalRawLines < MinRow) {
			data.rowIssue = true;
		}

		if (issueRows.errorRow.length) {
			data.dataIssue = true
		}

		return data
	}

	@computed
	get issueRows() {
		const { dataHeader, mismatchIndex, nullIndex, outlierIndex, colType } = this;
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
		// projectName: 名称
		// kwargs:
		this.sendRequest(id, {
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
			projectName: this.name
		});

		// this.nextSubStep(3, 2);
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
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command,
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
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
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
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
		});
	}

	preTrainImportance() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'preTrainImportance';
		const id = `${command}-${userId}-${projectId}`;

		this.preImportanceing = true;
		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
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
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
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
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
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
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
		});
	}

	dataView() {
		const { userId, projectId, uploadFileName } = this;

		const command = 'dataView';
		const id = `${command}-${userId}-${projectId}`;

		this.dataViewing = true;

		// id: request ID
		// userId: user ID
		// projectId: project ID
		// csv_location: csv 文件相对路径
		// kwargs:
		this.sendRequest(id, {
			csvLocation: uploadFileName,
			projectId,
			userId,
			time: +new Date(),
			command
		});
	}

	modelingError() {
		this.updateProject({
			train2Error: true,
			train2ing: false
		});
	}

	@action
    sendRequest(id, request) {
        when(() => socketStore.isready,
            () => {
                socketStore.send("changeRequest", { id, params: request })
            })
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
