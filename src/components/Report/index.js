import React, { Component } from 'react'
import styles from './styles.module.css'
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import Summary from './Summary'
import CorrelationMatrix from 'components/Modeling/Start/CorrelationMatrix'
import VariableList from './VariableList'
import VariableImpact from './Model/VariableImpact'
import ModelProcessFlow from './Model/ModelProcessFlow'
import Score from './Score'
import { observable, action } from 'mobx';
import { Checkbox } from 'antd';

const addComma = number => {
  if (Number.isNaN(number)) return number
  number = number.toString().split('')
  if (number.length <= 3) return number.join('')
  number.reverse()

  let start = number.length
  while (start % 3 !== 0) start++
  start -= 3
  for (let i = start; i > 2; i -= 3) {
    number.splice(i, 0, ',')
  }
  return number.reverse().join('')
}

@inject('projectStore')
@observer
class Report extends Component {

  @observable isEdit = false

  @observable config = {
    profile: true,
    dataSchema: true,
    dataQuality: true,
    dataAnalysis: true,
    correlationMatrix: true,
    modelName: true,
    metrics: true,
    variableImpact: true,
    score: true,
    processFlow: true
  }

  constructor(props) {
    super(props)
    props.projectStore.currentId = props.projectStore.list[0].id
  }

  reset = () => {
    const project = this.props.projectStore.project
    project.selectModel.resetFitIndex()
    project.costOption.FN = 0
    project.costOption.FP = 0
    project.costOption.TN = 0
    project.costOption.TP = 0
  }

  toggleEdit = action(() => {
    this.isEdit = !this.isEdit
  })

  isShow = (name) => {
    return this.isEdit || this.config[name]
  }

  checkChange = (name) => action((e) => {
    this.config[name] = e.target.checked
  })

  checkBox = (name) => this.isEdit && <Checkbox onChange={this.checkChange(name)} checked={this.config[name]} />

