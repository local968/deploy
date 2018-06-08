import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import {Uploader, Row, RowCell, Select} from '../Common';
import Papa from 'papaparse';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
import defileIcon from './define.svg';

@inject('projectStore')
@observer
export default class Data extends Component {
    constructor(props) {
        super(props);
        const {pid, aid} = props.match.params || {};
        this.pid = pid?parseInt(pid):0;
        // this.aid = aid?parseInt(aid):0;
        
        props.projectStore.init(this.pid);
    }

    getChild = () => {
        const {userId, currentApproach} = this.props.projectStore;
        const {mainStep, lastSubStep} = currentApproach || {};
        
        let subStep = mainStep > 2 ? 3 : lastSubStep;

        switch(subStep) {
            case 1:
                return <DataConnect projectId={this.pid} userId={userId} approach={currentApproach} />;
            case 2:
                return <DataSchema approach={currentApproach} />;
            case 3:
                return <DataDeploy projectId={this.pid} userId={userId} approach={currentApproach} />
        }
    }

    render() {
        const {currentApproach} = this.props.projectStore;
        return <div className={styles.data}>
            {currentApproach&&this.getChild()}
        </div>
    }
}

@observer
class DataConnect extends Component{
    upload = (data) => {
        const {message, file, err} = data;
        if(err){
           return false; 
        }

        this.props.approach.fastTrackInit(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = Papa.parse(e.target.result, { header: false, preview: 100 });
            if (result.errors.length !== 0) {
                console.error('parse error: ', result.errors[0].message);
                return;
            }
            if (file.name.split('.').slice(-1)[0] !== 'csv') {
                console.error('extension is not csv');
                return;
            }
            this.props.approach.newFileInit(result.data);
        }
        const blob = file.slice(0, 5000000);
        reader.readAsText(blob);
        this.props.approach.nextSubStep(2, 2)
    }

    onProgress = (progressEvent) => {
        if(progressEvent.lengthComputable){
            console.log("upload " + Math.round(progressEvent.loaded / progressEvent.total) + "%")
        }
    }

    block = (label, img) => {

        return <div className={styles.uploadBlock}>
            <div className={styles.blockImg}><img src={img} alt={label}/></div>
            <div className={styles.blockLabel}><span>{label}</span></div>
        </div>
    }

    render() {
        const {userId, projectId, approach} = this.props;
        return <div className={styles.connect}>
            <div className={styles.title}><span>If your data is ready, choose a data source to connect.</span></div>
            <div className={styles.maxRow}><span>Maximum Data Size</span><div className={styles.mark}><span>?</span></div><span> : 50000 (rows) </span><a>Edit</a></div>
            <div className={styles.uploadRow}>
                {this.block("From Mr.One",sampleIcon)}
                <Uploader children={this.block("From Computer",localFileIcon)} onChange={this.upload} params={{userId, projectId, approachId:approach.approachId}} onProgress={this.onProgress} />
                {this.block("From SQL",sqlIcon)}
            </div>
            <div className={styles.cutoff}>
                <div className={styles.line}>
                </div>
                <div className={styles.or}>
                    <span>or</span>
                </div>
                <div className={styles.line}>
                </div>
            </div>
            <div className={styles.title}><span>If you need to define what training data to collect, please proceed here.</span></div>
            <div className={styles.uploadRow}>
                {this.block("From Mr.One",defileIcon)}
            </div>
        </div>;
    }
}

@observer
class DataSchema extends Component{
    nextStep = () => {
        this.props.approach.fastTrain();
        this.props.approach.nextSubStep(3, 2);
    }

    targetSelect = (v) => {
        this.props.approach.updateApproach({
            target: v
        })
    }

    render() {
        const {approach} = this.props;
        const {uploadData, rawHeader, varNameMap, target} = approach;
        const targetOption = {};
        rawHeader.forEach(h => {
            targetOption[h] = h
        });
        const tableData = [
            rawHeader.map((d, i) => i + 1),
            ...uploadData
        ];
        const renderHead = <div className={styles.rowHead}>
            {tableData.slice(0, 3).map((r, i) => {
            return <Row rowIndex={i} key={i}>
                {r.map((d, index) => {
                    return <RowCell key={index} cellStyle={i === 1 ? { borderBottom: '3px solid #8cc7f4' } : {}} data={i === 1 ? varNameMap[index] || d : d} />;
                })}
                </Row>;
            })}
        </div>;

        const renderContent = <div className={styles.rowData}>
            {tableData.splice(3, tableData.length).map((r, i) => {
            return <Row rowIndex={i} key={i}>
                {r.map((d, index) => {
                    return <RowCell key={index} data={d} />;
                })}
                </Row>;
            })}
        </div>;

        return approach && <div className={styles.schema}>
            <div className={styles.schemaInfo}>
                <div className={styles.schemaI}><span>i</span></div>
                <div className={styles.schemaText}>
                    <span>Please edit the default header row if necessary.</span>
                    <span>If your data doesn't have a header, please prepare a dataset that has one.</span>
                </div>
            </div>
            <div className={styles.schemaContent}>
                <div className={styles.schemaTools}>
                    <Select 
                        title={"Target Variable"}
                        dropdownClassName={"targetSelect"}
                        autoWidth = {"1.6em"}
                        options={targetOption}  
                        onChange={this.targetSelect}
                        value={target}
                        selectOption={{showSearch:true}}
                    />
                </div>
                <div className={styles.wapper}>
                    <div className={styles.content}>
                        {renderHead}
                        {renderContent}
                    </div>
                </div>
            </div>
            <div><button onClick={this.nextStep}>Continue</button></div>
        </div>
    }
}

class DataDeploy extends Component{
    deploy = () => {
        this.props.approach.deploy();
    }

    upload = (data) => {
        const {message, file, err} = data;
        if(err){
           return false; 
        }

        this.props.approach.initDeployFile(file.name)
    }

    render() {
        const {userId, projectId, approach} = this.props;
        return approach && <div>
            <Uploader children={"file upload"} onChange={this.upload} params={{userId, projectId, approachId:approach.approachId}} />
            <div><button onClick={this.deploy}>Continue</button></div>
        </div>
    }
}