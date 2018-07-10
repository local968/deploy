import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Uploader, Select, ContinueButton, ProjectSide } from '../Common';
import Papa from 'papaparse';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
import defileIcon from './define.svg';
import { AutoSizer, MultiGrid } from 'react-virtualized';
import { Checkbox, message } from 'antd';
import axios from 'axios';
// import { when } from 'mobx';

import dataConnectActive from './data_prograss_a.svg';
import dataSchemaActive from './data_schema_a.svg';
import dataSchema from './data_schema.svg';
import dataQualityActive from './data_quality_a.svg';
import dataQuality from './data_quality_d.svg';

// sample data
import bankSmall from '../../../sample/bank.train.small.csv';
import titanic from '../../../sample/titanic.train.csv';
import houseSmall from '../../../sample/regression.house.small.csv';
import gameSmall from '../../../sample/game.small.csv';
import dma1cSmall from '../../../sample/dma1c_dirty.small.csv';
import givemecreditSmall from '../../../sample/givemecredit_dirty.small.csv';

const fileMap = {
  'titanic.train.csv': titanic,
  'bank.train.csv': bankSmall,
  'regression.house.csv': houseSmall,
  'game.csv': gameSmall,
  'dma1c_dirty.csv': dma1cSmall,
  'givemecredit_dirty.csv': givemecreditSmall
};

const imgs = {
    dataSchema: <img src={dataSchema} alt="schema" />,
    dataQuality: <img src={dataQuality} alt="quality" />,
    dataConnectActive: <img src={dataConnectActive} alt="connect" />,
    dataSchemaActive: <img src={dataSchemaActive} alt="schema" />,
    dataQualityActive: <img src={dataQualityActive} alt="quality" />
}

const files = {
    RegressionSample: [
        { filename: 'regression.house.csv', size: '2.4M', desc: 'house features and price', target: 'price', usecase: 'house features and price' },
        { filename: 'game.csv', size: '1.6M', desc: 'game sales prediction', target: 'NA_Sales', usecase: 'video game sales' }
    ],
    ClassificationSample: [
        { filename: 'bank.train.csv', size: '366K', desc: 'Predict target customers for telemarketing of long term deposits product.', target: 'y', usecase: 'Retail bank telemarketing campaign data' },
        { filename: 'titanic.train.csv', size: '59K', desc: 'Predict if a passenger on the Titanic boat would survive or not.', target: 'survived', usecase: 'Titanic survival data' },
        { filename: 'dma1c_dirty.csv', size: '24M', desc: 'Predict diabetic patients blood suger cross control level', target: 'target8', usecase: 'Predict diabetic' },
        { filename: 'givemecredit_dirty.csv', size: '5.5MB', desc: 'Predict whether or not a loan should be granted', target: 'target', usecase: 'Give me credit' },
    ]
}

// @inject('userStore', 'projectStore')
@observer
export default class Data extends Component {
    constructor(props) {
        super(props);
        //     const {pid} = props.match.params || {};
        //     this.pid = pid ? parseInt(pid, 10) : 0;
        this.step = [
            {label:'Data Connect',value:"dataConnect"},
            {label:'Data Schema',value:"dataSchema"},
            {label:'Data Quality',value:"dataQuality"}
        ]

        //     when(
        //         () => props.userStore.userId && !props.userStore.isLoad,
        //         () => props.projectStore.init(props.userStore.userId, this.pid)
        //     )
    }
    // static step = ['Connect', 'Schema', 'Quality'];

    enter = (step) => {
        const { mainStep, lastSubStep, subStepActive } = this.props.project;

        if (step === subStepActive) return false;

        let maxStep = mainStep > 2 ? 3 : lastSubStep;

        if (step > maxStep) return false;

        this.props.project.nextSubStep(step, 2)
    }

