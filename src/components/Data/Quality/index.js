import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ContinueButton } from '../../Common';
import { when, remove } from 'mobx';
import * as d3 from 'd3';

@observer
export default class DataQuality extends Component {
    state = {
        visible: false,
        isLoad: false
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
        canSave: false,
        visible: false,
        editKey: "",
        fillMethod: {}
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

    editRange = (key) => {
        console.log(key)
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
            const {issueRows, colType, target, mismatchIndex, nullIndex, outlierIndex, mismatchFillMethod, nullFillMethod, outlierFillMethod, totalRawLines, dataViews} = project
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
                                    <div className={styles.fixesCell}><span title={dataViews[k]?dataViews[k].mean:'N/A'}>{dataViews[k]?dataViews[k].mean:'N/A'}</span></div>
                                    <div className={styles.fixesCell}><span title={dataViews[k]?dataViews[k].median:'N/A'}>{dataViews[k]?dataViews[k].median:'N/A'}</span></div>
                                    <div className={styles.fixesCell}><span>5644</span></div>
                                    <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={mismatchFillMethod[k]} onChange={this.select.bind(null,'missing',k)}>
                                        <option value="drop">Delete the row</option>
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
                                <div className={styles.fixesCell}><span title={dataViews[k]?dataViews[k].mean:'N/A'}>{dataViews[k]?dataViews[k].mean:'N/A'}</span></div>
                                <div className={styles.fixesCell}><span title={dataViews[k]?dataViews[k].median:'N/A'}>{dataViews[k]?dataViews[k].median:'N/A'}</span></div>
                                <div className={styles.fixesCell}><span>5644</span></div>
                                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={nullFillMethod[k]} onChange={this.select.bind(null,'missing',k)}>
                                    <option value="drop">Delete the row</option>
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
                                    <span>1867 - 8976</span><span className={styles.fixesEdit} onClick={this.editRange.bind(null,k)}>edit</span>
                                </div>
                                <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                                    <option value="Categorical">Categorical</option>
                                    <option value="Numerical">Numerical</option>
                                </select></div>
                                <div className={styles.fixesCell}><span>{outlierIndex[k].length} ({(outlierIndex[k].length / (totalRawLines||1)).toFixed(4)}%)</span></div>
                                <div className={styles.fixesCell}><span title={dataViews[k]?dataViews[k].mean:'N/A'} >{dataViews[k]?dataViews[k].mean:'N/A'}</span></div>
                                <div className={styles.fixesCell}><span title={dataViews[k]?dataViews[k].median:'N/A'}>{dataViews[k]?dataViews[k].median:'N/A'}</span></div>
                                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={outlierFillMethod[k]} onChange={this.select.bind(null,'missing',k)}>
                                    <option value="drop">Delete the row</option>>
                                </select></div>
                            </div>
                        })}
                        </div>
                    </div>
                </div>}
            </div>
        }
    }

    drag = (type, num) => {

    }
    // renderEdit = () => {
    //     const {outlierIndex} = this.props.project;
    //     const outlier = outlierIndex[this.state.editKey]
    //     console.log(outlier)
    //     return <div className={styles.fixesContent}>
    //         <div className={styles.d3Chart}>
                
    //         </div>
    //     </div>
    // }

    render() {
        const {closeFixes, project} = this.props;
        return <div className={styles.fixes}>
            <div className={styles.cover} onClick={closeFixes}></div>
            <div className={styles.fixesBlock}>
                <div className={styles.fixesTitle}><span>How Mr.One Will Fix the Issues</span><div className={styles.close} onClick={closeFixes}><span>X</span></div></div>
                {this.renderContent()}
                <div className={styles.fixesBottom}>
                    <button className={classnames(styles.save, {
                        [styles.disabled]: !this.state.canSave
                    })} onClick={this.save} disabled={!this.state.canSave} ><span>save</span></button>
                    <button className={styles.cancel} onClick={closeFixes}><span>cancel</span></button>
                </div>
            </div>
            {this.state.visible && <EditOutLier width={800} height={400} closeEdit={this.closeEdit} data={project.colMap.date} outlierRange={project.outlierRange[this.state.editKey]} numberBins={project.numberBins[this.state.editKey]}/>}
        </div>
    }
}

