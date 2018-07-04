import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import {Uploader, Select, ContinueButton} from '../Common';
import Papa from 'papaparse';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
import defileIcon from './define.svg';
import { AutoSizer, MultiGrid } from 'react-virtualized';
import { Checkbox } from 'antd';
// import { when } from 'mobx';

import dataConnectActive from './data_schema_a.svg';
import dataSchemaActive from './data_schema_a.svg';
import dataSchema from './data_schema.svg';
import dataQualityActive from './data_schema_a.svg';
import dataQuality from './data_schema.svg';

const imgs = {
    dataSchema: <img src={dataSchema} alt="schema" />,
    dataQuality: <img src={dataQuality} alt="quality" />,
    dataConnectActive: <img src={dataConnectActive} alt="connect" />,
    dataSchemaActive: <img src={dataSchemaActive} alt="schema" />,
    dataQualityActive: <img src={dataQualityActive} alt="quality" />
}


// @inject('userStore', 'projectStore')
@observer
export default class Data extends Component {
    constructor(props) {
        super(props);
    //     const {pid} = props.match.params || {};
    //     this.pid = pid ? parseInt(pid, 10) : 0;
        this.step = ['Connect', 'Schema', 'Quality']
        
    //     when(
    //         () => props.userStore.userId && !props.userStore.isLoad,
    //         () => props.projectStore.init(props.userStore.userId, this.pid)
    //     )
    }
    // static step = ['Connect', 'Schema', 'Quality'];

    enter = (step) => {
        const {mainStep, lastSubStep, subStepActive} = this.props.project;

        if(step === subStepActive) return false;

        let maxStep = mainStep > 2 ? 3 : lastSubStep;

        if(step > maxStep) return false;

        this.props.project.nextSubStep(step, 2)
    }

    getChild = () => {
        const {userId, project} = this.props;
        const {curStep, subStepActive} = project || {};
        
        let subStep = curStep !== 2 ? 3 : subStepActive;

        switch(subStep) {
            case 1:
                return <DataConnect userId={userId} project={project} />;
            case 2:
                return <DataSchema project={project} />;
            case 3:
                return <DataDeploy userId={userId} project={project} />;
            default:
                return;
        }
    }

    render() {
        const {project} = this.props;
        return <div className={styles.data}>
            {project&&this.getChild()}
            {project&&<ProjectSide enter={this.enter} list={this.step} step={project.subStepActive} />}
        </div>
    }
}

