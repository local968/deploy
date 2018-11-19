import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ContinueButton, ProjectLoading, Modal, EtlLoading, Table } from 'components/Common';
import { when, observable } from 'mobx';
import { ClassificationTarget, RegressionTarget, RowIssue, DataIssue, FixIssue, SelectTarget } from './TargetIssue'
import { message } from 'antd'

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
    const { issues, uploadData, target, colType, rawHeader, mismatchIndex, nullIndex, outlierIndex, problemType, targetIssues, totalRawLines, totalLines, etling, etlProgress } = project;
    const targetIndex = rawHeader.findIndex(h => h === target);
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
              {uploadData.map((v, k) => <div key={k} className={classnames(styles.cell, {
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
            issues={targetIssues}
            totalLines={totalLines}
            percent={percent}
            mismatchIndex={{ [target]: mismatchIndex[target] }}
            nullIndex={{ [target]: mismatchIndex[target] }}
            outlierIndex={{ [target]: mismatchIndex[target] }} />}
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
        />
        <Modal content={<SelectTarget project={project} closeTarget={this.closeTarget} saveTargetFixes={this.saveTargetFixes} />}
          visible={this.edit}
          width='5.5em'
          title='How R2 Learn Will Fix the Issues'
          onClose={this.closeTarget}
        />
      </div>
      {etling && <EtlLoading progress={etlProgress} />}
    </div>
  }
}

@observer
class VariableIssue extends Component {
  @observable visible = false

  startTrain = () => {
    const { project } = this.props;
    project.updateProject(project.nextMainStep(3))
  }

  handleCheck = e => {
    const checked = e.target.checked
  }

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
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

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    message.info('Thank you for fixing the issues below. The changes will be applied at training section')
    this.closeFixes();
  }

  render() {
    const { project } = this.props;
    const { issues, issueRows, uploadData, target, colType, rawHeader, dataHeader, headerTemp: { temp, isMissed, isDuplicated }, variableIssues, nullIndex, mismatchIndex, outlierIndex, etling, etlProgress } = project;
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
              <button><span>How R2.Learn Will Fix The Issues</span></button>
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
            uploadData={uploadData}
            target={target}
            colType={colType}
            rawHeader={rawHeader}
            dataHeader={dataHeader}
            temp={temp}
            checkList={[]}
            showSelect={false}
            columnWidth={110}
            rowHeight={34}
            columnCount={dataHeader.length}
            rowCount={uploadData.length + 4}
            fixedColumnCount={0}
            fixedRowCount={3}
            checked={null}
            select={null}
            indexPosition='top'
            showIssue={true}
            issues={variableIssues}
            issueIndex={{ nullIndex: { ...nullIndex }, mismatchIndex: { ...mismatchIndex }, outlierIndex: { ...outlierIndex } }}
          />
        </div>
        <div className={styles.variableBottom}>
          <ContinueButton onClick={this.startTrain} text='continue' width="15%" />
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
      />
    </div>
  }
}