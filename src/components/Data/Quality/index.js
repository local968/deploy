import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ContinueButton, ProjectLoading, Modal, EtlLoading, Table } from 'components/Common';
import { when, observable } from 'mobx';
import { ClassificationTarget, RegressionTarget, RowIssue, DataIssue, FixIssue, SelectTarget } from './TargetIssue'
import { message } from 'antd'
import * as d3 from 'd3';

@observer
export default class DataQuality extends Component {
  @observable allData = false

  next = () => {
    this.allData = true
  }

  render() {
    const { project } = this.props;
    return this.allData ? <VariableIssue project={project} /> : <TargetIssue project={project} next={this.next} />
  }
}

@observer
class TargetIssue extends Component {
  @observable visible = false
  @observable isLoad = false
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
    if (this.props.project.dataViews) {
      this.visible = true
    } else {
      if (this.isLoad) return false;

      this.isLoad = true

      this.props.project.dataView()
      when(
        () => this.props.project.dataViews,
        () => {
          this.visible = true
          this.isLoad = false
        }
      )
    }
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
    message.info('Thank you for fixing the issues below. The changes will be applied at training section')
    this.closeTarget();
  }

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    message.info('Thank you for fixing the issues below. The changes will be applied at training section')
    this.closeFixes();
  }

  render() {
    const { project, next } = this.props;
    const { issues, sortData, target, colType, sortHeader, mismatchIndex, nullIndex, outlierIndex, problemType, targetIssues, totalRawLines, totalLines, etling, etlProgress } = project;
    const targetIndex = sortHeader.findIndex(h => h === target);
    const recomm = problemType === 'Classification' ? '2' : '10+';
    const percent = {
      missing: targetIssues.nullRow.length * 100 / (totalRawLines || 1),
      mismatch: targetIssues.mismatchRow.length * 100 / (totalRawLines || 1),
      outlier: targetIssues.outlierRow.length * 100 / (totalRawLines || 1),
    }
    const targetPercent = {
      missing: (nullIndex[target] ? nullIndex[target].length : 0) * 100 / (totalRawLines || 1),
      mismatch: (colType[target] === 'Numerical' ? mismatchIndex[target].length : 0) * 100 / (totalRawLines || 1),
      outlier: colType[target] === 'Numerical' ? outlierIndex[target].length * 100 / (totalRawLines || 1) : 0,
    }

    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(issues.targetIssue || issues.rowIssue || issues.targetRowIssue) ?
          <div className={styles.issueTitle}><span>Issue Found!</span></div> :
          <div className={styles.cleanTitle}><span>Target variable quality looks good!</span></div>}
        <div className={styles.issueBox}>
          {issues.targetIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Your target variable has {problemType === "Classification" ? 'more then two unique values' : 'very few unique values'}. It is not suitable for a {problemType.toLowerCase()} analysis</span>
          </div>}
          {issues.rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Data size is too small</span>
          </div>}
          {issues.targetRowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Some data issues are found. R2 Learn will fix them automatically, you can also fix them by clicking the colored cell.</span>
          </div>}
          {(!issues.targetIssue && !issues.rowIssue && !issues.targetRowIssue) && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Please choose set the major variable and minor variable.</span>
          </div>}
        </div>
      </div>
      <div className={styles.typeBox}>
        {!!targetIssues.mismatchRow.length && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
          <span>Data Type Mismatch</span>
        </div>}
        {!!targetIssues.nullRow.length && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.missing)}></div>
          <span>Missing Value</span>
        </div>}
        {!!targetIssues.outlierRow.length && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.outlier)}></div>
          <span>Outlier</span>
        </div>}
      </div>
      <div className={styles.contentBox}>
        <div className={styles.list}>
          <div className={styles.table}>
            <div className={classnames(styles.cell, styles.target)}><span>Target Variable</span></div>
            <div className={classnames(styles.cell, styles.label)}><span>{target}</span></div>
            <div className={classnames(styles.cell, styles.select)}><span>{colType[target]}</span></div>
            <div className={classnames(styles.cell, styles.error)}>
              {!!targetPercent.mismatch && <div className={classnames(styles.errorBlock, styles.mismatch)}><span>{targetPercent.mismatch.toFixed(2)}%</span></div>}
              {!!targetPercent.missing && <div className={classnames(styles.errorBlock, styles.missing)}><span>{targetPercent.missing.toFixed(2)}%</span></div>}
              {!!targetPercent.outlier && <div className={classnames(styles.errorBlock, styles.outlier)}><span>{targetPercent.outlier.toFixed(2)}%</span></div>}
            </div>
            <div className={styles.tableBody}>
              {sortData.map((v, k) => <div key={k} className={classnames(styles.cell, {
                [styles.mismatch]: targetIssues.mismatchRow.includes(k),
                [styles.missing]: targetIssues.nullRow.includes(k),
                [styles.outlier]: targetIssues.outlierRow.includes(k)
              })}>
                <span>{v[targetIndex]}</span>
              </div>
              )}
            </div>
          </div>
          <ContinueButton onClick={next} text='continue' width="100%" />
        </div>
        <div className={styles.content}>
          {problemType === 'Classification' ?
            <ClassificationTarget project={project}
              backToConnect={this.backToConnect}
              backToSchema={this.backToSchema}
              editTarget={this.editTarget} /> :
            <RegressionTarget backToConnect={this.backToConnect}
              backToSchema={this.backToSchema}
              hasIssue={issues.targetIssue}
              unique={10}
              recomm={recomm} />}
          {issues.rowIssue && <RowIssue backToConnect={this.backToConnect}
            totalRawLines={totalRawLines} />}
          {issues.targetRowIssue && <DataIssue backToConnect={this.backToConnect}
            editFixes={this.editFixes}
            targetIssues={targetIssues}
            totalLines={totalLines}
            percent={percent} />}
        </div>
        {this.isLoad && <ProjectLoading />}
        <Modal content={<FixIssue project={project}
          closeFixes={this.closeFixes}
          saveDataFixes={this.saveDataFixes}
          mismatchIndex={{ [target]: mismatchIndex[target] }}
          nullIndex={{ [target]: nullIndex[target] }}
          outlierIndex={{ [target]: outlierIndex[target] }} />}
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
      {etling && <EtlLoading progress={etlProgress} />}
    </div>
  }
}

