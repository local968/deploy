import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ContinueButton } from '../../Common';
import { when } from 'mobx';
import * as d3 from 'd3';

@observer
export default class DataQuality extends Component {
    state = {
        visible: false,
        isLoad: false,
        edit: false
    }

    startTrain = () => {
        this.props.project.nextMainStep(3);
    }

    backToConnect = () => {
        this.props.project.nextSubStep(1, 2)
    }

    backToSchema = () => {
        this.props.project.nextSubStep(2, 2)
    }

    editFixes = () => {
        if(this.props.project.dataViews){
            this.setState({
                visible: true
            })
        }else{
            if(this.state.isLoad) return false;
            this.setState({
                isLoad: true
            })
            this.props.project.dataView()
            when(
                () => this.props.project.dataViews,
                () => {
                    this.setState({
                        visible: true,
                        isLoad: false
                    })
                }
            )
        }
        
    }

    closeFixes = () => {
        this.setState({
            visible: false
        })
    }

    editTarget = () => {
        this.setState({
            edit: true
        })
    }

    closeTarget = () => {
        this.setState({
            edit: false
        })
    }

    saveTargetFixes = () => {
        this.props.project.fixTarget()
        this.closeTarget();
    }

    saveDataFixes = () => {
        this.props.project.fixFillMethod()
        this.closeFixes();
    }

    render() {
        const { project } = this.props;
        const { issues, uploadData, target, colType, colMap, rawHeader, mismatchIndex, nullIndex, outlierIndex, problemType, totalLines, issueRows, totalRawLines} = project;
        const targetIndex = rawHeader.findIndex(h => h===target);
        const recomm = problemType === 'Classification' ? '2' : '10+';
        const percent = {
            missing: issueRows.nullRow.length * 100 / (totalRawLines || 1),
            mismatch: issueRows.mismatchRow.length * 100 / (totalRawLines || 1),
            outlier: issueRows.outlierRow.length * 100 / (totalRawLines || 1),
        }
        const targetPercent = {
            missing: nullIndex[target].length * 100 / (totalRawLines || 1),
            mismatch: mismatchIndex[target].length * 100 / (totalRawLines || 1),
            outlier: colType[target]==='Numerical'?outlierIndex[target].length * 100 / (totalRawLines || 1):0 ,
        }
        let num = 0;
        let arr = [];
        if(issues.targetIssue) {
            const unique = colType[target] === 'Categorical' ? Object.keys(colMap[target]).length : 10;
            arr.push(<TargetIssue num={num} backToConnect={this.backToConnect} backToSchema={this.backToSchema} editTarget={this.editTarget} unique={unique} recomm={recomm} key={num}/>);
            num++;
        }
        if(issues.rowIssue) {
            arr.push(<RowIssue num={num} backToConnect={this.backToConnect} totalRawLines={totalRawLines} key={num}/>);
            num++;
        }
        if(issues.dataIssue) {
            arr.push(<DataIssue num={num} backToConnect={this.backToConnect} editFixes={this.editFixes} issueRows={issueRows} totalLines={totalLines} percent={percent} key={num}/>);
            num++;
        }

        return <div className={styles.quality}>
            <div className={styles.issue}>
                {(issues.targetIssue || issues.rowIssue) ? 
                    <div className={styles.issueTitle}><span>Issue Found!</span></div> :
                    <div className={styles.cleanTitle}><span>No data issues were detected in your target variable!</span></div>}
                <div className={styles.issueBox}>
                    {issues.targetIssue && <div className={styles.issueText}>
                        <div className={styles.point}></div>
                        <span>Your target variable has {problemType==="Classification"?'more then two unique values':'very few unique values'}. It is not suitable for a {problemType.toLowerCase()} analysis</span>
                    </div>}
                    {issues.rowIssue && <div className={styles.issueText}>
                        <div className={styles.point}></div>
                        <span>Data size is too small</span>
                    </div>}
                    {issues.dataIssue && <div className={styles.issueText}>
                        <div className={styles.point}></div>
                        <span>Some data issues are found. Mr.One will fix them automatically, you can also fix them by clicking the colored cell.</span>
                    </div>}
                </div>
            </div>
            <div className={styles.typeBox}>
                <div className={styles.type}>
                    <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
                    <span>Data Type Mismatch</span>
                </div>
                <div className={styles.type}>
                    <div className={classnames(styles.typeBlock, styles.missing)}></div>
                    <span>Missing Value</span>
                </div>
                <div className={styles.type}>
                    <div className={classnames(styles.typeBlock, styles.outlier)}></div>
                    <span>Outlier</span>
                </div>
            </div>
            <div  className={styles.contentBox}>
                <div className={styles.list}>
                    <div className={styles.table}>
                        <div className={classnames(styles.cell, styles.target)}><span>Target Variable</span></div>
                        <div className={classnames(styles.cell, styles.label)}><span>{target}</span></div>
                        <div className={classnames(styles.cell, styles.select)}><select value={colType[target]} readOnly={true}>
                            <option value="Categorical">Categorical</option>
                            <option value="Numerical">Numerical</option>
                        </select></div>
                        <div className={classnames(styles.cell, styles.error)}>
                            {!!targetPercent.mismatch && <div className={classnames(styles.errorBlock, styles.mismatch)}><span>{targetPercent.mismatch.toFixed(2)}%</span></div>}
                            {!!targetPercent.missing && <div className={classnames(styles.errorBlock, styles.missing)}><span>{targetPercent.missing.toFixed(2)}%</span></div>}
                            {!!targetPercent.outlier && <div className={classnames(styles.errorBlock, styles.outlier)}><span>{targetPercent.outlier.toFixed(2)}%</span></div>}
                        </div>
                        <div className={styles.tableBody}>
                            {uploadData.map((v, k) => <div key={k} className={classnames(styles.cell, {
                                [styles.mismatch]: mismatchIndex[target].includes(k),
                                [styles.missing]: nullIndex[target].includes(k),
                                [styles.outlier]: colType[target] !== 'Categorical' && outlierIndex[target].includes(k)
                            })}><span>{v[targetIndex]}</span></div>)}
                        </div>
                    </div>
                    <ContinueButton onClick={this.startTrain} text='continue' width="100%" />
                </div>
                <div className={styles.content}>
                    {arr}
                </div>
            </div>
            {this.state.visible && <FixIssue project={project} closeFixes={this.closeFixes} saveDataFixes={this.saveDataFixes}/>}
            {this.state.edit && <SelectTarget project={project} closeTarget={this.closeTarget} saveTargetFixes={this.saveTargetFixes}/>}
        </div>
    }
}

