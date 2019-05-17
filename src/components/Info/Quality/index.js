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
import EN from '../../../constant/en';
import Pie2 from "../../Charts/Pie2";
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
    message.info(EN.Thechangeswillbeappliedintrainingsection, 5)
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
    const { colType, uploadData, rawHeader, dataHeader, totalRawLines, etling, rawDataView, variableIssues, problemType } = this.props.project;
    if (etling) return []
    if (!uploadData.length) return []
    const headerList = [...dataHeader]
    const notShowIndex = rawHeader.filter(v => !headerList.includes(v)).map(v => rawHeader.indexOf(v))
    const data = uploadData.map(row => row.filter((k, i) => !notShowIndex.includes(i)))
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
        content: <span>{colValue === 'Numerical' ? EN.Numerical : EN.Categorical}</span>,
        title: colValue === 'Numerical' ? EN.Numerical : EN.Categorical,
        cn: styles.cell
      })
      const issues = []
      const isNum = colType[header] === 'Numerical'

      if (isNum && variableIssues.mismatchRow[header]) {
        issues.push(<div className={classnames(styles.errorBlock, styles.mismatch)} key={"mismatch" + header}><span>{variableIssues.mismatchRow[header] < 0.01 ? '<0.01' : formatNumber(variableIssues.mismatchRow[header], 2)}%</span></div>)
      }
      if (variableIssues.nullRow[header]) {
        issues.push(<div className={classnames(styles.errorBlock, styles.missing)} key={"missing" + header}><span>{variableIssues.nullRow[header] < 0.01 ? '<0.01' : formatNumber(variableIssues.nullRow[header], 2)}%</span></div>)
      }
      if (isNum && variableIssues.outlierRow[header]) {
        issues.push(<div className={classnames(styles.errorBlock, styles.outlier)} key={"outlier" + header}><span>{variableIssues.outlierRow[header] < 0.01 ? '<0.01' : formatNumber(variableIssues.outlierRow[header], 2)}%</span></div>)
      }
      const issueData = {
        content: <div className={styles.errorBox}>{issues}</div>,
        title: '',
        cn: styles.cell
      }
      issueArr.push(issueData)
    }
    const tableData = data.map((row, rowIndex) =>
      row.map((v, k) => {
        const header = headerList[k] && headerList[k].trim();
        const itemData = {
          content: <span>{v}</span>,
          title: v,
          cn: styles.cell
        }

        const isNum = colType[header] === 'Numerical'
        const { low = NaN, high = NaN } = isNum ? rawDataView[header] : {}
        const isMissing = isNaN(parseFloat(v)) ? !v : false
        const isMismatch = isNum ? isNaN(parseFloat(v)) : false
        const isOutlier = (problemType === 'Clustering' && isNum) ? (v < low || v > high) : false

        if (isMissing) {
          itemData.cn = classnames(itemData.cn, styles.missing);
        }
        if (isMismatch) {
          itemData.cn = classnames(itemData.cn, styles.mismatch);
        }
        if (isOutlier) {
          itemData.cn = classnames(itemData.cn, styles.outlier);
        }
        return itemData
      }))
    return [indexArr, headerArr, selectArr, issueArr, ...tableData].filter(row => row.length === realColumn)
  }

  render() {
    const { project, changeTab } = this.props;
    const { dataHeader, etling, etlProgress, variableIssueCount: { nullCount, mismatchCount, outlierCount }, totalRawLines } = project;
    // const nullCount = Object.values(nullLineCounts).reduce((sum, n) => sum + n, 0)
    // const mismatchCount = Object.values(mismatchLineCounts).reduce((sum, n) => sum + n, 0)
    // const outlierCount = Object.values(outlierLineCounts).reduce((sum, n) => sum + n, 0)
    const rowIssue = totalRawLines < 1000
    const dataIssue = +nullCount + +mismatchCount + +outlierCount > 0
    const tableData = this.formatTable()
    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(rowIssue || dataIssue) ?
          <div className={styles.issueTitle}><span>{EN.IssueS}{+rowIssue + +dataIssue > 1 && EN.SS} {EN.Found}!</span></div> :
          <div className={styles.cleanTitle}><span>{EN.VariableQualitylooksgood}</span></div>}
        <div className={styles.issueBox}>
          {rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>{EN.Foryourwholedataset}</span>
            <div className={styles.button} onClick={this.backToConnect}>
              <button><span>{EN.LoadaNewDataset}</span></button>
            </div>
          </div>}
          {dataIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>{EN.SomeissuesarefoundR2learnhasgenerated}</span>
            <div className={styles.button} onClick={this.editFixes}>
              <button><span>{EN.EditTheFixes}</span></button>
            </div>
          </div>}
        </div>
      </div>
      <div className={styles.typeBox}>
        {!!mismatchCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
          <span>{EN.DataTypeMismatch}</span>
        </div>}
        {!!nullCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.missing)}></div>
          <span>{EN.MissingValue}</span>
        </div>}
        {!!outlierCount && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.outlier)}></div>
          <span>{EN.Outlier}</span>
        </div>}
      </div>
      <div className={styles.variableIssue}>
        <div className={styles.contentBox}>
          <Table
            columnWidth={160}
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
          <ContinueButton onClick={this.showSummary} text={EN.Continue} width="15%" />
        </div>
      </div>
      {etling && <ProcessLoading progress={etlProgress} style={{ position: 'fixed' }} />}
      <Modal content={<FixIssue project={project}
        nullCount={nullCount}
        mismatchCount={mismatchCount}
        outlierCount={outlierCount}
        closeFixes={this.closeFixes}
        saveDataFixes={this.saveDataFixes} />}
        visible={this.visible}
        width='12em'
        title={EN.HowR2LearnWillFixtheIssues}
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
        title={EN.HowR2LearnWillFixtheIssues}
        onClose={this.closeSummary}
        closeByMask={true}
        showClose={true}
      />
      {<Confirm width={'6em'} visible={this.warning} title={EN.Warning} content={EN.Thisactionmaywipeoutallofyourprevious} onClose={this.onClose} onConfirm={this.onConfirm} confirmText={EN.Continue} closeText={EN.CANCEL} />}
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
    const { totalRawLines, deletedCount, totalFixedLines } = this.props.project
    const deleteRows = deletedCount
    const fixedRows = totalFixedLines - deletedCount
    const cleanRows = totalRawLines - totalFixedLines
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
    const { dataHeader, totalRawLines, colType, deletedCount, totalLines, problemType, variableIssueCount: { nullCount, mismatchCount, outlierCount }, variableIssues: { nullRow, mismatchRow, outlierRow }, totalFixedLines, issues } = project
    const deletePercent = formatNumber(deletedCount / totalRawLines * 100, 2)
    const fixedPercent = formatNumber((totalFixedLines - deletedCount) / totalRawLines * 100, 2)
    const cleanPercent = formatNumber(100 - deletePercent - fixedPercent, 2)
    const variableList = dataHeader
    const percentList = dataHeader.map(v => {
      const isNum = colType[v] === 'Numerical'
      const percent = {
        missing: nullRow[v] || 0,
        mismatch: mismatchRow[v] || 0,
        outlier: outlierRow[v] || 0
      }
      percent.clean = 100 - percent.missing - percent.mismatch - percent.outlier
      return percent
    })
    return <div className={styles.summary}>
      <div className={styles.summaryLeft}>
        <div className={styles.summaryTitle}><span>{EN.Summaryofyourdata}</span></div>
        <div className={styles.summaryTypeBox}>
          {!!nullCount && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }} />
            <span>{EN.CleanData}</span>
          </div>}
          {!!mismatchCount && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#819ffc' }} />
            <span>{EN.DataTypeMismatch}</span>
          </div>}
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#ff97a7' }} />
            <span>{EN.MissingValue}</span>
          </div>
          {(problemType !== 'Outlier' && outlierCount) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#f9cf37' }} />
            <span>{EN.Outlier}</span>
          </div>}
        </div>
        <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.PredictorVariables}</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.DataComposition} </span></div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable} style={{ maxHeight: '4em' }}>
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
        <div className={styles.summaryTitle}><span>{EN.HowR2LearnWillFixtheIssues}</span></div>
        <div className={styles.summaryPie}>
          {/*<div className={styles.summaryChart}>*/}
          {/*</div>*/}
          <Pie2
            RowsWillBeFixed={fixedPercent}
            RowsWillBeDeleted={deletePercent}
            CleanData={cleanPercent}
          />
          <div className={styles.summaryParts}>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#9cebff' }}></div>
                <span style={{ fontWeight: 'bold' }}>{EN.RowsWillBeFixed}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{fixedPercent}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#c4cbd7' }}></div>
                <span style={{ fontWeight: 'bold' }}>{EN.RowsWillBeDeleted}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{deletePercent}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
                <span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{cleanPercent}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryBottom}>
          <div className={classnames(styles.summaryButton, styles.summaryConfirm, {
            [styles.disabled]: totalLines === 0
          })} onClick={totalLines === 0 ? null : this.startTrain}><span>{EN.Continue}</span></div>
          <div className={classnames(styles.summaryButton, {
            [styles.disabled]: !issues.dataIssue
          })} onClick={issues.dataIssue ? editFixes : null}><span>{EN.EditTheFixes}</span></div>
          <div className={styles.summaryButton} onClick={this.backToConnect}><span>{EN.LoadaBetterDataset}</span></div>
        </div>
      </div>
    </div>
  }
}
