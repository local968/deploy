import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { ContinueButton, Modal, ProcessLoading, Table } from 'components/Common';
import { observable } from 'mobx';
import { ClassificationTarget, RegressionTarget, RowIssue, DataIssue, FixIssue, SelectTarget } from './TargetIssue'
import { message } from 'antd'
import * as d3 from 'd3';

@inject('projectStore')
@observer
export default class DataQuality extends Component {
  @observable step = 1

  changeTab = value => {
    this.step = value
  }

  render() {
    const { project } = this.props.projectStore;
    return this.step !== 1 ? <VariableIssue project={project} changeTab={this.changeTab.bind(null, 1)} /> : <TargetIssue project={project} changeTab={this.changeTab.bind(null, 2)} />
  }
}

@observer
class TargetIssue extends Component {
  @observable visible = false
  @observable edit = false

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
  }

  backToSchema = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(2, 2))
  }

  editFixes = () => {
    this.visible = true
  }

  closeFixes = () => {
    this.visible = false
  }

  editTarget = () => {
    this.edit = true
  }

  closeTarget = () => {
    this.edit = false
  }

  saveTargetFixes = () => {
    this.props.project.fixTarget()
    message.info('Thank you for fixing the issues. The changes will be applied in training section.')
    this.closeTarget();
  }

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    message.info('Thank you for fixing the issues. The changes will be applied in training section.')
    this.closeFixes();
  }

  renameTarget = v => {
    const { renameVariable, updateProject } = this.props.project
    const data = Object.assign({}, renameVariable, v)
    updateProject({ renameVariable: data })
  }

  render() {
    const { project, changeTab } = this.props;
    const { issues, sortData, target, colType, sortHeader, nullLineCounts, mismatchLineCounts, outlierLineCounts, problemType, targetIssues, totalRawLines, totalLines, etling, etlProgress, renameVariable, targetCounts, rawDataView } = project;
    const targetIndex = sortHeader.findIndex(h => h === target);
    const recomm = problemType === 'Classification' ? 2 : Math.min((sortHeader.length - 1) * 6, 1000);
    const nullCount = Number.isInteger(nullLineCounts[target]) ? nullLineCounts[target] : 0
    const mismatchCount = Number.isInteger(mismatchLineCounts[target]) ? mismatchLineCounts[target] : 0
    const outlierCount = Number.isInteger(outlierLineCounts[target]) ? outlierLineCounts[target] : 0
    const targetPercent = {
      missing: nullCount * 100 / (totalRawLines || 1),
      mismatch: mismatchCount * 100 / (totalRawLines || 1),
      outlier: outlierCount * 100 / (totalRawLines || 1),
    }
    const warnings = []
    const unique = (rawDataView ? rawDataView[target] : {}).uniqueValues || 0
    if (problemType === 'Classification') {
      if (unique < 2) warnings.push("Your target variable has less than two unique values. It is recommended that you reselect a target variable or upload new data.")
      if (unique === 2) {
        const min = Math.min(...Object.values(targetCounts))
        if (min < 3) warnings.push("It is recommended that you re-select target or upload new data.")
      }
    }
    if ((nullLineCounts[target] ? nullLineCounts[target] : 0) === totalRawLines) warnings.push("Your target variable is empty, It is recommended that you reselect a target variable or upload new data.")
    const cannotContinue = !!warnings.length || (problemType === 'Classification' && issues.targetIssue)
    const isClean = !warnings.length && !issues.targetIssue && !issues.rowIssue && !(problemType !== 'Classification' && issues.targetRowIssue)
    return <div className={styles.quality}>
      <div className={styles.issue}>
        {!!warnings.length && <div className={styles.issueTitle}><span>Warning!</span></div>}
        {!!warnings.length && <div className={styles.issueBox}>
          {warnings.map((v, k) => <div className={styles.issueText} key={k}>
            <div className={styles.point}></div>
            <span>{v}</span>
          </div>)}
        </div>}
        {(issues.targetIssue || issues.rowIssue || (problemType !== 'Classification' && issues.targetRowIssue)) && <div className={styles.issueTitle}><span>Issue{issues.targetIssue + issues.rowIssue + issues.targetRowIssue > 2 && 's'} Found!</span></div>}
        {(issues.targetIssue || issues.rowIssue || (problemType !== 'Classification' && issues.targetRowIssue)) && <div className={styles.issueBox}>
          {issues.targetIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            {problemType === 'Classification' ?
              <span>Your target variable has more than two unique values, which is not suitable for binary classification.</span> :
              <span>Your target variable has less than {recomm} unique values, which is not suitable for Regression.</span>}
          </div>}
          {issues.rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Data size is too small</span>
          </div>}
          {(problemType !== 'Classification' && issues.targetRowIssue) && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Some data issues, highlighted in color, are found. You can fix them by pressing “Edit The Fixes”, or we will fix them automatically.</span>
          </div>}
        </div>}
        {isClean && <div className={styles.cleanTitle}><span>Target variable quality looks good!</span></div>}
      </div>
      <div className={styles.typeBox}>
        {!!mismatchCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
          <span>Data Type Mismatch</span>
        </div>}
        {!!nullCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.missing)}></div>
          <span>Missing Value</span>
        </div>}
        {!!outlierCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.outlier)}></div>
          <span>Outlier</span>
        </div>}
        <div className={styles.issueTabs}>
          <div className={styles.issueTab} style={{ borderBottomColor: '#1d2b3c' }}><span style={{ fontWeight: 'bold' }}>Target Variable</span></div>
          <div className={styles.issueTab} onClick={cannotContinue ? null : changeTab}><span>Predictor Variables</span></div>
        </div>
      </div>
      <div className={styles.contentBox}>
        <div className={styles.list}>
          <div className={styles.table}>
            <div className={classnames(styles.cell, styles.target)}><span>Target Variable</span></div>
            <div className={classnames(styles.cell, styles.label)}><span>{target}</span></div>
            <div className={classnames(styles.cell, styles.select)}><span>{colType[target]}</span></div>
            <div className={classnames(styles.cell, styles.error)}>
              {!!targetPercent.mismatch && <div className={classnames(styles.errorBlock, styles.mismatch)}><span>{targetPercent.mismatch < 0.01 ? "<0.01" : targetPercent.mismatch.toFixed(2)}%</span></div>}
              {!!targetPercent.missing && <div className={classnames(styles.errorBlock, styles.missing)}><span>{targetPercent.missing < 0.01 ? "<0.01" : targetPercent.missing.toFixed(2)}%</span></div>}
              {!!targetPercent.outlier && <div className={classnames(styles.errorBlock, styles.outlier)}><span>{targetPercent.outlier < 0.01 ? "<0.01" : targetPercent.outlier.toFixed(2)}%</span></div>}
            </div>
            <div className={styles.tableBody}>
              {sortData.map((v, k) => <div key={k} className={classnames(styles.cell, {
                [styles.mismatch]: targetIssues.mismatchRow.includes(k),
                [styles.missing]: targetIssues.nullRow.includes(k),
                [styles.outlier]: targetIssues.outlierRow.includes(k)
              })}>
                <span title={renameVariable[v[targetIndex]] || v[targetIndex]}>{renameVariable[v[targetIndex]] || v[targetIndex]}</span>
              </div>
              )}
            </div>
          </div>
          <ContinueButton disabled={cannotContinue} onClick={changeTab} text='continue' width="100%" />
        </div>
        <div className={styles.content}>
          {problemType === 'Classification' ?
            <ClassificationTarget project={project}
              backToConnect={this.backToConnect}
              backToSchema={this.backToSchema}
              editTarget={this.editTarget}
              renameTarget={this.renameTarget} /> :
            <RegressionTarget backToConnect={this.backToConnect}
              backToSchema={this.backToSchema}
              hasIssue={issues.targetIssue}
              unique={unique}
              recomm={recomm} />}
          {issues.rowIssue && <RowIssue backToConnect={this.backToConnect}
            totalRawLines={totalRawLines} />}
          {(problemType !== 'Classification' && issues.targetRowIssue) && <DataIssue backToConnect={this.backToConnect}
            editFixes={this.editFixes}
            targetIssues={{
              nullRow: nullLineCounts[target] ? nullLineCounts[target] : 0,
              mismatchRow: colType[target] === 'Numerical' ? mismatchLineCounts[target] : 0,
              outlierRow: colType[target] === 'Numerical' ? outlierLineCounts[target] : 0,
            }}
            totalRawLines={totalRawLines}
            totalLines={totalLines}
            percent={targetPercent} />}
        </div>
        <Modal content={<FixIssue project={project}
          nullCount={nullCount}
          mismatchCount={mismatchCount}
          outlierCount={outlierCount}
          closeFixes={this.closeFixes}
          saveDataFixes={this.saveDataFixes}
          isTarget={true} />}
          visible={this.visible}
          width='12em'
          title='How R2 Learn Will Fix the Issues'
          onClose={this.closeFixes}
          closeByMask={true}
          showClose={true}
        />
        <Modal content={<SelectTarget project={project} closeTarget={this.closeTarget} saveTargetFixes={this.saveTargetFixes} />}
          visible={this.edit}
          width='5.5em'
          title='How R2 Learn Will Fix the Issues'
          onClose={this.closeTarget}
          closeByMask={true}
          showClose={true}
        />
      </div>
      {etling && <ProcessLoading progress={etlProgress} style={{ position: 'fixed' }} />}
    </div>
  }
}

