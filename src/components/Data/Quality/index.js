import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ContinueButton, ProjectLoading, Modal } from 'components/Common';
import { when, observable } from 'mobx';
import { TargetIssue, RowIssue, DataIssue, FixIssue, SelectTarget } from './TargetIssue'

@observer
export default class DataQuality extends Component {
  @observable visible = false
  @observable isLoad = false
  @observable edit = false

  startTrain = () => {
    const { nextMainStep, updateProject } = this.props.project
    updateProject(nextMainStep(3));
  }

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
    this.closeTarget();
  }

  saveDataFixes = () => {
    this.props.project.fixFillMethod()
    this.closeFixes();
  }

  render() {
    const { project } = this.props;
    const { issues, uploadData, cleanData, target, targetMap, colType, colMap, rawHeader, mismatchIndex, nullIndexes, outlierIndex, problemType, totalLines, issueRows, totalRawLines, etling } = project;
    const targetIndex = rawHeader.findIndex(h => h === target);
    const recomm = problemType === 'Classification' ? '2' : '10+';
    const percent = {
      missing: issueRows.nullRow.length * 100 / (totalRawLines || 1),
      mismatch: issueRows.mismatchRow.length * 100 / (totalRawLines || 1),
      outlier: issueRows.outlierRow.length * 100 / (totalRawLines || 1),
    }
    const targetPercent = {
      missing: (nullIndexes[target] ? nullIndexes[target].length : 0) * 100 / (totalRawLines || 1),
      mismatch: (mismatchIndex[target] ? mismatchIndex[target].length : 0) * 100 / (totalRawLines || 1),
      outlier: colType[target] === 'Numerical' ? outlierIndex[target].length * 100 / (totalRawLines || 1) : 0,
    }
    const hasCleanData = !!cleanData.length
    let num = 0;
    let arr = [];
    if (issues.targetIssue) {
      const unique = colType[target] === 'Categorical' ? Object.keys(colMap[target]).length : 10;
      arr.push(<TargetIssue num={num} backToConnect={this.backToConnect} backToSchema={this.backToSchema} editTarget={this.editTarget} unique={unique} recomm={recomm} key={num} />);
      num++;
    }
    if (issues.rowIssue) {
      arr.push(<RowIssue num={num} backToConnect={this.backToConnect} totalRawLines={totalRawLines} key={num} />);
      num++;
    }
    if (issues.dataIssue) {
      arr.push(<DataIssue num={num} backToConnect={this.backToConnect} editFixes={this.editFixes} issueRows={issueRows} totalLines={totalLines} percent={percent} key={num} />);
      num++;
    }

    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(issues.targetIssue || issues.rowIssue || issues.dataIssue) ?
          <div className={styles.issueTitle}><span>Issue Found!</span></div> :
          <div className={styles.cleanTitle}><span>No data issues were detected in your target variable!</span></div>}
        <div className={styles.issueBox}>
          {issues.targetIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Your target variable has {problemType === "Classification" ? 'more then two unique values' : 'very few unique values'}. It is not suitable for a {problemType.toLowerCase()} analysis</span>
          </div>}
          {issues.rowIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Data size is too small</span>
          </div>}
          {issues.dataIssue && <div className={styles.issueText}>
            <div className={styles.point}></div>
            <span>Some data issues are found. R2 Learn will fix them automatically, you can also fix them by clicking the colored cell.</span>
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
              {(hasCleanData ? cleanData : uploadData).map((v, k) => <div key={k} className={classnames(styles.cell, {
                [styles.mismatch]: mismatchIndex[target] && mismatchIndex[target].includes(k),
                [styles.missing]: nullIndexes[target] && nullIndexes[target].includes(k),
                [styles.outlier]: colType[target] !== 'Categorical' && outlierIndex[target] && outlierIndex[target].includes(k)
              })}><span>{console.log(colMap[target], v[targetIndex], 'hasCleanData')}{hasCleanData ? (Object.entries({...colMap[target], ...targetMap}).find(arr => arr[1] == v[targetIndex]) || [])[0] : v[targetIndex]}</span></div>)}
            </div>
          </div>
          <ContinueButton onClick={this.startTrain} text='continue' width="100%" />
        </div>
        <div className={styles.content}>
          {arr}
        </div>
      </div>
      {(this.isLoad || etling) && <ProjectLoading />}
      <Modal content={<FixIssue project={project} closeFixes={this.closeFixes} saveDataFixes={this.saveDataFixes} />}
        visible={this.visible}
        width='12em'
        title='How R2 Learn Will Fix the Issues'
        onClose={this.closeFixes}
      />
      <Modal content={<SelectTarget project={project} closeTarget={this.closeTarget} saveTargetFixes={this.saveTargetFixes} />}
        visible={this.edit}
        width='12em'
        title='How R2 Learn Will Fix the Issues'
        onClose={this.closeTarget}
      />
    </div>
  }
}

