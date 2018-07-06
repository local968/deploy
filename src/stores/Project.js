// import db from './db.js';
import { observable, action, when } from 'mobx';
import socketStore from './SocketStore';
import requestStore from './RequestStore.js';
import moment from 'moment';

export default class Project {
    @observable description;

    @observable deployFileName = '';
    @observable uploadFileName = '';

    //problem
    @observable problemType = '';
    @observable statement = "";
    @observable business = '';

    @observable target = "";

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
    @observable dataType = [];

    @observable mainStep = 0;
    @observable curStep = 0;
    @observable lastSubStep = 1;
    @observable subStepActive = 1;

    @observable overfit = 5;
    @observable speed = 5;
    @observable version = 2;

    @observable validationRate = 0.1;
    @observable holdoutRate = 0.1;

    @observable criteria = 'defualt';

    observedKeys = [
        'description'
    ];

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
        }
    }

    @action
    createProject() {
        const now = new Date();
        const dateFormat = `${now.getMonth() + 1}.${now.getDate()}.${now.getFullYear()}`;

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
        const initObservedKeys = {};
        this.observedKeys.forEach(k => {
            initObservedKeys[k] = this[k];
        });
        Object.assign(this, item, initObservedKeys);

        when(
            () => socketStore.isready,
            () => {
                socketStore.send("changeProject", { userId: this.userId, projectId: this.projectId, args: item })
            }
        )

    }

    nextMainStep(routeIndex) {
        let obj;
        if (routeIndex <= this.mainStep) {
            obj = {
                curStep: routeIndex
            };
        } else (
            obj = {
                curStep: routeIndex,
                mainStep: routeIndex,
                subStepActive: 1,
                lastSubStep: 1
            }
        );
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
            business: this.business
        });
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
            uploadFileName: name
        });
    }

    @action
    newFileInit(uploadData) {
        const header = uploadData[0];
        const data = uploadData.slice(1);

        this.updateProject({
            uploadData: data,
            dataHeader: header,
            rawHeader: header
        });

        this.nextSubStep(2, 2);
    }

    autoFixHeader() {
        const {rawHeader} = this;
        const temp = {};
        const header = rawHeader.map((h, i) => {
            h = h.trim();
            if (/^$/.test(h)){
                h = `Unnamed: ${i}`;
            }
            if(!temp[h]){
                temp[h] = 1;
            }else{
                h = h + "." + temp[h];
                temp[h]++;
            }
            return h
        })

        this.updateProject({
            dataHeader: header,
            rawHeader: header
        });
    }

    cleanDB(table, object, cb) {
        table.findAll(object).fetch().subscribe(
            items => {
                items.forEach(item => table.remove(item));
                if (cb) cb();
            }
        );
    }

    doEtl(banList) {
        const {
            userId, 
            projectId, 
            problemType,
            target,
            rawHeader,
            uploadFileName
        } = this;
        
        const command = "etl";
        const id = `${command}-${userId}-${projectId}`;

        const newDataHeader = rawHeader.filter(d => !banList.includes(d))
    
        this.updateProject({
            dataHeader: newDataHeader,
            dataType: this.dataType
        });

        const featureLabel = newDataHeader.filter(d => d !== target)

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // csv_location: csv 文件相对路径
        // problem_type: 预测类型 Classification , Regression
        // feature_label: 特征列名
        // target_label:  目标列
        // fill_method:  无效值
        // kwargs:
        requestStore.sendRequest(id,{
            csvLocation: uploadFileName,
            problemType,
            featureLabel,
            targetLabel: target,
            projectId,
            userId,
            time: moment().valueOf(),
            command,
            fillMethod: {},
            validationRate: this.validationRate,
            holdoutRate: this.holdoutRate,
            version: this.version
        });
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
        });

        const id = `${command}-${userId}-${projectId}`;
        const featureLabel = dataHeader.filter(d => d !== target)
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
        requestStore.sendRequest(id,{
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
        })
    }

    deploy() {
        const {
            userId, 
            projectId, 
            uploadFileName
        } = this;

        const command = 'deploy2'
    
        this.updateProject({
            deploy2Finished: false,
            deploy2ing: true,
        });

        const id = `${command}-${userId}-${projectId}`;

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // csv_location: csv 文件相对路径
        // kwargs:
        requestStore.sendRequest(id,{
            csvLocation: uploadFileName,
            projectId,
            userId,
            time: +new Date(),
            command
        });
    }

    finishTrain2() {
        this.updateProject({
            train2Finished: true,
            train2ing: false
        });
    }

    correlationMatrix() {
        const {
            userId, 
            projectId, 
            uploadFileName,
            dataHeader
        } = this;

        const command = 'correlationMatrix';

        const id = `${command}-${userId}-${projectId}`;

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // csv_location: csv 文件相对路径
        // kwargs:
        requestStore.sendRequest(id,{
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
        const {
            userId, 
            projectId, 
            uploadFileName
        } = this;

        const command = 'fitPlotAndResidualPlot';

        const id = `${command}-${userId}-${projectId}`;

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // csv_location: csv 文件相对路径
        // kwargs:
        requestStore.sendRequest(id,{
            csvLocation: uploadFileName,
            projectId,
            userId,
            time: +new Date(),
            command,
            version: this.version.toString()
        });
    }

    pointToShow() {
        const {
            userId, 
            projectId, 
            uploadFileName
        } = this;

        const command = 'pointToShow';

        const id = `${command}-${userId}-${projectId}`;

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // csv_location: csv 文件相对路径
        // kwargs:
        requestStore.sendRequest(id,{
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
                console.log(data)
            }
        }

        socketStore.addMessageArr(callback);
    }

    @action
    updateProject(item) {
        const data = { id: this.id, ...item };

        when(
            () => socketStore.isready,
            () => {
                socketStore.send("changeProject", {userId: this.userId, projectId: this.projectId, args: data})
            }
        )
        Object.assign(this, data);
    }
}