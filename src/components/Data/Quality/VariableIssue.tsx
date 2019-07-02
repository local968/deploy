import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { ContinueButton, Modal, ProcessLoading, Table, Confirm } from 'components/Common';
import { observable } from 'mobx';
import FixIssue from './Issues/FixIssue'
import Summary from './Summary'
import { message } from 'antd'
import { formatNumber } from '../../../util'
import EN from '../../../constant/en';
import Project from 'stores/Project';

interface VariableIssueProps {
  project: Project,
  changeTab: () => void,
  userStore?:any
}

@inject('userStore')
class VariableIssue extends Component<VariableIssueProps> {
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
    this.props.project.endQuality().then(() => this.summary = true).catch(() => {

      message.destroy();
      message.error("error!!")
    })
    this.onClose()
  }

  formatTable = () => {
    const { target, colType, sortData, sortHeader, dataHeader, variableIssues, etling, rawDataView, mapHeader } = this.props.project;
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
      const headerText = mapHeader[header]

      indexArr.push({
        content: <span>{i + 1}</span>,
        title: i + 1,
        cn: styles.cell
      })

      headerArr.push({
        content: <span>{headerText}</span>,
        title: headerText,
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

    const tableData = data.map((row, rowIndex) => row.map((v, k) => {
      const header = headerList[k] && headerList[k].trim();
      const itemData = {
        content: <span>{v}</span>,
        title: v,
        cn: styles.cell
      }

      const isNum = colType[header] === 'Numerical'
      const { low = NaN, high = NaN } = rawDataView[header]
      const isMissing = isNaN(+v) ? !v : false
      const isMismatch = isNum ? isNaN(+v) : false
      const isOutlier = (header === target && isNum) ? (+v < low || +v > high) : false
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
    const { issues, dataHeader, etling, etlProgress, variableIssueCount: { nullCount, mismatchCount, outlierCount } } = project;
    const tableData = this.formatTable();
    const {quality_Predict_LoadaNewDataset=true,quality_Predict_Continue=true} = this.props.userStore.info.role;
    return <div className={styles.quality}>
      <div className={styles.issue}>
        {(issues.rowIssue || issues.dataIssue) ?
          <div className={styles.issueTitle}><span>{EN.IssueS}{+issues.rowIssue + +issues.dataIssue > 1 && EN.SS} {EN.Found}!</span></div> :
          <div className={styles.cleanTitle}><span>{EN.VariableQualitylooksgood}</span></div>}
        <div className={styles.issueBox}>
          {issues.rowIssue && <div className={styles.issueText}>
            <div className={styles.point}/>
            <span className={styles.limitText}>{EN.Foryourwholedataset}</span>
            <div
              className={styles.button}
              style={{display:(quality_Predict_LoadaNewDataset?'':'none')}}
              onClick={this.backToConnect}>
              <button><span>{EN.LoadaNewDataset}</span></button>
            </div>
          </div>}
          {issues.dataIssue && <div className={styles.issueText}>
            <div className={styles.point}/>
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
        <div className={styles.issueTabs}>
          <div className={styles.issueTab} onClick={changeTab}><span>{EN.TargetVariable}</span></div>
          <div className={styles.issueTab} style={{ borderBottomColor: '#1d2b3c' }}><span style={{ fontWeight: 'bold' }}>{EN.PredictorVariables}</span></div>
        </div>
      </div>
      <div className={styles.variableIssue}>
        <div className={styles.contentBox}>
          <Table
            columnWidth={160}
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
        <div className={styles.variableBottom} style={{display:(quality_Predict_Continue?'':'none')}}>
          <ContinueButton
            onClick={this.showSummary}
            text={EN.Continue} width="15%" disabled={false} />
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
        title={EN.HowR2LearnWillFixtheIssues}
        onClose={this.closeFixes}
        closeByMask={true}
        showClose={true}
      />
      <Modal content={<Summary project={project}
        editFixes={this.editFixes} />}
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

export default observer(VariableIssue)