class TargetIssue extends Component {
    render() {
        const {num, backToConnect, backToSchema, editTarget, unique, recomm} = this.props;
        return <div className={styles.block}>
            <div className={styles.name}><span>Target Variable Unique Value</span></div>
            <div className={styles.desc}>
                <div className={styles.info}>
                    <div className={styles.infoBox}>
                        <div className={styles.infoBlock}>
                            <div className={styles.num}><span>{unique}</span></div>
                            <div className={styles.text}><span>Your Unique Value</span></div>
                        </div>
                        <div className={styles.infoBlock}>
                            <div className={styles.num}><span>{recomm}</span></div>
                            <div className={styles.text}><span>Recommended</span></div>
                        </div>
                    </div>
                </div>
                <div className={styles.methods}>
                    {num === 0 && <div className={styles.reasonTitle}><span>Possible Reasons</span></div>}
                    <div className={styles.methodBox}>
                        <div className={styles.method}>
                            <div className={styles.reason}><span>It’s the wrong target variable</span></div>
                            <div className={styles.button} onClick={backToSchema}>
                                <button><span>Reselect target variable</span></button>
                            </div>
                        </div>
                        <div className={styles.method}>
                            <div className={styles.reason}><span>It’s general data quality issue</span></div>
                            <div className={styles.button} onClick={backToConnect}>
                                <button><span>Load a New Dataset</span></button>
                            </div>
                        </div>
                        <div className={styles.method}>
                            <div className={styles.reason}><span>The target variable has some noises</span></div>
                            <div className={styles.button} onClick={editTarget}>
                                <button><span>Fix it</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

class RowIssue extends Component {
    render() {
        const {num, backToConnect, totalRawLines} = this.props;
        return <div className={styles.block}>
            <div className={styles.name}><span>Data Size is too small</span></div>
            <div className={styles.desc}>
                <div className={styles.info}>
                    <div className={styles.progressBox}>
                        <div className={styles.progressText}><span>All Data ({totalRawLines} rows)</span><span>1000 rows(minimum)</span></div>
                        <div className={styles.progress} style={{width: totalRawLines/10 + "%"}}></div>
                    </div>
                </div>
                <div className={styles.methods}>
                    {num === 0 && <div className={styles.reasonTitle}><span>Possible Reasons</span></div>}
                    <div className={styles.methodBox}>
                        <div className={styles.method}>
                            <div className={styles.reason}><span>Data size >1000 rows is recommended</span></div>
                            <div className={styles.button} onClick={backToConnect}>
                                <button><span>Load a New Dataset</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

class DataIssue extends Component {
    render() {
        const {num, backToConnect, editFixes, issueRows, totalLines, percent} = this.props;
        // const cleanRows = totalLines - issueRows.errorRow.length;
        
        return <div className={styles.block}>
            <div className={styles.name}><span>Data issues are found</span></div>
            <div className={styles.desc}>
                <div className={styles.info}>
                    <div className={styles.progressBox}>
                        {!!issueRows.nullRow.length && <div className={styles.issueBlock}>
                            <div className={styles.left}>
                                <div className={styles.issueRow}><span>Missing Value ({issueRows.nullRow.length} rows) {percent.missing.toFixed(4)}%</span></div>
                                <div className={classnames(styles.progress, styles.missing)} style={{width: percent.missing<1?1:percent.missing + "%"}}></div>
                            </div>
                            <div className={styles.right}>
                                <span>Will be fixed</span>
                            </div>
                        </div>}
                        {!!issueRows.mismatchRow.length && <div className={styles.issueBlock}>
                            <div className={styles.left}>
                                <div className={styles.issueRow}><span>Data Type Mismatch ({issueRows.mismatchRow.length} rows) {percent.mismatch.toFixed(4)}%</span></div>
                                <div className={classnames(styles.progress, styles.mismatch)} style={{width: percent.mismatch<1?1:percent.mismatch + "%"}}></div>
                            </div>
                            <div className={styles.right}>
                                <span>Will be fixed</span>
                            </div>
                        </div>}
                        {!!issueRows.outlierRow.length && <div className={styles.issueBlock}>
                            <div className={styles.left}>
                                <div className={styles.issueRow}><span>Outlier ({issueRows.outlierRow.length} rows) {percent.outlier.toFixed(4)}%</span></div>
                                <div className={classnames(styles.progress, styles.outlier)} style={{width: percent.outlier<1?1:percent.outlier + "%"}}></div>
                            </div>
                            <div className={styles.right}>
                                <span>Will be ignore</span>
                            </div>
                        </div>}
                    </div>
                    {totalLines < 1000 && <div className={styles.progressBox}>
                        <div className={styles.progressText}><span>Clean Data ({totalLines} rows)</span><span>1000 rows(minimum)</span></div>
                        <div className={styles.progress} style={{width: totalLines/10 + "%"}}></div>
                    </div>}
                </div>
                
                <div className={styles.methods}>
                    {num === 0 && <div className={styles.reasonTitle}><span>Possible Reasons</span></div>}
                    <div className={styles.methodBox}>
                        <div className={styles.method}>
                            <div className={styles.reason}><span>Mr.One will fix these issues automaticly</span></div>
                            <div className={styles.button} onClick={editFixes}>
                                <button><span>Edit the Fixes</span></button>
                            </div>
                        </div>
                        {totalLines < 1000 && <div className={styles.method}>
                            <div className={styles.reason}><span>Data size will be smaller than the minimum size after delete</span></div>
                            <div className={styles.button} onClick={backToConnect}>
                                <button><span>Load a New Dataset</span></button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    }
}

class SelectTarget extends Component {
    state = {
        checked: [],
        canSave: false,
        map:{}
    }

    check = (e) => {
        let arr, canSave = false;
        if(e.target.checked && this.state.checked.length < 2) {
            arr = [...this.state.checked, e.target.value];
        }else if(!e.target.checked && this.state.checked.length > 0) {
            arr = this.state.checked.filter(t => t!==e.target.value);
        }else {
            return false;
        }
        if(arr.length === 2){
            canSave = true
        }
        this.setState({
            checked: arr,
            canSave
        })
    }

    save = () => {
        const {checked, map} = this.state;
        const {target, colMap} = this.props.project;
        let min,max;
        for(let key in colMap[target]) {
            if(checked.includes(key)) {
                if(!max){
                    max = {
                        k:key,
                        v:colMap[target][key]
                    }
                }else{
                    if(max.v > colMap[target][key]) {
                        min = {
                            k:key,
                            v:colMap[target][key]
                        }
                    }else{
                        min = max;
                        max = {
                            k:key,
                            v:colMap[target][key]
                        }
                    }
                }
            }
        }
        if(!max || !min){
            return false;
        }
        let targetMap = this.props.project.targetMap || {}
        targetMap[min.k] = 0;
        targetMap[max.k] = 1;
        for(let key in map) {
            if(map[key] === max.k) {
                targetMap[key] = 1
            }else if(map[key] === min.k) {
                targetMap[key] = 0
            }
        }
        this.props.project.targetMapTemp = targetMap;
        this.props.saveTargetFixes()
    }

    changeBind = (key, e) => {
        let map = this.state.map;
        map[key] = e.target.value;
        this.setState({
            map: map
        })
    }

    render() {
        const {closeTarget} = this.props;
        const {target, colMap} = this.props.project;

        return <div className={styles.fixes}>
            <div className={styles.cover} onClick={closeTarget}></div>
            <div className={styles.fixesBlock}>
                <div className={styles.fixesTitle}><span>How Mr.One Will Fix the Issues</span><div className={styles.close} onClick={closeTarget}><span>X</span></div></div>
                <div className={styles.fixesContent}>
                    <div className={styles.fixesBox}>
                        <div className={styles.fixesText}><span>Please select two valid values from all unique values in your target variable</span></div>
                        <div className={styles.fixesCheckBox}>
                            {Object.keys(colMap[target]).map((t, i) => {
                                return <div className={styles.fixesCheck} key={i}>
                                    <input type='checkbox' value={t} checked={this.state.checked.includes(t)} onChange={this.check}/>
                                    <span>{t}</span>
                                </div>
                            })}
                        </div>
                    </div>
                    {this.state.canSave && <div className={styles.fixesBox}>
                        <div className={styles.fixesText}><span>Please map the other values to valid ones if they are equivalent. The rest will be deleted</span></div>
                        <div className={styles.fixesSelectBox}>
                            {Object.keys(colMap[target]).map((t, i) => {
                                if(this.state.checked.includes(t)) return null;
                                return <div className={styles.fixesSelect} key={i}>
                                    <span title={t}>{t}: </span>
                                    <select value={this.state.map[t]} onChange={this.changeBind.bind(null, t)}>
                                        <option value="drop">Drop</option>
                                        <option value={this.state.checked[0]}>{this.state.checked[0]}</option>
                                        <option value={this.state.checked[1]}>{this.state.checked[1]}</option>
                                    </select>
                                </div>
                            })}
                        </div>
                    </div>}
                </div>
                <div className={styles.fixesBottom}>
                    <button className={classnames(styles.save, {
                        [styles.disabled]: !this.state.canSave
                    })} onClick={this.save} disabled={!this.state.canSave} ><span>save</span></button>
                    <button className={styles.cancel} onClick={closeTarget}><span>cancel</span></button>
                </div>
            </div>
        </div>
    }
}


class FixIssue extends Component {
    state = {
        canSave: false,
        visible: false,
        editKey: ""
    }

    editRange = (key) => {
        this.setState({
            visible: true,
            editKey: key
        })
    }

    closeEdit = () => {
        this.setState({
            visible: false,
            editKey: ''
        })
    }

    saveEdit = (data) => {
        const {editKey} = this.state;
        this.props.project.outlierDict[editKey] = data;
        this.setState({
            visible: false,
            editKey: '',
            canSave: true
        })
    }

    nullSelect = (key, e) => {
        this.props.project.nullFillMethod[key] = e.target.value;
        this.setState({
            canSave: true
        })
    }

    mismatchSelect = (key, e) => {
        this.props.project.mismatchFillMethod[key] = e.target.value;
        this.setState({
            canSave: true
        })
    }

    outlierSelect = (key, e) => {
        this.props.project.outlierFillMethod[key] = e.target.value;
        this.setState({
            canSave: true
        })
    }

    renderContent = () => {
        const {project} = this.props;
        const {issueRows, colType, mismatchIndex, nullIndex, outlierIndex, mismatchFillMethod, nullFillMethod, outlierFillMethod, totalRawLines, dataViews, outlierRange, outlierDict} = project
        return <div className={styles.fixesContent}>
            {!!issueRows.mismatchRow.length && <div className={styles.fixesArea}>
                <div className={styles.typeBox}>
                    <div className={styles.type}>
                        <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
                        <span>Data Type Mismatch</span>
                    </div>
                </div>
                <div className={styles.fixesTable}>
                    <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
                        <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Variable Name</span></div>
                        <div className={styles.fixesTd}><span>Data Type</span></div>
                        <div className={styles.fixesTd}><span>Quantity of Mismatch</span></div>
                        <div className={styles.fixesTd}><span>Mean</span></div>
                        <div className={styles.fixesTd}><span>Median</span></div>
                        <div className={styles.fixesTd}><span>Most Frequent Value</span></div>
                        <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Fix</span></div>
                    </div>
                    <div className={styles.fixesBody}>
                        {Object.keys(mismatchIndex).map((k, i) => {
                            if(!mismatchIndex[k].length){
                                return null;
                            }
                            return <div className={styles.fixesRow} key={i}>
                                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span>{k}</span></div>
                                <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                                    <option value="Categorical">Categorical</option>
                                    <option value="Numerical">Numerical</option>
                                </select></div>
                                <div className={styles.fixesCell}><span>{mismatchIndex[k].length} ({(mismatchIndex[k].length / (totalRawLines||1)).toFixed(4)}%)</span></div>
                                <div className={styles.fixesCell}><span title={dataViews[k].mean}>{dataViews[k].mean}</span></div>
                                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                                <div className={styles.fixesCell}><span title={dataViews[k].mode}>{dataViews[k].mode}</span></div>
                                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={mismatchFillMethod[k]} onChange={this.mismatchSelect.bind(null,k)}>
                                    {colType[k]==='Categorical'?<option value="mode">Replace with most frequent value</option>:<option value="mean">Replace with mean value</option>}
                                    <option value="drop">Delete the row</option>
                                    <option value="min">Replace with min value</option>
                                    <option value="max">Replace with max value</option>
                                    <option value="max+1">Replace with max+1 value</option>
                                    {colType[k]==='Categorical'?<option value="mean">Replace with mean value</option>:<option value="mode">Replace with most frequent value</option>}
                                    <option value="median">Replace with median value</option>
                                </select></div>
                            </div>
                        })}
                    </div>  
                </div>
            </div>}
            {!!issueRows.nullRow.length && <div className={styles.fixesArea}>
                <div className={styles.typeBox}>
                    <div className={styles.type}>
                        <div className={classnames(styles.typeBlock, styles.missing)}></div>
                        <span>Missing Value</span>
                    </div>
                </div>
                <div className={styles.fixesTable}>
                    <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
                        <div className={styles.fixesTd}><span>Variable Name</span></div>
                        <div className={styles.fixesTd}><span>Missing Reason</span></div>
                        <div className={styles.fixesTd}><span>Data Type</span></div>
                        <div className={styles.fixesTd}><span>Quantity of Missing Value</span></div>
                        <div className={styles.fixesTd}><span>Mean</span></div>
                        <div className={styles.fixesTd}><span>Median</span></div>
                        <div className={styles.fixesTd}><span>Most Frequent Value</span></div>
                        <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Fix</span></div>
                    </div>
                    <div className={styles.fixesBody}>
                    {Object.keys(nullIndex).map((k, i) => {
                        if(!nullIndex[k].length){
                            return null;
                        }
                        return <div className={styles.fixesRow} key={i}>
                            <div className={styles.fixesCell}><span>{k}</span></div>
                            <div className={styles.fixesCell}><span>I don`t know</span></div>
                            <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                                <option value="Categorical">Categorical</option>
                                <option value="Numerical">Numerical</option>
                            </select></div>
                            <div className={styles.fixesCell}><span>{nullIndex[k].length} ({(nullIndex[k].length / (totalRawLines||1)).toFixed(4)}%)</span></div>
                            <div className={styles.fixesCell}><span title={dataViews[k].mean}>{dataViews[k].mean}</span></div>
                            <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                            <div className={styles.fixesCell}><span title={dataViews[k].mode}>{dataViews[k].mode}</span></div>
                            <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={nullFillMethod[k]} onChange={this.nullSelect.bind(null,k)}>
                                {colType[k]==='Categorical'?<option value="mode">Replace with most frequent value</option>:<option value="mean">Replace with mean value</option>}
                                <option value="drop">Delete the row</option>
                                <option value="ignore">Do Nothing</option>
                                <option value="min">Replace with min value</option>
                                <option value="max">Replace with max value</option>
                                <option value="max+1">Replace with max+1 value</option>
                                {colType[k]==='Categorical'?<option value="mean">Replace with mean value</option>:<option value="mode">Replace with most frequent value</option>}
                                <option value="median">Replace with median value</option>
                            </select></div>
                        </div>
                    })}
                    </div>
                </div>
            </div>}
            {!!issueRows.outlierRow.length && <div className={styles.fixesArea}>
                <div className={styles.typeBox}>
                    <div className={styles.type}>
                        <div className={classnames(styles.typeBlock, styles.outlier)}></div>
                        <span>Outlier</span>
                    </div>
                </div>
                <div className={styles.fixesTable}>
                    <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
                        <div className={styles.fixesTd}><span>Variable Name</span></div>
                        <div className={styles.fixesTd}><span>Valid Range</span></div>
                        <div className={styles.fixesTd}><span>Data Type</span></div>
                        <div className={styles.fixesTd}><span>Quantity of Outlier</span></div>
                        <div className={styles.fixesTd}><span>Mean</span></div>
                        <div className={styles.fixesTd}><span>Median</span></div>
                        <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Fix</span></div>
                    </div>
                    <div className={styles.fixesBody}>
                    {Object.keys(outlierIndex).map((k, i) => {
                        if(!outlierIndex[k].length){
                            return null;
                        }
                        const outlier = outlierDict[k]?outlierDict[k]:outlierRange[k];
                        const isShow = colType[k]==='Numerical';
                        return isShow && <div className={styles.fixesRow} key={i}>
                            <div className={styles.fixesCell}><span>{k}</span></div>
                            <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                                <span title={outlier[0].toFixed(2)+"-"+outlier[1].toFixed(2)}>
                                    {outlier[0].toFixed(2)+"-"+outlier[1].toFixed(2)}
                                </span><span className={styles.fixesEdit} onClick={this.editRange.bind(null,k)}>edit</span>
                            </div>
                            <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                                <option value="Categorical">Categorical</option>
                                <option value="Numerical">Numerical</option>
                            </select></div>
                            <div className={styles.fixesCell}><span>{outlierIndex[k].length} ({(outlierIndex[k].length / (totalRawLines||1)).toFixed(4)}%)</span></div>
                            <div className={styles.fixesCell}><span title={dataViews[k].mean} >{dataViews[k].mean}</span></div>
                            <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                            <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={outlierFillMethod[k]} onChange={this.outlierSelect.bind(null,k)}>
                                <option value="ignore">Do Nothing</option>
                                <option value="drop">Delete the row</option>
                                <option value="min">Replace with min value</option>
                                <option value="max">Replace with max value</option>
                                <option value="max+1">Replace with max+1 value</option>
                                <option value="mean">Replace with mean value</option>
                                <option value="median">Replace with median value</option>
                                <option value="mode">Replace with most frequent value</option>
                            </select></div>
                        </div>
                    })}
                    </div>
                </div>
            </div>}
        </div>
    }

    render() {
        const {closeFixes, project, saveDataFixes} = this.props;
        return <div className={styles.fixes}>
            <div className={styles.cover} onClick={closeFixes}></div>
            <div className={styles.fixesBlock}>
                <div className={styles.fixesTitle}><span>How Mr.One Will Fix the Issues</span><div className={styles.close} onClick={closeFixes}><span>X</span></div></div>
                {this.renderContent()}
                <div className={styles.fixesBottom}>
                    <button className={classnames(styles.save, {
                        [styles.disabled]: !this.state.canSave
                    })} onClick={saveDataFixes} disabled={!this.state.canSave} ><span>save</span></button>
                    <button className={styles.cancel} onClick={closeFixes}><span>cancel</span></button>
                </div>
            </div>
            {this.state.visible && <EditOutLier width={800} height={400} saveEdit={this.saveEdit} closeEdit={this.closeEdit} outlierRange={project.outlierRange[this.state.editKey]} outlierDict={project.outlierDict[this.state.editKey]} numberBins={project.numberBins[this.state.editKey]} />}
        </div>
    }
}

class EditOutLier extends Component{

    state = {
        min: this.props.outlierDict?this.props.outlierDict[0]:this.props.outlierRange[0], 
        max: this.props.outlierDict?this.props.outlierDict[1]:this.props.outlierRange[1]
    }

    componentDidMount() {
        this.d3Chart()
    }    

    componentDidUpdate() {
        this.d3Chart()
    }

    d3Chart = () => {
        d3.select(`.${styles.d3Chart} svg`).remove();
        const {width, height, numberBins} = this.props;
        let {min, max} = this.state;
        const [y, x] = numberBins;
        const padding = {left: 50, bottom: 30, right: 5, top: 100};

        const realHeight = height - padding.bottom - padding.top;
        const realWidth = width - padding.left - padding.right;
        //添加一个 SVG 画布   
        const svg = d3.select(`.${styles.d3Chart}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr('transform', `translate(${padding.left}, 0)`);

        const maxH = d3.max(y);
        const minX = x[0];
        const maxX = x[x.length-1];
        const dataset = [];

        const offset = (maxX - minX)/4;

        //x轴的比例尺
        var xScale = d3.scaleLinear()
            .range([0, realWidth])
            .domain([minX - offset, maxX + offset])
            .clamp(true);

        //y轴的比例尺
        var yScale = d3.scaleLinear()
            .range([realHeight, 0])
            .domain([0, maxH])
            .clamp(true);
        
        //定义x轴
        var xAxis = d3.axisBottom(xScale);

        //定义y轴
        var yAxis = d3.axisLeft(yScale);

        //添加x轴
        svg.append("g")
        .attr("class",`${styles.axis}`)
        .attr("transform",`translate(0, ${realHeight + padding.top})`)
        .call(xAxis); 

        //添加y轴
        svg.append("g")
        .attr("class",`${styles.axis}`)
        .attr("transform",`translate(0, ${padding.top})`)
        .call(yAxis);

        const drawDrag = () => {
            const minDrag = d3.drag()
                .on('drag', () => {
                    min = xScale.invert(d3.event.x)
                    minRect.attr('width', xScale(min))
                    minLine.attr('x1', xScale(min))
                        .attr('x2', xScale(min))
                    minCircle.attr('cx', xScale(min))
                    minText.attr('x', xScale(min))
                        .text(min.toFixed(2))
                    if(Math.abs(xScale(max) - xScale(min)) < 40) {
                        maxCircle.attr('cy', padding.top-57)
                        maxText.attr('y', padding.top-53)
                    }else{
                        maxCircle.attr('cy', padding.top-17)
                        maxText.attr('y', padding.top-13)
                    }
                    
                    drawRect()
                })
                .on('end', () => {
                    this.setState({
                        min: xScale.invert(d3.event.x)
                    })
                });

            let minDragBlock = svg.append('g');    
            let minRect = minDragBlock.append('rect')
                .attr('class', `${styles.dragRect}`)
                .attr('x', xScale(minX - offset))
                .attr('y', yScale(maxH) + padding.top)
                .attr('width', xScale(min) - xScale(minX - offset))
                .attr('height', realHeight)

            let minLine = minDragBlock.append('line')
                .attr('class', `${styles.dragLine}`)
                .attr('x1', xScale(min)- xScale(minX - offset))
                .attr('y1', yScale(maxH) + padding.top)
                .attr('x2', xScale(min)- xScale(minX - offset))
                .attr('y2', realHeight + padding.top)

            let minCircle = minDragBlock.append('circle')
                .attr('class', `${styles.dragCircle}`)
                .attr('cx', xScale(min))
                .attr('cy', padding.top-17)
                .attr('r', 20)
                .attr('fill', '#c7f1ee')
                .call(minDrag);

            let minText = minDragBlock.append('text')
                .attr('class', `${styles.dragText}`)
                .text(min.toFixed(2))
                .attr('x', xScale(min))
                .attr('y', padding.top-13)
                .call(minDrag);

            const maxDrag = d3.drag()
                .on('drag', () => {
                    max = xScale.invert(d3.event.x)
                    maxRect.attr('x', xScale(max))
                        .attr('width', xScale(maxX + offset) - xScale(max))
                    maxLine.attr('x1', xScale(max))
                        .attr('x2', xScale(max))
                    maxCircle.attr('cx', xScale(max))
                    maxText.attr('x', xScale(max))
                        .text(max.toFixed(2))
                    if(Math.abs(xScale(max) - xScale(min)) < 40) {
                        maxCircle.attr('cy', padding.top-57)
                        maxText.attr('y', padding.top-53)
                    }else{
                        maxCircle.attr('cy', padding.top-17)
                        maxText.attr('y', padding.top-13)
                    }
                    drawRect()
                })
                .on('end', () => {               
                    this.setState({
                        max: xScale.invert(d3.event.x)
                    })
                });

            let maxDragBlock = svg.append('g');    
            let maxRect = maxDragBlock.append('rect')
                .attr('class', `${styles.dragRect}`)
                .attr('x', xScale(max))
                .attr('y', yScale(maxH) + padding.top)
                .attr('width', xScale(maxX + offset) - xScale(max))
                .attr('height', realHeight)

            let maxLine = maxDragBlock.append('line')
                .attr('class', `${styles.dragLine}`)
                .attr('x1', xScale(max))
                .attr('y1', yScale(maxH) + padding.top)
                .attr('x2', xScale(max))
                .attr('y2', realHeight + padding.top);

            let maxCircle  = maxDragBlock.append('circle')
                .attr('class', `${styles.dragCircle}`)
                .attr('cx', xScale(max))
                .attr('cy', () => {
                    if(Math.abs(xScale(max) - xScale(min))<40){
                        return padding.top-57
                    }
                    return padding.top-17
                })
                .attr('r', 20)
                .attr('fill', '#ffd287')
                .call(maxDrag);

            let maxText = maxDragBlock.append('text')
                .attr('class', `${styles.dragText}`)
                .text(max.toFixed(2))
                .attr('x', xScale(max))
                .attr('y', () => {
                    if(Math.abs(xScale(max) - xScale(min))<40){
                        return padding.top-53
                    }
                    return padding.top-13
                })
                .call(maxDrag);

        }

        //初始化拖动
        drawDrag()

        //添加矩形元素
        const drawRect = () => {
            // 处理dataset数据
            for(let i = 1; i < x.length;i++){
                if(x[i] <= min || x[i-1] >= max) {
                    dataset.push({
                        x: xScale(x[i-1]),
                        y: yScale(y[i-1]) + padding.top,
                        width: xScale(Math.abs(x[i] - x[i-1])) - xScale(0),
                        class: styles.outer
                    })
                }else if(x[i] <= max && x[i-1] >= min) {
                    dataset.push({
                        x: xScale(x[i-1]),
                        y: yScale(y[i-1]) + padding.top,
                        width: xScale(Math.abs(x[i] - x[i-1])) - xScale(0),
                        class: styles.rect
                    })
                }else if(x[i] > max && x[i-1] < max && x[i-1]>min){
                    const left = xScale(Math.abs(x[i-1] - max)) - xScale(0)
                    dataset.push({
                        x: xScale(x[i-1]),
                        y: yScale(y[i-1]) + padding.top,
                        width: left,
                        class: styles.rect
                    })
                    dataset.push({
                        x: xScale(x[i-1]) + left,
                        y: yScale(y[i-1]) + padding.top,
                        width: xScale(Math.abs(x[i] - x[i-1])) - xScale(0) - left,
                        class: styles.outer
                    })
                }else if(x[i] > min && x[i-1] < min && x[i] < max){
                    const left = xScale(Math.abs(x[i-1] - min)) - xScale(0)
                    dataset.push({
                        x: xScale(x[i-1]),
                        y: yScale(y[i-1]) + padding.top,
                        width: left,
                        class: styles.outer
                    })
                    dataset.push({
                        x: xScale(x[i-1]) + left,
                        y: yScale(y[i-1]) + padding.top,
                        width: xScale(Math.abs(x[i] - x[i-1])) - xScale(0) - left,
                        class: styles.rect
                    })
                }else{
                    if(min > max) {
                        dataset.push({
                            x: xScale(x[i-1]),
                            y: yScale(y[i-1]) + padding.top,
                            width: xScale(Math.abs(x[i] - x[i-1])) - xScale(0),
                            class: styles.outer
                        })
                    }else{
                        const left = xScale(Math.abs(x[i-1] - min)) - xScale(0);
                        const middle = xScale(Math.abs(max - min)) - xScale(0);
                        dataset.push({
                            x: xScale(x[i-1]),
                            y: yScale(y[i-1]) + padding.top,
                            width: left,
                            class: styles.outer
                        })
                        dataset.push({
                            x: xScale(x[i-1]) + left,
                            y: yScale(y[i-1]) + padding.top,
                            width: middle,
                            class: styles.rect
                        })
                        dataset.push({
                            x: xScale(x[i-1]) + left + middle,
                            y: yScale(y[i-1]) + padding.top,
                            width: xScale(Math.abs(x[i] - x[i-1])) - xScale(0) - left - middle,
                            class: styles.outer
                        })
                    }
                }
            }

            var rects = svg.selectAll(`.${styles.rect}`);
            rects.remove();
            rects.data(dataset)
                .enter()
                .append("rect")
                .attr("class",(d) => d.class)
                // .attr("transform",`translate(0,${padding.top})`)
                .attr("x", (d) => d.x)
                .attr("y", (d) => d.y)
                .attr("width", (d) => d.width)
                .attr("height", (d) => realHeight - d.y + padding.top);
        }

        //添加矩形元素
        drawRect()
    }

    changeMin = (e) => {
        let num = e.target.value;
        if((num || num === 0) && !isNaN(num)){
            this.setState({
                min: parseFloat(num)
            })
        }
    }

    changeMax = (e) => {
        let num = e.target.value;
        if((num || num === 0) && !isNaN(num)){
            this.setState({
                max: parseFloat(num)
            })
        }
    }

    reset = () => {
        this.setState({
            min: this.props.outlierRange[0], 
            max: this.props.outlierRange[1]
        })
    }

    apply = () => {
        const {min, max} = this.state
        this.props.saveEdit([min, max])
    }

    render() {
        const {closeEdit} = this.props;
        return <div className={styles.fixes}>
            <div className={styles.cover} onClick={closeEdit}></div>
            <div className={styles.fixesBlock}>
                <div className={styles.fixesTitle}><span>Outlier</span><div className={styles.close} onClick={closeEdit}><span>X</span></div></div>
                <div className={styles.fixesContent}>
                    <div className={styles.outlierBox}>
                        <div className={styles.outlierBlock}>
                            <div className={styles.outliertext}><span>min</span></div>
                            <div className={styles.input}><input value={this.state.min.toFixed(2)} onChange={this.changeMin}/></div>
                        </div>
                        <div className={styles.outlierBlock}>
                            <div className={styles.outliertext}><span>max</span></div>
                            <div className={styles.input}><input value={this.state.max.toFixed(2)} onChange={this.changeMax}/></div>
                        </div>
                        <div className={styles.outlierBlock}><button onClick={this.reset}><span>Reset to default</span></button></div>
                    </div>
                    <div className={styles.d3Chart}></div>
                    <div className={styles.fixesBottom}>
                        <button className={styles.save} onClick={this.apply} ><span>Apply</span></button>
                        <button className={styles.cancel} onClick={closeEdit}><span>cancel</span></button>
                    </div>
                </div>
            </div>
        </div>
    }
}