@observer
class VariableIssue extends Component {
  @observable visible = false
  @observable summary = false

  handleCheck = e => {
    const checked = e.target.checked
  }

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
  }

  editFixes = () => {
    this.closeSummary()
    if (this.props.project.dataViews) {
      this.visible = true
    } else {
      if (this.isLoad) return false;

      this.isLoad = true

      this.props.project.dataView()
      when(
        () => this.props.project.dataViews,
        () => {
          this.visible = true
          this.isLoad = false
        }
      )
    }
  }

  closeFixes = () => {
    this.visible = false
  }

  showSummary = () => {
    this.summary = true
  }

  closeSummary = () => {
    this.summary = false
  }

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    message.info('Thank you for fixing the issues below. The changes will be applied at training section')
    this.closeFixes();
  }

  render() {
    const { project } = this.props;
    const { issues, issueRows, sortData, target, colType, sortHeader, dataHeader, headerTemp: { temp, isMissed, isDuplicated }, variableIssues, nullIndex, mismatchIndex, outlierIndex, etling, etlProgress } = project;
    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(issues.rowIssue || issues.dataIssue) ?
          <div className={styles.issueTitle}><span>Issue Found!</span></div> :
          <div className={styles.cleanTitle}><span>Variable quality looks good!</span></div>}
        <div className={styles.issueBox}>
          {issues.rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>For your whole dataset. the number of valid data points will be smaller than the recommended minimun 1000</span>
            <div className={styles.button} onClick={this.backToConnect}>
              <button><span>Load a New Dataset</span></button>
            </div>
          </div>}
          {issues.dataIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span className={styles.limitText}>Some data issues are found. You can fix them by cleck the coloured cell, or we will fix them and generate a new dataset automatically.</span>
            <div className={styles.button} onClick={this.editFixes}>
              <button><span>Edit The Fixes</span></button>
            </div>
          </div>}
          {(!issues.rowIssue && !issues.dataIssue) && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Variable quality looks good!.</span>
          </div>}
        </div>
      </div>
      <div className={styles.typeBox}>
        {!!issueRows.mismatchRow.length && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
          <span>Data Type Mismatch</span>
        </div>}
        {!!issueRows.nullRow.length && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.missing)}></div>
          <span>Missing Value</span>
        </div>}
        {!!issueRows.outlierRow.length && <div className={styles.type}>
          <div className={classnames(styles.typeBlock, styles.outlier)}></div>
          <span>Outlier</span>
        </div>}
      </div>
      <div className={styles.variableIssue}>
        <div className={styles.contentBox}>
          <Table
            sortData={sortData}
            target={target}
            colType={colType}
            sortHeader={sortHeader}
            dataHeader={dataHeader}
            temp={temp}
            checkList={[]}
            showSelect={false}
            columnWidth={110}
            rowHeight={34}
            columnCount={dataHeader.length}
            rowCount={sortData.length + 4}
            fixedColumnCount={0}
            fixedRowCount={4}
            checked={null}
            select={null}
            indexPosition='top'
            showIssue={true}
            issues={variableIssues}
            issueIndex={{ nullIndex: { ...nullIndex }, mismatchIndex: { ...mismatchIndex }, outlierIndex: { ...outlierIndex } }}
            targetStyle={styles.targetCell}
          />
        </div>
        <div className={styles.variableBottom}>
          <ContinueButton onClick={this.showSummary} text='continue' width="15%" />
          <div className={styles.checkBox}>
            <input type='checkbox' onChange={this.handleCheck} defaultChecked={false} id="ignoreIssue" />
            <label htmlFor='ignoreIssue'>Ignore these issues<span>(R2.Learn will not fix the issues automatically)</span></label>
          </div>
        </div>
      </div>
      {etling && <EtlLoading progress={etlProgress} />}
      <Modal content={<FixIssue project={project}
        closeFixes={this.closeFixes}
        saveDataFixes={this.saveDataFixes}
        mismatchIndex={{ ...mismatchIndex }}
        nullIndex={{ ...nullIndex }}
        outlierIndex={{ ...outlierIndex }} />}
        visible={this.visible}
        width='12em'
        title='How R2 Learn Will Fix the Issues'
        onClose={this.closeFixes}
        closeByMask={true}
        showClose={true}
      />
      <Modal content={<Summary project={project}
        editFixes={this.editFixes} />}
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
    const { project } = this.props;
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
    const { totalRawLines, totalLines, nullLineCounts, mismatchLineCounts, outlierLineCounts } = this.props.project
    const deleteRows = totalRawLines - totalLines
    const fixedRows = nullLineCounts + mismatchLineCounts + outlierLineCounts
    const cleanRows = totalLines - fixedRows
    const data = [deleteRows, fixedRows, cleanRows]
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
    const { target, sortHeader, nullLineCounts, mismatchLineCounts, outlierLineCounts, totalRawLines, totalLines, nullLineCounts, mismatchLineCounts, outlierLineCounts } = project
    const deletePercent = (totalRawLines - totalLines) / totalRawLines * 100
    const fixedPercent = (nullLineCounts + mismatchLineCounts + outlierLineCounts) / totalRawLines * 100
    const cleanPercent = (totalLines - (nullLineCounts + mismatchLineCounts + outlierLineCounts)) / totalRawLines * 100
    const variableList = sortHeader.slice(1)
    const percentList = sortHeader.map(v => {
      const percent = {
        missing: (nullLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        mismatch: (mismatchLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        outlier: (outlierLineCounts[v] || 0) / (totalRawLines || 1) * 100
      }
      percent.clean = 100 - percent.missing + percent.mismatch + percent.outlier
      return percent
    })
    return <div className={styles.summary}>
      <div className={styles.summaryLeft}>
        <div className={styles.summaryTitle}><span>Your data summary</span></div>
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
        <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Target Variable</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>% Clean Data</span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span>{target}</span></div>
              <div className={styles.summaryCell}><span>{percentList[0].clean.toFixed(2)}%</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Data Composition </span></div>
              <div className={styles.summaryCell}><span>(Hover/touch on bar chart to see details)</span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryProgressBlock}>
                <div className={styles.summaryProgress} style={{ width: percentList[0].clean + '%', backgroundColor: '#00c855' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].mismatch + '%', backgroundColor: '#819ffc' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].missing + '%', backgroundColor: '#ff97a7' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].outlier + '%', backgroundColor: '#f9cf37' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Target Variable</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>% Clean Data</span></div>
            </div>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryCell}><span>{v}</span></div>
                <div className={styles.summaryCell}><span>{percent.clean.toFixed(2)}%</span></div>
              </div>
            })}
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>Data Composition </span></div>
              <div className={styles.summaryCell}><span>(Hover/touch on bar chart to see details)</span></div>
            </div>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
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
        <div className={styles.summaryTitle}><span>R2.Learn will fix the issues</span></div>
        <div className={styles.summaryText}><span>The mush data issues will be deleted by default</span></div>
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
                <span>{fixedPercent.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#c4cbd7' }}></div>
                <span style={{ fontWeight: 'bold' }}>Rows Will Be Deleted</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{deletePercent.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
                <span style={{ fontWeight: 'bold' }}>Clean Data</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{cleanPercent.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryBottom}>
          <div className={classnames(styles.summaryButton, styles.summaryConfirm)} onClick={this.startTrain}><span>Continue</span></div>
          <div className={styles.summaryButton} onClick={editFixes}><span>Edit the Fixes</span></div>
          <div className={styles.summaryButton} onClick={this.backToConnect}><span>Load a Better Dataset</span></div>
        </div>
      </div>
    </div>
  }
}