    getChild = () => {
        const { userId, project } = this.props;
        const { curStep, subStepActive } = project || {};

        let subStep = curStep !== 2 ? 3 : subStepActive;

        switch (subStep) {
            case 1:
                return <DataConnect userId={userId} project={project} />;
            case 2:
                return <DataSchema project={project} />;
            case 3:
                return <DataQuality project={project} />;
            default:
                return;
        }
    }

    render() {
        const { project } = this.props;
        return <div className={styles.data}>
            {project && this.getChild()}
            {project && <ProjectSide enter={this.enter} list={this.step} step={project.subStepActive} imgs={imgs} />}
        </div>
    }
}

@observer
class DataConnect extends Component {
    state = {
        sample: false
    }

    upload = (data) => {
        const { file } = data;

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

    doEtl = () => {
        this.props.project.firstEtl();
    }

    showSample = () => {
        this.setState({
            sample: true
        })
    }

    hideSample = () => {
        this.setState({
            sample: false
        })
    }

    selectSample = (filename) => {
        const { userId, project } = this.props;
        axios("/api/sample", {
            method: "post",
            params: { userId, projectId: project.projectId, type: project.problemType.toLowerCase(), filename: filename }
        }).then(() => {
            this.doEtl();
        }, () => {
            message.error("sample file error, please choose again")
        })

        this.props.project.fastTrackInit(filename);

        Papa.parse(fileMap[filename], {
            download: true,
            complete: (result) => {
                if (result.errors.length !== 0) {
                    console.error('parse error: ', result.errors[0].message);
                    return;
                }
                this.props.project.newFileInit(result.data);
            } 
        });
        this.hideSample();
    }

    showSql = () => {

    }

    block = (label, img, onClick) => {

        return <div className={styles.uploadBlock} onClick={onClick}>
            <div className={styles.blockImg}><img src={img} alt={label} /></div>
            <div className={styles.blockLabel}><span>{label}</span></div>
        </div>
    }

    render() {
        const { userId, project } = this.props;
        return <div className={styles.connect}>
            <div className={styles.title}><span>If your data is ready, choose a data source to connect.</span></div>
            <div className={styles.maxRow}><span>Maximum Data Size</span><div className={styles.mark}><span>?</span></div><span> : 50000 (rows) </span><a>Edit</a></div>
            <div className={styles.uploadRow}>
                {this.block("From Mr.One", sampleIcon, this.showSample)}
                <Uploader children={this.block("From Computer", localFileIcon)} onChange={this.upload} onComplete={this.doEtl} params={{ userId, projectId: project.projectId }} onProgress={this.onProgress} />
                {this.block("From SQL", sqlIcon, this.showSql)}
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
                {this.block("From Mr.One", defileIcon)}
            </div>
            {this.state.sample && <DataSample project={project} onClose={this.hideSample} selectSample={this.selectSample} />}
        </div>;
    }
}

class DataSample extends Component {
    state = {
        select: -1
    }

    select = (index) => {
        this.setState({
            select: index
        })
    }

    submit = () => {
        const { project, selectSample } = this.props
        const sample = files[project.problemType + "Sample"];
        const file = sample[this.state.select]
        if(!file) return;
        selectSample(file.filename);
    }

