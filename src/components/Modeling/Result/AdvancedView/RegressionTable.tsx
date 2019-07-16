import React, { ReactElement, useState, MouseEvent } from 'react'
import styles from './Table.module.css'
import EN from '../../../../constant/en'
import { Icon, Switch, Select, Radio } from 'antd'
import Project from 'stores/Project';
import Model from 'stores/Model';
import { Hint } from 'components/Common';
import { observer } from 'mobx-react';
import { TableHeader } from './AdvancedViewTable';
import moment from 'moment';
import { formatNumber } from '../../../../util'
import RegressionDetailCurves from './RegressionDetailCurves';

const Option = Select.Option

const Headers: TableHeader[] = [
  {
    label: EN.ModelName,
    value: 'name',
    sort: true,
  },
  {
    label: EN.Time,
    value: 'time',
    sort: true,
  },
  {
    label: 'Normalized RMSE',
    value: 'nrmse',
    sort: true,
    hint: EN.RootMeanSquareErrorRMSEmeasures
  },
  {
    label: 'RMSE',
    value: 'rmse',
    sort: true,
    hint: EN.RootMeanSquareErrorprediction
  },
  {
    label: 'MSLE',
    value: 'msle',
    sort: true,
  },
  {
    label: 'RMSLE',
    value: 'rmsle',
    sort: true,
    hint: EN.RMSLEissimilarwithRMSE
  },
  {
    label: 'MSE',
    value: 'mse',
    sort: true,
    hint: EN.MeanSquaredErro
  },
  {
    label: 'MAE',
    value: 'mae',
    sort: true,
    hint: EN.MeanAbsoluteError
  },
  {
    label: <span>R<sup>2</sup></span>,
    value: 'r2',
    sort: true,
    hint: EN.R2isastatisticalmeasure
  },
  {
    label: <span>adjust R<sup>2</sup></span>,
    value: 'adjustR2',
    sort: true,
    hint: EN.TheadjustedR2tells
  }
]

const MetricOptions = [{
  display: 'MSE',
  key: 'mse'
}, {
  display: 'RMSE',
  key: 'rmse'
}, {
  display: <div>R<sup>2</sup></div>,
  key: 'r2'
}]

interface RegressionTableProps {
  project: Project,
  metric: string,
  handleChange: (k: string) => void
  sort: {
    key: string,
    value: number
  },
  handleSort: (k: string) => void,
  models: Model[]
}

const RegressionTable = (props: RegressionTableProps) => {
  const { sort, handleSort, project, metric, handleChange, models } = props
  const { isHoldout } = project

  const sortBy = (key: string) => () => {
    handleSort(key)
  }

  const handleHoldout = () => {
    project.upIsHoldout(!isHoldout);
  }

  return <div className={styles.main}>
    <div className={styles.header}>
      {Headers.map((h, i) => {
        const hintElement = h.hint ? <Hint content={h.hint} /> : null
        let sortElement: null | ReactElement = null
        if (h.sort) {
          if (h.value !== sort.key) sortElement = <Icon type='minus' />
          else sortElement = <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />
        }
        return <div className={`${styles.headerCell} ${h.value === 'name' ? styles.name : ''}`} onClick={sortBy(h.value)} key={i}>
          <span>{hintElement}</span>
          <span className={styles.text}>{h.label}</span>
          <span>{sortElement}</span>
        </div>
      })}
      <div className={styles.toolCell}>
        <div className={styles.tools}>
          <div className={styles.metricSwitch}>
            <span>{EN.Validation}</span>
            <Switch checked={isHoldout} onChange={handleHoldout} style={{ backgroundColor: '#1D2B3C' }} />
            <span>{EN.Holdout}</span>
          </div>
          <div className={styles.metricBg}></div>
          <div className={styles.metric}>
            <span className={styles.metricText} >{EN.MeasurementMetric}</span>
            <Select size="large" value={metric} onChange={handleChange} style={{ width: '120px', fontSize: '1.125rem' }} getPopupContainer={el => el.parentElement}>
              {MetricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
            </Select>
          </div>
        </div>
        <div className={styles.headerCell} onClick={sortBy('validation')}>
          <span className={styles.text}>{EN.Validation}</span>
          <span>{'validation' !== sort.key ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}</span>
        </div>
        <div className={styles.headerCell} onClick={sortBy('holdout')}>
          <span className={styles.text}>{EN.Holdout}</span>
          <span>{'holdout' !== sort.key ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}</span>
        </div>
      </div>
    </div>
    <div className={styles.body}>
      {models.map((m, i) => <RegressionTableRow model={m} project={project} metric={metric} key={i} />)}
    </div>
  </div>
}

export default observer(RegressionTable)

interface RegressionTableRowProps {
  model: Model,
  metric: string,
  project: Project,
}

const RegressionTableRow = observer((props: RegressionTableRowProps) => {
  const { model, project, metric } = props
  const { isHoldout, mapHeader, newVariable, selectModel } = project
  const { score } = model
  const newMapHeader = { ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}), ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}) }

  const modelScore = isHoldout ? score.holdoutScore : score.validateScore
  const [detail, setDetail] = useState(false)

  const handleResult = (e: MouseEvent<HTMLDivElement>) => {
    setDetail(!detail);
  }

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectModel.id === model.id) return
    project.updateProject({ selectId: model.id })
  }

  return <div className={styles.rowBody}>
    <div className={styles.row} onClick={handleResult}>
      <div className={styles.check}><input type='radio' name='modelRadio' checked={selectModel.id === model.id} onClick={handleClick} onChange={() => { }} /></div>
      <div className={`${styles.cell} ${styles.name}`}>
        <span className={styles.text}>{model.id}</span>
        <span className={styles.icon}><Icon type='down' style={detail ? { transform: 'rotateZ(180deg)' } : {}} /></span>
      </div>
      <div className={styles.cell}><span className={styles.text}>{moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.nrmse.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.rmse.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.msle.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.rmsle.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.mse.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.mae.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.r2.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text}>{formatNumber(modelScore.adjustR2.toString())}</span></div>
      <div className={styles.scoreCell}>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model.score.validateScore[metric].toString())}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model.score.holdoutScore[metric].toString())}</span></div>
      </div>
    </div>
    {detail && <RegressionDetailCurves
      project={project}
      model={model}
      mapHeader={newMapHeader}
    />}
  </div>
})