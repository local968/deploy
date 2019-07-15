import React, { useState, ReactElement } from 'react'
import styles from './AdvancedViewTable.module.css'
import EN from '../../../../constant/en'
import { InputNumber } from 'antd'
import Project from 'stores/Project';
import Model from 'stores/Model';
import { Hint } from 'components/Common';
import { observer } from 'mobx-react';
import ClassificationTable from './ClassificationTable'

interface AdvancedViewTableProps {
  project: Project,
  sort: {
    key: string,
    value: number
  }
  handleSort: (k: string) => void,
  metric: string,
  handleChange: (k: string) => void
}

export interface TableHeader {
  label: string,
  value: string,
  sort: boolean,
  hint?: string | ReactElement
}

const AdvancedViewTable = (props: AdvancedViewTableProps) => {
  const { project, sort, handleSort, metric, handleChange } = props
  const { problemType } = project
  const [fbeta, setFbeta] = useState(project.fbeta)

  const handleBeta = value => {
    setFbeta(value)
  }

  const submitBeta = () => {
    project.updateProject({ fbeta })
  }

  return <div className={styles.main}>
    <div className={styles.option}>
      {problemType === 'Classification' && <div className={styles.metricFbeta}>
        <span>{EN.FbetaValue}<Hint content={EN.FbetaValueHint} /></span>
        <InputNumber min={0.1} max={10} step={0.1} style={{ marginLeft: 10 }} onChange={handleBeta} value={fbeta} />
        <div className={styles.metricFbetaBlock}>
          <div onClick={submitBeta} className={styles.metricFbetaBtn}><span>{EN.Submit}</span></div>
        </div>
      </div>}
    </div>
    <div className={styles.table}>
      {problemType === 'Classification' ?
        <ClassificationTable sort={sort} handleSort={handleSort} project={project} metric={metric} handleChange={handleChange} /> :
        <ClassificationTable sort={sort} handleSort={handleSort} project={project} metric={metric} handleChange={handleChange} />}
    </div>
  </div>
}

export default observer(AdvancedViewTable)