class EditOutLier extends Component{

    state = {
        min: this.props.outlierRange[0], 
        max: this.props.outlierRange[1]
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
        const [y, x] = numberBins;
        const padding = {left: 50, bottom: 30, right: 5, top: 50};

        const realHeight = height - padding.bottom - padding.top;
        const realWidth = width - padding.left - padding.right;
        //在 body 里添加一个 SVG 画布   
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
        const rectWidth = x[1] - x[0];

        // for(let  i = 0;i<100;i++) {
        //     let rand = Math.random() * 100;
        //     maxH = typeof maxH !== 'undefined'?Math.max(rand, maxH):rand;
        //     minX = typeof minX !== 'undefined'?Math.min(i, minX):i;
        //     maxX = typeof maxX !== 'undefined'?Math.max(i, maxX):i;
        //     dataset.push({x: i, y: rand})
        // }
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
            let {min, max} = this.state
            const minDrag = d3.drag()
                // .container(minDrag)
                .on('start', function () {
                    console.log(d3.event.x)
                    console.log('start',d3.event)
                })
                .on('drag', () => {
                    minRect.attr('width', xScale(xScale.invert(d3.event.x)))
                    minLine.attr('x1', xScale(xScale.invert(d3.event.x)))
                    minLine.attr('x2', xScale(xScale.invert(d3.event.x)))
                    minCircle.attr('cx', xScale(xScale.invert(d3.event.x)))
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
                .attr('cy', padding.top-8)
                .attr('r', 10)
                .attr('fill', '#c7f1ee')
                .call(minDrag);

            const maxDrag = d3.drag()
                .on('start', function () {
                    console.log('start',d3.event)
                })
                .on('drag', () => {
                    maxRect.attr('x', xScale(xScale.invert(d3.event.x)))
                    maxRect.attr('width', xScale(maxX + offset) - xScale(xScale.invert(d3.event.x)))
                    maxLine.attr('x1', xScale(xScale.invert(d3.event.x)))
                    maxLine.attr('x2', xScale(xScale.invert(d3.event.x)))
                    maxCircle.attr('cx', xScale(xScale.invert(d3.event.x)))
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

            let maxCircle = maxDragBlock.append('circle')
                .attr('class', `${styles.dragCircle}`)
                .attr('cx', xScale(max))
                .attr('cy', padding.top-8)
                .attr('r', 10)
                .attr('fill', '#ffd287')
                .call(maxDrag);
        }

        //初始化拖动
        drawDrag()

        //添加矩形元素
        const drawRect = () => {
            // const {min, max} = this.state;
            // if(min >= max) {
                for(let i = 1; i < x.length;i++){
                    dataset.push({
                        x: (x[i] + x[i-1])/2,
                        y: y[i-1],
                        // width: 1,
                        // class: styles.outer
                    })
                }
            // }else{

            // }

            var rects = svg.selectAll(`.${styles.rect}`);
            rects.remove();
            rects.data(dataset)
                .enter()
                .append("rect")
                .attr("class",(d) => d.class)
                // .attr("transform",`translate(0,${padding.top})`)
                .attr("x", (d) => xScale(d.x))
                .attr("y", (d) => yScale(d.y) + padding.top)
                .attr("width", () => xScale(rectWidth) - xScale(0))
                .attr("height", (d) => realHeight - yScale(d.y));
        }

        //添加矩形元素
        drawRect()
    }

    render() {
        const {closeEdit} = this.props;
        return <div className={styles.fixes}>
            <div className={styles.cover} onClick={closeEdit}></div>
            <div className={styles.fixesBlock}>
                <div className={styles.fixesTitle}><span>Outlier</span><div className={styles.close} onClick={closeEdit}><span>X</span></div></div>
                <div className={styles.fixesContent}>
                    <div className={styles.d3Chart}>
                        
                    </div>
                </div>
            </div>
        </div>
    }
}