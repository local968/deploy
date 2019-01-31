import React, { Component } from 'react'
import styles from './styles.module.css'
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import Summary from './Summary'
import CorrelationMatrix from 'components/Modeling/Start/CorrelationMatrix'
import VariableList from './VariableList'
import ClassificationPerformance from './Model/ClassificationPerformance'
import RegressionPerformance from './Model/RegressionPerformance'
import VariableImpact from './Model/VariableImpact'
import ModelProcessFlow from './Model/ModelProcessFlow'
import Score from './Score'

@inject('projectStore')
@observer
class Report extends Component {
  constructor(props) {
    super(props)
    props.projectStore.currentId = props.projectStore.list[0].id
  }
  render() {
    const { projectStore: { project } } = this.props
    return <div className={styles.report}>
      <h1 className={styles.title}>Report</h1>
      <div className={classnames(styles.block, styles.profile)}>
        <h3 className={styles.blockTitle}>Profile</h3>
        <div className={styles.blockRow}>Project Name: {project.name || '-'}</div>
        <div className={styles.blockRow}>Project Statement: {project.statement || '-'}</div>
        <div className={styles.blockRow}>Business Value: {project.business || '-'}</div>
        <div className={styles.blockRow}>Problem Type: {project.problemType}</div>
        <div className={styles.blockRow}>Dataset: {project.fileNames[0] || '-'}</div>
        <div className={styles.blockRow}>Data Size: {'-'}</div>
      </div>
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Summary</h3>
        <Summary project={project} />
      </div>
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Target:{project.target}</h3>
        <div className={styles.blockRow}>
          <div className={styles.target}>
            <span className={styles.etlTitle}>Before ETL</span>
            <img className={styles.targetPlot} src={project.rawHistgramPlotsBase64[project.target]} />
          </div>
          <div className={styles.target}>
            <span className={styles.etlTitle}>After ETL</span>
            <img className={styles.targetPlot} src={project.histgramPlotsBase64[project.target]} />
          </div>
        </div>
      </div>
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Variable List</h3>
        <div className={styles.blockRow}><VariableList project={project} /></div>
      </div>
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Correlation Matrix</h3>
        <div className={classnames(styles.blockRow, styles.correlationMatrix)}><CorrelationMatrix
          data={project.correlationMatrixData}
          header={project.correlationMatrixHeader} /></div>
      </div>
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Model: {project.selectModel.name}</h3>
        {project.problemType === 'Classification' && <div className={styles.blockRow}><ClassificationPerformance project={project} /></div>}
        {project.problemType === 'Regression' && <div className={classnames(styles.blockRow, styles.performance)}><RegressionPerformance project={project} /></div>}
      </div>
      <div className={classnames(styles.block, styles.VariableImpact)}>
        <h3 className={styles.blockTitle}>Variable Impact</h3>
        <div className={styles.blockRow}><VariableImpact model={project.selectModel} /></div>
      </div>
      <div className={classnames(styles.block, styles.processFlow)}>
        <h3 className={styles.blockTitle}>Process Flow</h3>
        <div className={styles.blockRow}><ModelProcessFlow model={project.selectModel} /></div>
      </div>
      <div className={classnames(styles.block, styles.score)}>
        <h3 className={styles.blockTitle}>Score</h3>
        <div className={styles.blockRow}><Score models={[project.selectModel]} project={project} /></div>
      </div>
    </div>
  }
}

export default Report