    render() {
        const { project, onClose } = this.props
        const sample = files[project.problemType + "Sample"];
        return <div className={styles.sample}>
            <div className={styles.cover} onClick={onClose}></div>
            <div className={styles.sampleBlock}>
                <div className={styles.sampleTitle}><span>Choose Sample Data</span><div className={styles.close} onClick={onClose}><span>X</span></div></div>
                <div className={styles.sampleTop}><span>Select a sample data if you don’t have a dataset yet and want to try out the application.</span></div>
                <div className={styles.sampleTable}>
                    <div className={styles.sampleHeader}>
                        <div className={styles.sampleCell}><span>Use Case Name</span></div>
                        <div className={classnames(styles.sampleCell, styles.sampleDesc)}><span>Description</span></div>
                        <div className={styles.sampleCell}><span>File Name</span></div>
                        <div className={styles.sampleCell}><span>Target Variable</span></div>
                        <div className={styles.sampleCell}><span>Data Size</span></div>
                    </div>
                    {sample.map((row, index) => {
                        return <div className={styles.sampleRow} key={index} onClick={this.select.bind(null, index)}>
                            <div className={styles.sampleRadio}><input type="radio" name="sampleSelect" checked={this.state.select === index} onChange={this.select.bind(null, index)} /></div>
                            <div className={styles.sampleCell} title={row.usecase}><span>{row.usecase}</span></div>
                            <div className={classnames(styles.sampleCell, styles.sampleDesc)} title={row.desc}><span>{row.desc}</span></div>
                            <div className={styles.sampleCell} title={row.filename}><span>{row.filename}</span></div>
                            <div className={styles.sampleCell} title={row.target}><span>{row.target}</span></div>
                            <div className={styles.sampleCell} title={row.size}><span>{row.size}</span></div>
                        </div>
                    })}
                    <div className={styles.sampleButton}>
                        <button onClick={this.submit} className={styles.submit}><span>Load Sample Data</span></button>
                    </div>
                </div>
            </div>
        </div>
    }
}

@observer
class DataSchema extends Component {

    //更改flag使表格重新加载
    state = {
        flag: false,
        checkList: this.props.project.rawHeader.filter(r => !this.props.project.dataHeader.includes(r)),
        showSelect: false,
        error: false
    }

    doEtl = () => {
        this.props.project.doEtl(this.state.checkList);
    }

    targetSelect = (value) => {
        this.props.project.updateProject({
            target: value
        })
        this.setState(Object.assign({}, this.state, {
            flag: !this.state.flag,
            checkList: [...this.state.checkList.filter(v => v !== value)]
        }))
    }

    checked = (key, e) => {
        if (!e.target.checked) {
            this.setState({
                flag: !this.state.flag,
                checkList: [...this.state.checkList, key]
            })
        } else {
            this.setState({
                flag: !this.state.flag,
                checkList: [...this.state.checkList.filter(v => v !== key)]
            })
        }
    }

    select = (key, e) => {
        this.props.project.colType[key] = e.target.value
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

    hasError = () => {
        this.setState({
            flag: !this.state.flag,
            error: true
        })
    }

    cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
        const { uploadData, target, colType, rawHeader, headerTemp: {temp} } = this.props.project;
        const { checkList, showSelect } = this.state;
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
            checkRow: showSelect ? 0 : -1,
            headerRow: showSelect ? 1 : 0,
            selectRow: showSelect ? 2 : 1,
            columnHeader: 1,
            rowHeader: showSelect ? 3 : 2
        }

        //真实的数据行 && 真实的数据列
        const realRow = rowIndex - index.rowHeader
        const realColumn = columnIndex - index.columnHeader
        //内容, 标题, class
        let content, title, cn;