  render() {
    const { projectStore: { project } } = this.props
    const { selectModel: model } = project
    const { score: { validateScore: vs, holdoutScore: hs }, fitIndex, chartData } = model
    const { roc, rocHoldout: roch } = chartData || {}
    return <div className={styles.report}>
      <h1 className={styles.title}>Project Report: {project.name}<small onClick={this.toggleEdit}>{this.isEdit ? 'Save' : 'Edit Module'}</small></h1>
      {this.isShow('profile') && <div className={classnames(styles.block, styles.profile)}>
        {this.checkBox('profile')}
        <h3 className={styles.blockTitle}>Profile</h3>
        <div className={styles.blockRow}>Project Statement: {project.statement || '-'}</div>
        <div className={styles.blockRow}>Business Value: {project.business || '-'}</div>
        <div className={styles.blockRow}>Problem Type: {project.problemType}</div>
        <div className={styles.blockRow}>Dataset: {project.fileNames[0] || '-'}</div>
      </div>}
      {this.isShow('dataSchema') && <div className={styles.block}>
        {this.checkBox('dataSchema')}
        <h3 className={styles.blockTitle}>Data Schema</h3>
        <div className={styles.schema}>
          <div className={classnames(styles.schemaRow, styles.schemaHeader)}>
            <span className={styles.schemaCell}>#row</span>
            <span className={styles.schemaCell}>#col</span>
            <span className={styles.schemaCell}>#cat</span>
            <span className={styles.schemaCell}>#num</span>
          </div>
          <div className={styles.schemaRow}>
            <span className={styles.schemaCell}>{addComma(project.totalRawLines)}</span>
            <span className={styles.schemaCell}>{addComma(Object.entries(project.colType).length)}</span>
            <span className={styles.schemaCell}>{addComma(Object.entries(project.colType).filter(([k, v]) => v === 'Categorical').length)}</span>
            <span className={styles.schemaCell}>{addComma(Object.entries(project.colType).filter(([k, v]) => v === 'Numerical').length)}</span>
          </div>
        </div>
      </div>}
      {this.isShow('dataQuality') && <div className={styles.block}>
        {this.checkBox('dataQuality')}
        <h3 className={styles.blockTitle}>Data Quality:</h3>
        <Summary project={project} />
      </div>}
      {this.isShow('dataAnalysis') && <div className={styles.block}>
        {this.checkBox('dataAnalysis')}
        <h3 className={styles.blockTitle}>Exploratory Data Analysis</h3>
        <div className={styles.blockRow}><VariableList project={project} /></div>
      </div>}
      {this.isShow('correlationMatrix') && <div className={styles.block}>
        {this.checkBox('correlationMatrix')}
        <h3 className={styles.blockTitle}>Correlation Matrix</h3>
        <div className={classnames(styles.blockRow, styles.correlationMatrix)}><CorrelationMatrix
          data={project.correlationMatrixData}
          header={project.correlationMatrixHeader} /></div>
      </div>}
      <h1 className={styles.title}>Model Result: </h1>
      {this.isShow('modelName') && <div className={styles.block}>
        {this.checkBox('modelName')}
        <h3 className={styles.blockTitle}>Model Name: {project.selectModel.name}</h3>
        {/* {project.problemType === 'Classification' && <div className={styles.blockRow}><ClassificationPerformance project={project} /></div>} */}
        {/* {project.problemType === 'Regression' && <div className={classnames(styles.blockRow, styles.performance)}><RegressionPerformance project={project} /></div>} */}
      </div>}
      {this.isShow('metrics') && <div className={classnames(styles.block, styles.VariableImpact)}>
        {this.checkBox('metrics')}
        <h3 className={styles.blockTitle}>Metrics:</h3>
        {project.problemType === 'Regression' && <div className={styles.metrics}>
          <div className={classnames(styles.metricsRow, styles.metricsHeader)}>
            <span className={styles.metricsCell}></span>
            <span className={styles.metricsCell}>R²</span>
            <span className={styles.metricsCell}>Adjusted R²</span>
            <span className={styles.metricsCell}>MSE</span>
            <span className={styles.metricsCell}>RMSE</span>
            <span className={styles.metricsCell}>NRMSE</span>
            <span className={styles.metricsCell}>MAE</span>
          </div>
          <div className={styles.metricsRow}>
            <span className={styles.metricsCell}>Validation</span>
            <span className={styles.metricsCell} title={vs.r2}>{vs.r2}</span>
            <span className={styles.metricsCell} title={vs.adjustR2}>{vs.adjustR2}</span>
            <span className={styles.metricsCell} title={vs.mse}>{vs.mse}</span>
            <span className={styles.metricsCell} title={vs.rmse}>{vs.rmse}</span>
            <span className={styles.metricsCell} title={vs.nrmse}>{vs.nrmse}</span>
            <span className={styles.metricsCell} title={vs.mae}>{vs.mae}</span>
          </div>
          <div className={styles.metricsRow}>
            <span className={styles.metricsCell}>Holdout</span>
            <span className={styles.metricsCell} title={hs.r2}>{hs.r2}</span>
            <span className={styles.metricsCell} title={hs.adjustR2}>{hs.adjustR2}</span>
            <span className={styles.metricsCell} title={hs.mse}>{hs.mse}</span>
            <span className={styles.metricsCell} title={hs.rmse}>{hs.rmse}</span>
            <span className={styles.metricsCell} title={hs.nrmse}>{hs.nrmse}</span>
            <span className={styles.metricsCell} title={hs.mae}>{hs.mae}</span>
          </div>
        </div>}
        {project.problemType === 'Classification' && <div className={styles.metrics}>
          <div className={classnames(styles.metricsRow, styles.metricsHeader)}>
            <span className={styles.metricsCell}></span>
            <span className={styles.metricsCell}>AUC</span>
            <span className={styles.metricsCell}>Cutoff</span>
            <span className={styles.metricsCell}>Accuracy</span>
            <span className={styles.metricsCell}>Precision</span>
            <span className={styles.metricsCell}>Recall</span>
            <span className={styles.metricsCell}>F1 Score</span>
            <span className={styles.metricsCell}>KS</span>
            <span className={styles.metricsCell}>LogLoss</span>
          </div>
          <div className={styles.metricsRow}>
            <span className={styles.metricsCell}>Validation</span>
            <span className={styles.metricsCell} title={vs.auc}>{vs.auc}</span>
            <span className={styles.metricsCell} title={roc.Threshold[fitIndex]}>{roc.Threshold[fitIndex]}</span>
            <span className={styles.metricsCell} title={model.accValidation}>{model.accValidation}</span>
            <span className={styles.metricsCell} title={roc.Precision[fitIndex]}>{roc.Precision[fitIndex]}</span>
            <span className={styles.metricsCell} title={roc.Recall[fitIndex]}>{roc.Recall[fitIndex]}</span>
            <span className={styles.metricsCell} title={roc.F1[fitIndex]}>{roc.F1[fitIndex]}</span>
            <span className={styles.metricsCell} title={roc.KS[fitIndex]}>{roc.KS[fitIndex]}</span>
            <span className={styles.metricsCell} title={roc.LOGLOSS[fitIndex]}>{roc.LOGLOSS[fitIndex]}</span>
          </div>
          <div className={styles.metricsRow}>
            <span className={styles.metricsCell}>Holdout</span>
            <span className={styles.metricsCell} title={hs.auc}>{hs.auc}</span>
            <span className={styles.metricsCell} title={roch.Threshold[fitIndex]}>{roch.Threshold[fitIndex]}</span>
            <span className={styles.metricsCell} title={model.accHoldout}>{model.accHoldout}</span>
            <span className={styles.metricsCell} title={roch.Precision[fitIndex]}>{roch.Precision[fitIndex]}</span>
            <span className={styles.metricsCell} title={roch.Recall[fitIndex]}>{roch.Recall[fitIndex]}</span>
            <span className={styles.metricsCell} title={roch.F1[fitIndex]}>{roch.F1[fitIndex]}</span>
            <span className={styles.metricsCell} title={roch.KS[fitIndex]}>{roch.KS[fitIndex]}</span>
            <span className={styles.metricsCell} title={roch.LOGLOSS[fitIndex]}>{roch.LOGLOSS[fitIndex]}</span>
          </div>
        </div>}
      </div>}
      {this.isShow('variableImpact') && <div className={classnames(styles.block, styles.VariableImpact)}>
        {this.checkBox('variableImpact')}
        <h3 className={styles.blockTitle}>Variable Impact</h3>
        <div className={styles.blockRow}><VariableImpact model={project.selectModel} /></div>
      </div>}
      {this.isShow('score') && <div className={classnames(styles.block, styles.score)}>
        {this.checkBox('score')}
        <h3 className={styles.blockTitle}>Score <small onClick={this.reset}> reset</small></h3>
        <div className={styles.blockRow}><Score models={[project.selectModel]} project={project} /></div>
      </div>}
      {this.isShow('processFlow') && <div className={classnames(styles.block, styles.processFlow)}>
        {this.checkBox('processFlow')}
        <h3 className={styles.blockTitle}>Process Flow</h3>
        <div className={styles.blockRow}><ModelProcessFlow model={project.selectModel} /></div>
      </div>}
    </div>
  }
}

export default Report
