import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ContinueButton } from '../../Common';

@observer
export default class DataQuality extends Component {
    state = {
        visible: false
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
        this.setState({
            visible: true
        })
    }

    closeFixes = () => {
        this.setState({
            visible: false
        })
    }

    saveClassificationFixes = (targetMap) => {
        this.props.project.fixClassification(targetMap)
        this.closeFixes();
    }

    saveRegressionFixes = () => {
        this.props.project.fixRegression()
        this.closeFixes();
    }

    render() {
        const { project } = this.props;
        const { issues, uploadData, target, colType, colMap, rawHeader, mismatchIndex, nullIndex, outlierIndex, mismatchFillMethod, nullFillMethod, outlierFillMethod, problemType, totalLines, issueRows, totalRawLines} = project;
        const targetIndex = rawHeader.findIndex(h => h===target);
        const recomm = problemType === 'Classification' ? '2' : '10+';
        const fixMethod = {
            missing: nullFillMethod[target] === 'drop' ? 'deleted' : 'fixed',
            mismatch: mismatchFillMethod[target] === 'drop' ? 'deleted' : 'fixed',
            outlier: outlierFillMethod[target] === 'drop' ? 'deleted' : 'fixed',
        }
        let num = 0;
        let arr = [];
        if(issues.targetIssue) {
            const unique = colType[target] === 'Categorical' ? Object.keys(colMap[target]).length : 10;
            arr.push(<TargetIssue num={num} backToConnect={this.backToConnect} backToSchema={this.backToSchema} unique={unique} recomm={recomm} key={num}/>);
            num++;
        }
        if(issues.rowIssue) {
            arr.push(<RowIssue num={num} backToConnect={this.backToConnect} totalRawLines={totalRawLines} key={num}/>);
            num++;
        }
        if(issues.dataIssue) {
            arr.push(<DataIssue num={num} backToConnect={this.backToConnect} editFixes={this.editFixes} issueRows={issueRows} totalLines={totalLines} totalRawLines={totalRawLines} fixMethod={fixMethod} type={colType[target]} key={num}/>);
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
                        <div className={classnames(styles.cell, styles.error)}><span>123123</span></div>
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
            {this.state.visible && <FixIssue project={project} closeFixes={this.closeFixes} saveClassificationFixes={this.saveClassificationFixes} saveRegressionFixes={this.saveRegressionFixes}/>}
        </div>
    }
}

class TargetIssue extends Component {
    render() {
        const {num, backToConnect, backToSchema, unique, recomm} = this.props;
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
        const {num, backToConnect, editFixes, issueRows, totalLines, fixMethod, type, totalRawLines} = this.props;
        // const cleanRows = totalLines - issueRows.errorRow.length;
        const percent = {
            missing: issueRows.nullRow.length * 100 / (totalRawLines || 1),
            mismatch: issueRows.mismatchRow.length * 100 / (totalRawLines || 1),
            outlier: issueRows.outlierRow.length * 100 / (totalRawLines || 1),
        }
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
                                <span>Will be {fixMethod.missing}</span>
                            </div>
                        </div>}
                        {!!issueRows.mismatchRow.length && <div className={styles.issueBlock}>
                            <div className={styles.left}>
                                <div className={styles.issueRow}><span>Data Type Mismatch ({issueRows.mismatchRow.length} rows) {percent.mismatch.toFixed(4)}%</span></div>
                                <div className={classnames(styles.progress, styles.mismatch)} style={{width: percent.mismatch<1?1:percent.mismatch + "%"}}></div>
                            </div>
                            <div className={styles.right}>
                                <span>Will be {fixMethod.mismatch}</span>
                            </div>
                        </div>}
                        {type!=='Categorical' && !!issueRows.outlierRow.length && <div className={styles.issueBlock}>
                            <div className={styles.left}>
                                <div className={styles.issueRow}><span>Outlier ({issueRows.outlierRow.length} rows) {percent.outlier.toFixed(4)}%</span></div>
                                <div className={classnames(styles.progress, styles.outlier)} style={{width: percent.outlier<1?1:percent.outlier + "%"}}></div>
                            </div>
                            <div className={styles.right}>
                                <span>Will be {fixMethod.outlier}</span>
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

class FixIssue extends Component {
    state = {
        checked: [],
        canSave: false
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

    editRange = () => {

    }

    select = (type, key, e) => {
        console.log(type, key, e.target.value)
    }

    save = () => {
        const {project, saveClassificationFixes, saveRegressionFixes} = this.props;
        const {problemType} = project;
        if(!this.state.canSave){
            return false;
        }
        if(problemType === 'Classification'){
            let data = {}
            this.state.checked.forEach((k, i) => {
                data[k] = i
            });
            saveClassificationFixes(data)
        }else{
            saveRegressionFixes()
        }
    }

    renderContent = () => {
        const {project} = this.props;
        const {problemType} = project;
        if(problemType === 'Classification'){
            const {target, colMap} = project;
            return <div className={styles.fixesContent}>
                <div className={styles.fixesBox}>
                    {Object.keys(colMap[target]).map((t, i) => {
                        return <div className={styles.fixesCheck} key={i}>
                            <input type='checkbox' value={t} checked={this.state.checked.includes(t)} onChange={this.check}/>
                            <span>{t}</span>
                        </div>
                    })}
                </div>
            </div>
        }else{
            const {issueRows, colType, target, mismatchIndex, nullIndex, outlierIndex, mismatchFillMethod, nullFillMethod, outlierFillMethod, totalLines} = project
            const total = totalLines + issueRows.errorRow.length;
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
                                    <div className={styles.fixesCell}><select value={colType[target]} readOnly={true}>
                                        <option value="Categorical">Categorical</option>
                                        <option value="Numerical">Numerical</option>
                                    </select></div>
                                    <div className={styles.fixesCell}><span>{mismatchIndex[k].length} ({(mismatchIndex[k].length / total).toFixed(4)}%)</span></div>
                                    <div className={styles.fixesCell}><span>4567</span></div>
                                    <div className={styles.fixesCell}><span>5644</span></div>
                                    <div className={styles.fixesCell}><span>5644</span></div>
                                    <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={mismatchFillMethod[k]} onChange={this.select.bind(null,'missing',k)}>
                                        <option value="Categorical">Categorical</option>
                                        <option value="Numerical">Numerical</option>
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
                                <div className={styles.fixesCell}><span>1867 - 8976</span></div>
                                <div className={styles.fixesCell}><select value={colType[target]} readOnly={true}>
                                    <option value="Categorical">Categorical</option>
                                    <option value="Numerical">Numerical</option>
                                </select></div>
                                <div className={styles.fixesCell}><span>{nullIndex[k].length} ({(nullIndex[k].length / total).toFixed(4)}%)</span></div>
                                <div className={styles.fixesCell}><span>4567</span></div>
                                <div className={styles.fixesCell}><span>5644</span></div>
                                <div className={styles.fixesCell}><span>5644</span></div>
                                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={nullFillMethod[k]} onChange={this.select.bind(null,'missing',k)}>
                                    <option value="Categorical">Categorical</option>
                                    <option value="Numerical">Numerical</option>
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
                            return <div className={styles.fixesRow} key={i}>
                                <div className={styles.fixesCell}><span>{k}</span></div>
                                <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                                    <span>1867 - 8976</span><span className={styles.fixesEdit} onClick={this.editRange}>edit</span>
                                </div>
                                <div className={styles.fixesCell}><select value={colType[target]} readOnly={true}>
                                    <option value="Categorical">Categorical</option>
                                    <option value="Numerical">Numerical</option>
                                </select></div>
                                <div className={styles.fixesCell}><span>{outlierIndex[k].length} ({(outlierIndex[k].length / total).toFixed(4)}%)</span></div>
                                <div className={styles.fixesCell}><span>4567</span></div>
                                <div className={styles.fixesCell}><span>5644</span></div>
                                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={outlierFillMethod[k]} onChange={this.select.bind(null,'missing',k)}>
                                    <option value="Categorical">Categorical</option>
                                    <option value="Numerical">Numerical</option>
                                </select></div>
                            </div>
                        })}
                        </div>
                    </div>
                </div>}
            </div>
        }
    }

    render() {
        const {closeFixes} = this.props;
        return <div className={styles.fixes}>
            <div className={styles.cover} onClick={closeFixes}></div>
            <div className={styles.fixesBlock}>
                <div className={styles.fixesTitle}><span>Fixing data issue</span><div className={styles.close}><span>X</span></div></div>
                {this.renderContent()}
                <div className={styles.fixesBottom}>
                    <button className={classnames(styles.save, {
                        [styles.disabled]: !this.state.canSave
                    })} onClick={this.save} disabled={!this.state.canSave} ><span>save</span></button>
                    <button className={styles.cancel} onClick={closeFixes}><span>cancel</span></button>
                </div>
            </div>
        </div>
    }
}