@observer
class VariableIssue extends Component {
  @observable visible = false
  @observable summary = false

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
  }

  editFixes = () => {
    this.visible = true
    this.closeSummary()
  }

  closeFixes = () => {
    this.visible = false
  }

  showSummary = () => {
    const { project } = this.props
    project.endQuality().then(() => this.summary = true).catch(() => { message.error("error!!") })
  }

  closeSummary = () => {
    this.summary = false
  }

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    message.info('Thank you for fixing the issues. The changes will be applied in training section.')
    this.closeFixes();
  }

  formatTable = () => {
    const { target, colType, sortData, sortHeader, dataHeader, nullIndex, mismatchIndex, outlierIndex, variableIssues, etling } = this.props.project;
    if (etling) return []
    if (!sortData.length) return []
    const headerList = [...dataHeader.filter(v => v !== target)]
    const notShowIndex = sortHeader.filter(v => !headerList.includes(v)).map(v => sortHeader.indexOf(v))
    const data = sortData.map(row => row.filter((k, i) => !notShowIndex.includes(i)))
    /**
     * 根据showSelect, indexPosition变化
     * showSelect: true  显示勾选框
     * checkRow: 勾选框的行数
     * headerRow: 标题的行数
     * selectRow: 类型选择的行数
     * columnHeader: 表头的列数
     * rowHeader: 表头的行数
     */
    const realColumn = headerList.length

    const indexArr = []
    const headerArr = []
    const selectArr = []
    const issueArr = []
    for (let i = 0; i < realColumn; i++) {
      const header = headerList[i] ? headerList[i].trim() : '';

      indexArr.push({
        content: <span>{i + 1}</span>,
        title: i + 1,
        cn: styles.cell
      })

      headerArr.push({
        content: <span>{header}</span>,
        title: header,
        cn: styles.titleCell
      })

      const colValue = colType[header] === 'Numerical' ? 'Numerical' : 'Categorical'
      selectArr.push({
        content: <span>{colValue}</span>,
        title: colValue,
        cn: styles.cell
      })

      const issueData = {
        content: [],
        title: '',
        cn: styles.cell
      }
      if (variableIssues.mismatchRow[header]) {
        issueData.content.push(<div className={classnames(styles.errorBlock, styles.mismatch)} key={"mismatch" + header}><span>{variableIssues.mismatchRow[header] < 0.01 ? '<0.01' : variableIssues.mismatchRow[header].toFixed(2)}%</span></div>)
      }
      if (variableIssues.nullRow[header]) {
        issueData.content.push(<div className={classnames(styles.errorBlock, styles.missing)} key={"missing" + header}><span>{variableIssues.nullRow[header] < 0.01 ? '<0.01' : variableIssues.nullRow[header].toFixed(2)}%</span></div>)
      }
      if (variableIssues.outlierRow[header]) {
        issueData.content.push(<div className={classnames(styles.errorBlock, styles.outlier)} key={"outlier" + header}><span>{variableIssues.outlierRow[header] < 0.01 ? '<0.01' : variableIssues.outlierRow[header].toFixed(2)}%</span></div>)
      }
      issueArr.push(issueData)
    }

    const tableData = data.map((row, rowIndex) => row.map((v, k) => {
      const header = headerList[k] && headerList[k].trim();
      const itemData = {
        content: <span>{v}</span>,
        title: v,
        cn: styles.cell
      }
      if (nullIndex[header] && nullIndex[header].includes(rowIndex)) {
        itemData.cn = classnames(itemData.cn, styles.missing);
      }
      if (colType[header] === 'Numerical' && mismatchIndex[header] && mismatchIndex[header].includes(rowIndex)) {
        itemData.cn = classnames(itemData.cn, styles.mismatch);
      }
      if (colType[header] === 'Numerical' && outlierIndex[header] && outlierIndex[header].includes(rowIndex)) {
        itemData.cn = classnames(itemData.cn, styles.outlier);
      }
      return itemData
    }))

    return [indexArr, headerArr, selectArr, issueArr, ...tableData].filter(row => row.length === realColumn)
  }

  render() {
    const { project, changeTab } = this.props;
    const { issues, dataHeader, etling, etlProgress, variableIssueCount: { nullCount, mismatchCount, outlierCount } } = project;
    const tableData = this.formatTable()
    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(issues.rowIssue || issues.dataIssue) ?
          <div className={styles.issueTitle}><span>Issue Found!</span></div> :
          <div className={styles.cleanTitle}><span>Variable Quality looks good!</span></div>}
        <div className={styles.issueBox}>
          {issues.rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>For your whole dataset, the number of valid data points will be smaller than the recommended minimum 1000</span>
            <div className={styles.button} onClick={this.backToConnect}>
              <button><span>Load a New Dataset</span></button>
            </div>
          </div>}
          {issues.dataIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>Some issues are found. R2 learn has generated an automatic fixing solution. You can also create your own fixing solution by clicking “Edit The Fixes” button.</span>
            <div className={styles.button} onClick={this.editFixes}>
              <button><span>Edit The Fixes</span></button>
            </div>
          </div>}
        </div>
      </div>
      <div className={styles.typeBox}>
        {!!mismatchCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
          <span>Data Type Mismatch</span>
        </div>}
        {!!nullCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.missing)}></div>
          <span>Missing Value</span>
        </div>}
        {!!outlierCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.outlier)}></div>
          <span>Outlier</span>
        </div>}
        <div className={styles.issueTabs}>
          <div className={styles.issueTab} onClick={changeTab}><span>Target Variable</span></div>
          <div className={styles.issueTab} style={{ borderBottomColor: '#1d2b3c' }}><span style={{ fontWeight: 'bold' }}>Predictor Variables</span></div>
        </div>
      </div>
      <div className={styles.variableIssue}>
        <div className={styles.contentBox}>
          <Table
            columnWidth={110}
            rowHeight={34}
            columnCount={dataHeader.length - 1}
            rowCount={tableData.length}
            fixedColumnCount={0}
            fixedRowCount={4}
            checked={null}
            select={null}
            style={{ border: "1px solid #ccc" }}
            data={tableData}
          />
        </div>
        <div className={styles.variableBottom}>
          <ContinueButton onClick={this.showSummary} text='continue' width="15%" />
        </div>
      </div>
      {etling && <ProcessLoading progress={etlProgress} style={{ position: 'fixed' }} />}
      <Modal content={<FixIssue project={project}
        nullCount={nullCount}
        mismatchCount={mismatchCount}
        outlierCount={outlierCount}
        closeFixes={this.closeFixes}
        saveDataFixes={this.saveDataFixes}
        isTarget={false} />}
        visible={this.visible}
        width='12em'
        title='How R2 Learn Will Fix the Issues'
        onClose={this.closeFixes}
        closeByMask={true}
        showClose={true}
      />
      <Modal content={<Summary project={project}
        editFixes={this.editFixes}
        closeSummary={this.closeSummary} />}
        visible={this.summary}
        width='12em'
        title='How R2 Learn Will Fix the Issues'
        onClose={this.closeSummary}
        closeByMask={true}
        showClose={true}
      />
    </div>
  }
}

