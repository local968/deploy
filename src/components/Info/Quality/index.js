import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { ContinueButton, Modal, ProcessLoading, Table, Confirm } from 'components/Common';
import { observable } from 'mobx';
import { ClassificationTarget, RegressionTarget, RowIssue, DataIssue, FixIssue, SelectTarget } from './TargetIssue'
import { message } from 'antd'
import * as d3 from 'd3';
import { formatNumber } from 'util'

@inject('projectStore')
@observer
export default class DataQuality extends Component {

  render() {
    const { project } = this.props.projectStore;
    return <VariableIssue project={project} />
  }
}

@observer
class VariableIssue extends Component {
  @observable visible = false
  @observable summary = false
  @observable warning = false

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
    if (!project.qualityHasChanged) return this.summary = true
    if (project.train2ing || !!project.models.length) return this.warning = true
    this.onConfirm()
  }

  closeSummary = () => {
    this.summary = false
  }

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    message.info('Thank you for fixing the issues. The changes will be applied in training section.', 5)
    this.closeFixes();
  }

  onClose = () => {
    this.warning = false
  }

  onConfirm = () => {
    this.props.project.endQuality().then(() => this.summary = true).catch(() => { message.error("error!!") })
    this.onClose()
  }

  formatTable = () => {
    const { colType, uploadData, dataHeader, nullIndex, mismatchIndex, outlierIndex, mismatchLineCounts, outlierLineCounts, nullLineCounts, totalRawLines, etling } = this.props.project;
    if (etling) return []
    if (!uploadData.length) return []
    const headerList = [...dataHeader]
    const data = [...uploadData]
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
      const issues = []

      if (mismatchLineCounts[header]) {
        issues.push(<div className={classnames(styles.errorBlock, styles.mismatch)} key={"mismatch" + header}><span>{mismatchLineCounts[header] / totalRawLines < 0.01 ? '<0.01' : formatNumber(variableIssues.mismatchRow[header] / totalRawLines, 2)}%</span></div>)
      }
      if (nullLineCounts[header]) {
        issues.push(<div className={classnames(styles.errorBlock, styles.missing)} key={"missing" + header}><span>{nullLineCounts[header] / totalRawLines < 0.01 ? '<0.01' : formatNumber(variableIssues.nullRow[header] / totalRawLines, 2)}%</span></div>)
      }
      if (outlierLineCounts[header]) {
        issues.push(<div className={classnames(styles.errorBlock, styles.outlier)} key={"outlier" + header}><span>{outlierLineCounts[header] / totalRawLines < 0.01 ? '<0.01' : formatNumber(variableIssues.outlierRow[header] / totalRawLines, 2)}%</span></div>)
      }
      const issueData = {
        content: <div className={styles.errorBox}>{issues}</div>,
        title: '',
        cn: styles.cell
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
    const { dataHeader, etling, etlProgress, nullLineCounts, mismatchLineCounts, outlierLineCounts, totalRawLines } = project;
    const nullCount = Object.values(nullLineCounts).reduce((sum, n) => sum + n, 0)
    const mismatchCount = Object.values(mismatchLineCounts).reduce((sum, n) => sum + n, 0)
    const outlierCount = Object.values(outlierLineCounts).reduce((sum, n) => sum + n, 0)
    const rowIssue = totalRawLines < 1000
    const dataIssue = +nullCount + +mismatchCount + +outlierCount > 0
    const tableData = this.formatTable()
    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(rowIssue || dataIssue) ?
          <div className={styles.issueTitle}><span>Issue{+rowIssue + +dataIssue > 1 && 's'} Found!</span></div> :
          <div className={styles.cleanTitle}><span>Variable Quality looks good!</span></div>}
        <div className={styles.issueBox}>
          {rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>For your whole dataset, the number of valid data points will be smaller than the recommended minimum 1000</span>
            <div className={styles.button} onClick={this.backToConnect}>
              <button><span>Load a New Dataset</span></button>
            </div>
          </div>}
          {dataIssue && <div className={styles.issueText}>
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
      </div>
      <div className={styles.variableIssue}>
        <div className={styles.contentBox}>
          <Table
            columnWidth={110}
            rowHeight={34}
            columnCount={dataHeader.length}
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
          <ContinueButton onClick={this.showSummary} text='Continue' width="15%" />
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
        dataIssue={dataIssue}
        closeSummary={this.closeSummary} />}
        visible={this.summary}
        width='12em'
        title='How R2 Learn Will Fix the Issues'
        onClose={this.closeSummary}
        closeByMask={true}
        showClose={true}
      />
      {<Confirm width={'6em'} visible={this.warning} title='Warning' content='This action may wipe out all of your previous work (e.g. models). Please proceed with caution.' onClose={this.onClose} onConfirm={this.onConfirm} confirmText='Continue' closeText='Cancel' />}
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
    const { totalLines, deletedCount, totalFixedLines } = this.props.project
    const deleteRows = deletedCount
    const fixedRows = totalFixedLines - deletedCount
    const cleanRows = totalLines
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
    const { dataHeader, totalRawLines, deletedCount, totalLines, nullLineCounts, mismatchLineCounts, outlierLineCounts, totalFixedLines, dataIssue } = project
    const deletePercent = deletedCount / totalRawLines * 100
    const fixedPercent = (totalFixedLines - deletedCount) / totalRawLines * 100
    const cleanPercent = totalLines / totalRawLines * 100
    const variableList = dataHeader
    const percentList = dataHeader.map(v => {
      const percent = {
        missing: (nullLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        mismatch: (mismatchLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        outlier: (outlierLineCounts[v] || 0) / (totalRawLines || 1) * 100
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
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#f9cf37' }}></div>
            <span>Outlier</span>
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
              const percent = percentList[k]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryCell}><span>{v}</span></div>
                <div className={styles.summaryCell}><span>{formatNumber(percent.clean, 2)}%</span></div>
              </div>
            })}
          </div>
          <div className={styles.summaryTableRight}>
            {variableList.map((v, k) => {
              const percent = percentList[k]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryProgressBlock}>
                  <div className={styles.summaryProgress} style={{ width: percent.clean + '%', backgroundColor: '#00c855' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.mismatch + '%', backgroundColor: '#819ffc' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.missing + '%', backgroundColor: '#ff97a7' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.outlier + '%', backgroundColor: '#f9cf37' }}></div>
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
                <span>{formatNumber(fixedPercent, 2)}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#c4cbd7' }}></div>
                <span style={{ fontWeight: 'bold' }}>Rows Will Be Deleted</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{formatNumber(deletePercent, 2)}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
                <span style={{ fontWeight: 'bold' }}>Clean Data</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{formatNumber(cleanPercent, 2)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryBottom}>
          <div className={classnames(styles.summaryButton, styles.summaryConfirm, {
            [styles.disabled]: totalLines === 0
          })} onClick={totalLines === 0 ? null : this.startTrain}><span>Continue</span></div>
          <div className={classnames(styles.summaryButton, {
            [styles.disabled]: !dataIssue
          })} onClick={dataIssue ? editFixes : null}><span>Edit the Fixes</span></div>
          <div className={styles.summaryButton} onClick={this.backToConnect}><span>Load a Better Dataset</span></div>
        </div>
      </div>
    </div>
  }
}