        //勾选框行
        if (rowIndex === index.checkRow) {
            cn = styles.check;
            title = "";
            if (columnIndex === 0) {
                content = "";
            } else {
                content = <Checkbox onChange={this.checked.bind(this, rawHeader[realColumn])} checked={true}></Checkbox>
                if (target && target === rawHeader[realColumn]) {
                    cn = classnames(styles.check, styles.target);
                    content = "";
                }
                if (checkList.includes(rawHeader[realColumn])) {
                    cn = classnames(styles.check, styles.checked);
                    content = <Checkbox onChange={this.checked.bind(this, rawHeader[realColumn])} checked={false}></Checkbox>
                }
            }
            //标题行
        } else if (rowIndex === index.headerRow) {
            cn = styles.titleCell;
            if (columnIndex === 0) {
                content = <span>row/header</span>;
                title = '';
            } else {
                content = <span>{rawHeader[realColumn]}</span>;
                title = rawHeader[realColumn];
                if (target && target === rawHeader[realColumn]) {
                    cn = classnames(cn, styles.target);
                }
                if (checkList.includes(rawHeader[realColumn])) {
                    cn = classnames(cn, styles.checked);
                }
                if (!rawHeader[realColumn]) {
                    cn = classnames(cn, styles.missed);
                }
                if (rawHeader[realColumn] && temp[rawHeader[realColumn]].length > 1) {
                    cn = classnames(cn, styles.duplicated);
                }
            }
            //类型选择行
        } else if (rowIndex === index.selectRow) {
            cn = styles.check;
            title = "";
            if (columnIndex === 0) {
                content = "";
            } else {
                let key = rawHeader[realColumn];
                if(!rawHeader[realColumn]) {
                    key = `Unnamed: ${realColumn}`
                }
                if (rawHeader[realColumn] && temp[rawHeader[realColumn]].length > 1) {
                    const tempIndex = temp[rawHeader[realColumn]].findIndex(c => c===realColumn);
                    const suffix = tempIndex===0?"":'.'+tempIndex;
                    key = rawHeader[realColumn]+suffix
                }
                content = <select value={colType[key]} onChange={this.select.bind(this, key)}>
                    <option value="Categorical">Categorical</option>
                    <option value="Numerical">Numerical</option>
                </select>
            }
            //其他为数据行
        } else {
            cn = styles.cell;
            //第一列为排序
            if (columnIndex === 0) {
                //排序从1开始
                content = <span>{realRow + 1}</span>;
                title = realRow + 1;
            } else {
                content = <span>{uploadData[realRow][realColumn]}</span>;
                title = uploadData[realRow][realColumn];
                if (target && target === rawHeader[realColumn]) {
                    cn = classnames(cn, styles.target);
                }
                if (this.state.checkList.includes(rawHeader[realColumn])) {
                    cn = classnames(cn, styles.checked);
                }
            }
        }

        return (
            <div
                className={cn}
                key={key}
                style={style}
                title={title}
            >
                {content}
            </div>
        )
    }

    render() {
        const { project } = this.props;
        const { uploadData, rawHeader, target, headerTemp: {isMissed, isDuplicated} } = project;
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
                        autoWidth={"1.6em"}
                        options={targetOption}
                        onChange={this.targetSelect}
                        value={target}
                        disabled={isMissed || isDuplicated}
                        selectOption={{ showSearch: true }}
                    />
                    {(isMissed || isDuplicated) ?
                    <div className={classnames(styles.schemaSelect,styles.disabled)}>
                        <span>Select Undesirable Variables</span>
                    </div>:
                    <div className={styles.schemaSelect} onClick={this.toggleSelect}>
                        <span>Select Undesirable Variables</span>
                    </div>
                    }
                    {isMissed && <div className={styles.schemaMissed} >
                        <div className={styles.errorBlock}></div>
                        <span>Missing</span>
                    </div>}
                    {isDuplicated && <div className={styles.schemaDuplicated} >
                        <div className={styles.errorBlock}></div>
                        <span>Duplicated Header</span>
                    </div>}
                </div>
                <div className={styles.content}>
                    <AutoSizer>
                        {({ height, width }) => {
                            return <MultiGrid
                                columnCount={uploadData[0].length + 1}
                                columnWidth={110}
                                height={height}
                                rowCount={uploadData.length + 1}
                                rowHeight={34}
                                width={width}
                                cellRenderer={this.cellRenderer}
                                scrollToAlignment={this.state.flag}
                                fixedRowCount={this.state.showSelect ? 3 : 2}
                                fixedColumnCount={1}
                                style={{ border: "1px solid #ccc" }}
                            />
                        }}
                    </AutoSizer>
                </div>
            </div>
            <ContinueButton onClick={this.doEtl} disabled={!target} text="Continue" />
        </div>
    }
}

class DataQuality extends Component {
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
        const { project } = this.props;
        return project && <div>
            {/* <Uploader children={"file upload"} onChange={this.upload} params={{userId, projectId: project.projectId}} /> */}
            <div><button onClick={this.fastTrain}>Continue</button></div>
        </div>
    }
}