@observer
class Summary extends Component {
  componentDidMount() {
    this.renderD3()
  }

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
  }

  startTrain = () => {
    const { project } = this.props
    project.updateProject(project.nextMainStep(3))
  }

  renderD3 = () => {
    d3.select(`.${styles.summaryChart} svg`).remove();

    const outerRadius = 60;           // 外半径
    const innerRadius = 0;             // 内半径
    //弧生成器
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
    const { totalRawLines, totalLines, totalFixedLines } = this.props.project
    const deleteRows = totalRawLines - totalLines
    const fixedRows = totalFixedLines
    const cleanRows = totalLines - totalFixedLines
    const data = [fixedRows, deleteRows, cleanRows]
    const color = ['#9cebff', '#c4cbd7', '#00c855'];
    const dataset = d3.pie()(data);

    const svg = d3.select(`.${styles.summaryChart}`)
      .append("svg")
      .attr("width", 120)
      .attr("height", 120)

    svg.selectAll(`g`)
      .data(dataset)
      .enter()
      .append("g")
      .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")
      .append("path")
      .attr("fill", (d, i) => color[i])
      .attr("d", (d) => {
        return arc(d);   //调用弧生成器，得到路径值
      });
  }

  render() {
    const { project, editFixes } = this.props;
    const { target, sortHeader, dataHeader, totalRawLines, totalLines, nullLineCounts, mismatchLineCounts, outlierLineCounts, totalFixedLines, problemType, issues } = project
    const deletePercent = (totalRawLines - totalLines) / totalRawLines * 100
    const fixedPercent = totalFixedLines / totalRawLines * 100
    const cleanPercent = (totalLines - totalFixedLines) / totalRawLines * 100
    const currentHeader = sortHeader.filter(h => dataHeader.includes(h))
    const variableList = currentHeader.slice(1)
    const percentList = currentHeader.map(v => {
      const percent = {
        missing: (nullLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        mismatch: (mismatchLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        outlier: (problemType !== 'Classification' ? (outlierLineCounts[v] || 0) : 0) / (totalRawLines || 1) * 100
      }
      percent.clean = 100 - percent.missing - percent.mismatch - percent.outlier
      return percent
    })
    return <div className={styles.summary}>
      <div className={styles.summaryLeft}>
        <div className={styles.summaryTitle}><span>Summary of your data</span></div>
        <div className={styles.summaryTypeBox}>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
            <span>Clean Data</span>
          </div>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#819ffc' }}></div>
            <span>Data Type Mismatch</span>
          </div>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#ff97a7' }}></div>
            <span>Missing Value</span>
          </div>
          {problemType !== 'Classification' && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#f9cf37' }}></div>
            <span>Outlier</span>
          </div>}
        </div>
        <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Target Variable</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Clean Data</span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span>{target}</span></div>
              <div className={styles.summaryCell}><span>{percentList[0].clean.toFixed(2)}%</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Data Composition </span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryProgressBlock}>
                <div className={styles.summaryProgress} style={{ width: percentList[0].clean + '%', backgroundColor: '#00c855' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].mismatch + '%', backgroundColor: '#819ffc' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].missing + '%', backgroundColor: '#ff97a7' }}></div>
                {problemType !== 'Classification' && <div className={styles.summaryProgress} style={{ width: percentList[0].outlier + '%', backgroundColor: '#f9cf37' }}></div>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable} style={{ paddingRight: '.2em' }}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Predictor Variables</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Clean Data</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Data Composition </span></div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable} style={{ overflow: 'scroll' }}>
          <div className={styles.summaryTableLeft}>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryCell}><span>{v}</span></div>
                <div className={styles.summaryCell}><span>{percent.clean.toFixed(2)}%</span></div>
              </div>
            })}
          </div>
          <div className={styles.summaryTableRight}>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryProgressBlock}>
                  <div className={styles.summaryProgress} style={{ width: percent.clean + '%', backgroundColor: '#00c855' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.mismatch + '%', backgroundColor: '#819ffc' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.missing + '%', backgroundColor: '#ff97a7' }}></div>
                  {problemType !== 'Classification' && <div className={styles.summaryProgress} style={{ width: percent.outlier + '%', backgroundColor: '#f9cf37' }}></div>}
                </div>
              </div>
            })}
          </div>
        </div>
      </div>
      <div className={styles.summaryRight}>
        <div className={styles.summaryTitle}><span>R2 Learn will fix the issues</span></div>
        <div className={styles.summaryPie}>
          <div className={styles.summaryChart}>
          </div>
          <div className={styles.summaryParts}>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#9cebff' }}></div>
                <span style={{ fontWeight: 'bold' }}>Rows Will Be Fixed</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{fixedPercent.toFixed(2)}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#c4cbd7' }}></div>
                <span style={{ fontWeight: 'bold' }}>Rows Will Be Deleted</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{deletePercent.toFixed(2)}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
                <span style={{ fontWeight: 'bold' }}>Clean Data</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{cleanPercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryBottom}>
          <div className={classnames(styles.summaryButton, styles.summaryConfirm, {
            [styles.disabled]: totalLines === 0
          })} onClick={totalLines === 0 ? null : this.startTrain}><span>Continue</span></div>
          <div className={classnames(styles.summaryButton, {
            [styles.disabled]: !issues.dataIssue
          })} onClick={issues.dataIssue ? editFixes : null}><span>Edit the Fixes</span></div>
          <div className={styles.summaryButton} onClick={this.backToConnect}><span>Load a Better Dataset</span></div>
        </div>
      </div>
    </div>
  }
}