@observer
class DataConnect extends Component{
    upload = (data) => {
        const {file} = data;

        this.props.project.fastTrackInit(file.name);

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
            this.props.project.newFileInit(result.data);
        }
        const blob = file.slice(0, 5000000);
        reader.readAsText(blob);
    }

    block = (label, img) => {

        return <div className={styles.uploadBlock}>
            <div className={styles.blockImg}><img src={img} alt={label}/></div>
            <div className={styles.blockLabel}><span>{label}</span></div>
        </div>
    }

    render() {
        const {userId, project} = this.props;
        return <div className={styles.connect}>
            <div className={styles.title}><span>If your data is ready, choose a data source to connect.</span></div>
            <div className={styles.maxRow}><span>Maximum Data Size</span><div className={styles.mark}><span>?</span></div><span> : 50000 (rows) </span><a>Edit</a></div>
            <div className={styles.uploadRow}>
                {this.block("From Mr.One",sampleIcon)}
                <Uploader children={this.block("From Computer",localFileIcon)} onChange={this.upload} params={{userId, projectId: project.projectId}} onProgress={this.onProgress} />
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

    //更改flag使表格重新加载
    state = {
        flag: false,
        checkList: this.props.project.rawHeader.filter(r=>!this.props.project.dataHeader.includes(r)),
        showSelect: false
    }

    doEtl = () => {
        this.props.project.doEtl(this.state.checkList);
    }

    targetSelect = (value) => {
        this.props.project.updateProject({
            target: value
        })
        this.setState(Object.assign({},this.state,{
            flag: !this.state.flag,
            checkList: [...this.state.checkList.filter(v => v!==value)]
        }))
    }

    checked = (key ,e) => {
        if(e.target.checked){
            this.setState({
                flag: !this.state.flag,
                checkList: [...this.state.checkList, key]
            }) 
        }else{
            this.setState({
                flag: !this.state.flag,
                checkList: [...this.state.checkList.filter(v => v!==key)]
            }) 
        }
    }

    select = (key, e) => {
        this.props.project.dataType[key] = e.target.value
        // console.log(key, e.target.value)
        this.setState({
            flag: !this.state.flag
        })
    }

    toggleSelect = () => {
        this.setState({
            flag: !this.state.flag,
            showSelect: !this.state.showSelect
        })
    }

    cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
        const {uploadData, target, dataType, rawHeader} = this.props.project;
        const {checkList, showSelect} = this.state;

        /**
         * 根据showSelect变化
         * showSelect: true  显示勾选框
         * checkRow: 勾选框的行数
         * headerRow: 标题的行数
         * selectRow: 类型选择的行数
         * columnHeader: 表头的列数
         * rowHeader: 表头的行数
         */
        const index = {
            checkRow: showSelect?0:-1,
            headerRow: showSelect?1:0,
            selectRow: showSelect?2:1,
            columnHeader: 1,
            rowHeader: showSelect?3:2
        }

        //真实的数据行 && 真实的数据列
        const realRow = rowIndex - index.rowHeader
        const realColumn = columnIndex - index.columnHeader
        //内容, 标题, class
        let content, title, cn;

        //勾选框行
        if(rowIndex === index.checkRow){
            cn = styles.check;
            title = "";
            if(columnIndex === 0){
                content = "";
            }else{
                content = <Checkbox onChange={this.checked.bind(this, rawHeader[realColumn])} checked={false}></Checkbox>
                if(target === rawHeader[realColumn]){
                    cn = classnames(styles.check, styles.target);
                    content = "";
                }
                if(checkList.includes(rawHeader[realColumn])){
                    cn = classnames(styles.check, styles.checked);
                    content = <Checkbox onChange={this.checked.bind(this, rawHeader[realColumn])} checked={true}></Checkbox>
                }
            }
        //标题行
        }else if(rowIndex === index.headerRow){
            cn = styles.cell;
            if(columnIndex === 0){
                content = <span>row/header</span>;
                title = '';
            }else{
                content = <span>{rawHeader[realColumn]}</span>;
                title = rawHeader[realColumn];
                if(target === rawHeader[realColumn]){
                    cn = classnames(cn, styles.target);
                }
                if(checkList.includes(rawHeader[realColumn])){
                    cn = classnames(cn, styles.checked);
                }
            }
        //类型选择行
        }else if(rowIndex === index.selectRow){
            cn = styles.check;
            title = "";
            if(columnIndex === 0){
                content = "";
            }else{
                content = <select value={dataType[realColumn]} onChange={this.select.bind(this, realColumn)}>
                    <option value="categorical">Categorical</option>
                    <option value="numerical">Numerical</option>
                </select>
            }
        //其他为数据行
        }else{
            cn = styles.cell;
            //第一列为排序
            if(columnIndex === 0){
                //排序从1开始
                content = <span>{realRow + 1}</span>;
                title = realRow + 1;
            }else {
                content = <span>{uploadData[realRow][realColumn]}</span>;
                title = uploadData[realRow][realColumn];
                if(target === rawHeader[realColumn]){
                    cn = classnames(cn, styles.target);
                }
                if(this.state.checkList.includes(rawHeader[realColumn])){
                    cn = classnames(cn, styles.checked);
                }
            }
        }

        return (
            <div
                className={cn}
                key={key}
                style={style}
                title = {title}
            >
                {content}
            </div>
        ) 
    }

    render() {
        const {project} = this.props;
        const {uploadData, rawHeader, target, version} = project;
        const targetOption = {};

        //target选择列表
        rawHeader.forEach((h, i) => {
            targetOption[h] = h
        });

        return project && <div className={styles.schema}>
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
                    <div className={styles.schemaSelect} onClick={this.toggleSelect}>
                        <span>Select Undesirable Variables</span>
                    </div>
                </div>
                    <div className={styles.content}>
                        <AutoSizer>
                            {({height, width}) => { 
                                return <MultiGrid
                                    columnCount={uploadData[0].length + 1}
                                    columnWidth={110}
                                    height={height}
                                    rowCount={uploadData.length + 1}
                                    rowHeight={34}
                                    width={width}
                                    cellRenderer={this.cellRenderer}
                                    scrollToAlignment={this.state.flag}
                                    fixedRowCount={this.state.showSelect?3:2}
                                    fixedColumnCount={1}
                                    style={{border: "1px solid #ccc"}}
                                />
                            }}
                        </AutoSizer>
                    </div>
                </div>
            <ContinueButton onClick={this.doEtl} disabled={!target} text="Continue" />
        </div>
    }
}

class DataDeploy extends Component{
    // deploy = () => {
    //     this.props.project.deploy();
    // }

    // upload = (data) => {
    //     const {file} = data;

    //     this.props.project.initDeployFile(file.name)
    // }

    fastTrain = () => {
        this.props.project.nextMainStep(3);
        this.props.project.fastTrain();
    }

    render() {
        const {userId, project} = this.props;
        return project && <div>
            {/* <Uploader children={"file upload"} onChange={this.upload} params={{userId, projectId: project.projectId}} /> */}
            <div><button onClick={this.fastTrain}>Continue</button></div>
        </div>
    }
}

// @inject('projectStore')
@observer
class ProjectSide extends Component{
    enter = (step) => {
        this.props.enter(step)
    }

    render() {
        const {list, step} = this.props;
        return <div className={styles.dataSide}>
            <div className={styles.sideBox}>
                {list.map((v, k) => {
                    return <div className={classnames(styles.sideBlock, {
                        [styles.active]: step > k
                    })}>
                        {k!==0 && <div className={styles.sideLine}><span>-------------------------</span></div>}
                        <div className={styles.sideIcon} onClick={this.enter.bind(this, k+1)}>{imgs["data"+v+(step > k?"Active":"")]}</div>
                        <span onClick={this.enter.bind(this, k+1)}>Data<br/>{v}</span>
                    </div>
                })}
            </div>
        </div>
    }
}