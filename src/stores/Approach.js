import db from './db.js';
import { observable, action, when } from 'mobx';
import requestStore from './RequestStore.js';
import config from '../config.js';
import socketStore from './SocketStore.js';
import moment from 'moment';

export default class Approach{
    @observable deployFileName = '';
    @observable uploadFileName = '';
    @observable problemType = '';
    @observable target = "";
    // fast track
    @observable fastTrackUploadProgress = 0;
    @observable fasttrack = false;
    @observable fastTrackDeployUploadProgress = 0;
    @observable train2Finished = false;
    @observable deploy2Finished = false;
    @observable fasttrackPredictResult;
    @observable train2ing = false;
    @observable deploy2ing = false;
    @observable deploy2Error = false;
    @observable train2Error = false;

    // observed values from other tabs
    @observable dataHeader = [];
    @observable uploadData = [];
    @observable rawHeader = [];
    @observable varNameMap = [];
    @observable dataType = [];

    @observable mainStep = 0;
    @observable curStep = 0;
    @observable lastSubStep = 1;
    @observable subStepActive = 1;

    @observable overfit = 5;
    @observable speed = 5;

    constructor(userId, projectId, approachId, approach=null) {
        this.userId = userId;
        this.projectId = projectId;
        this.approachId = approachId;
        this.id = `${this.userId}-${this.projectId}-${this.approachId}`;
        this.trainStartTime = 0;
        if(config.database === "tarantool"){
            this.initCallback()
        }else{
            this.linkTable();
        }
        if(!approach){
            this.createApproach();
        }else{
            Object.assign(this, approach);
        }
    }

    linkTable() {
        this.approachesTable = db('approaches');
        this.modelingParaTable = db('modeling_para');
        this.modelTable = db('models');
        this.modelingResultTable = db('modeling_result');
        this.meanResultTable = db('mean_test_score_result');
        this.modelingModelTable = db('modeling_model');
        this.frontendLogTable = db('frontend_log');
        this.scheduleTable = db('schedule');
    }

    initCallback() {
        const callback = {
            changeApproach : data => {
                console.log(data,"changeApproach")    
            }
        }
        socketStore.addMessageArr(callback);
    }

    @action
    createApproach(item={}) {
        const time = Date.now();
        Object.assign(
            item,
            {
                id: this.id,
                approachId: this.approachId,
                userId: this.userId,
                projectId: this.projectId,
                createdAt: time,
                updatedAt: time,
            },
        );
        Object.assign(this,item);
        if(config.database === "tarantool"){
            when(
                () => socketStore.isready,
                () => {
                    socketStore.send("changeApproach", {userId: this.userId, projectId: this.projectId, approachId: this.approachId, args: item})
                }
            )
        }else{
            this.projectTable.store(item);
        }
    }

    @action
    updateApproach(item) {
        const data = { id: this.id, ...item };
        const objectUpdate = { id: this.id };
        // todo
        // update object: set to null first
        for (const f in item) {
            if (item[f] && item[f].constructor === Object) {
                objectUpdate[f] = null;
            }
        }
        if(config.database === "tarantool"){
            when(
                () => socketStore.isready,
                () => {
                    socketStore.send("changeApproach", {userId: this.userId, projectId: this.projectId, approachId: this.approachId, args: objectUpdate})
                    socketStore.send("changeApproach", {userId: this.userId, projectId: this.projectId, approachId: this.approachId, args: data})
                }
            )
        }else{
            this.approachesTable.update(objectUpdate);
            this.approachesTable.update(data);
        }
        Object.assign(this, data);
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
        //只修改approach
        this.updateApproach(obj);
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
        //只修改approach
        this.updateApproach(obj);
    }

    // //原修改方法
    // projectShare(obj) {
    //     this.updateApproach(obj);
    //     this.projectStore.updateProject(obj);
    // }

    @action
    fastTrackInit(name) {
        this.updateApproach({
            fasttrack: true,
            deploy2ing: false,
            train2ing: false,
            deploy2Finished: false,
            train2Error: false,
            deploy2Error: false,
            train2Finished: false,
            fastTrackDeployUploadProgress: 0,
            fastTrackUploadProgress: 0,
            fileUploaded: true,
            uploadFileName: name
        });
        // this.cleanDB(this.meanResultTable, {
        //     userId: this.userId,
        //     projectId: this.projectId,
        //     approachId: this.approachId
        // });
    }

    @action
    newFileInit(uploadData) {
        const header = uploadData[0];
        const data = uploadData.slice(1);

        const temp = {};
        const rawHeader = header.map((h, i) => {
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

        let type = new Array(header.length).fill("numerical");
        for(var row of data){
            for(var [k ,v] of row.entries()){
                if(type[k] === "categorical"){
                    continue;
                }
                if(!!v && isNaN(parseFloat(v))){
                    type[k] = "categorical"
                }
            }
        }

        this.updateApproach({
            uploadData: data,
            dataHeader: header,
            rawHeader,
            varNameMap: header,
            dataType: type
        });

        this.nextSubStep(2, 2);
    }

    cleanDB(table, object, cb) {
        table.findAll(object).fetch().subscribe(
            items => {
                items.forEach(item => table.remove(item));
                if (cb) cb();
            }
        );
    }

    fastTrain(banList) {
        const {
            userId, 
            projectId, 
            approachId, 
            problemType,
            target,
            dataHeader,
            uploadFileName,
            speed,
            overfit,
            dataType
        } = this;
        this.trainStartTime = moment().valueOf();
        const command = 'train2';
        const newDataHeader = dataHeader.filter(d => !banList.includes(d))
    
        this.updateApproach({
            train2Finished: false,
            train2ing: true,
            dataHeader: newDataHeader,
            dataType: dataType
        });
        const id = `${command}-${userId}-${projectId}-${approachId}`;
        const featureLabel = newDataHeader.filter(d => d !== target)
        // this.cleanResultByCommand(this.modelingResultTable, { command: 'train2' });

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // approachId: approach ID
        // csv_location: csv 文件相对路径
        // problem_type: 预测类型 Classification , Regression
        // feature_label: 特征列名
        // target_label:  目标列
        // fill_method:  无效值
        // speed:  1-10  默认5
        // overfit:   1-10 默认5
        // model_option: model的额外参数，不同model参数不同
        // version: 控制选择何种model，目前有gbm，cat，默认两种全部使用。
        // kwargs:
        requestStore.sendRequest(id,{
            csvLocation: uploadFileName,
            problemType,
            featureLabel,
            targetLabel: target,
            projectId,
            userId,
            approachId,
            speed,
            overfit,
            time: this.trainStartTime,
            command
        });

        this.nextSubStep(3, 2);
    }

    initDeployFile(filename) {
        this.updateApproach({
            deployFileName: filename
        })
    }

    deploy() {
        const {
            userId, 
            projectId, 
            approachId, 
            uploadFileName
        } = this;

        const command = 'deploy2'
    
        this.updateApproach({
            deploy2Finished: false,
            deploy2ing: true,
        });

        const id = `${command}-${userId}-${projectId}-${approachId}`;

        // id: request ID
        // userId: user ID
        // projectId: project ID
        // approachId: approach ID
        // csv_location: csv 文件相对路径
        // kwargs:
        requestStore.sendRequest(id,{
            csvLocation: uploadFileName,
            projectId,
            userId,
            approachId,
            time: +new Date(),
            command
        });
    }

    finishTrain2() {
        this.updateApproach({
            train2Finished: true,
            train2ing: false
        });
    }

    saveModel(data, time) {
        console.log(data,time,moment().valueOf(),this.trainStartTime)
        const endTime = moment().valueOf();
        for(let key in data.args){
            data.args[key].executeTime = endTime - this.trainStartTime;
        }
        when(
            () => socketStore.isready,
            () => {
                socketStore.send("changeModel", data)
            }
        )
    }
}