import React, { ReactElement } from 'react'
import styles from './ClassificationTable.module.css'
import EN from '../../../../constant/en'
import { InputNumber, Icon, Switch, Select } from 'antd'
import Project from 'stores/Project';
import Model from 'stores/Model';
import { Hint } from 'components/Common';
import { observer } from 'mobx-react';
import { TableHeader } from './AdvancedViewTable';

const Option = Select.Option

const Headers: TableHeader[] = [
  {
    label: EN.ModelName,
    value: 'name',
    sort: true,
  },
  {
    label: 'Fbeta',
    value: 'fbeta',
    sort: true,
    hint: <p>{EN.TheFbetascoreistheharmonicmean}<br /><br />{EN.PrecisionRecallbeta}</p>
  },
  {
    label: 'Precision',
    value: 'precision',
    sort: true,
    hint: <p>{EN.Itmeasureshowmanytruepositivesamong}</p>
  },
  {
    label: 'Recall',
    value: 'recall',
    sort: true,
    hint: EN.Itrepresentsthecompleteness
  },
  {
    label: 'LogLoss',
    value: 'logLoss',
    sort: true,
    hint: <p>{EN.LogLossis}<br /><br />{EN.Thelikelihoodfunctionanswers}</p>
  },
  {
    label: 'Cutoff Threshold',
    value: 'cutoff',
    sort: true,
    hint: EN.Manyclassifiersareabletoproduce
  },
  {
    label: 'KS',
    value: 'ks',
    sort: true,
    hint: EN.Efficientwaytodetermine
  },
  {
    label: EN.Time,
    value: 'time',
    sort: true,
  }
]

const MetricOptions = [{
  display: 'Accuracy',
  key: 'acc'
}, {
  display: 'AUC',
  key: 'auc'
}, {
  display: 'F1',
  key: 'f1'
}, {
  display: 'Precision',
  key: 'precision'
}, {
  display: 'Recall',
  key: 'recall'
}, {
  key: "log_loss",
  display: 'LogLoss'
}]

interface ClassificationTableProps {
  project: Project,
  metric: string,
  handleChange: (k: string) => void
  sort: {
    key: string,
    value: number
  },
  handleSort: (k: string) => void
}

const ClassificationTable = (props: ClassificationTableProps) => {
  const { sort, handleSort, project, metric, handleChange } = props
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

        return <div className={styles.cell} onClick={sortBy(h.value)} key={i}>
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
            <Select size="large" value={metric} onChange={handleChange} style={{ width: '150px', fontSize: '1.125rem' }} getPopupContainer={el => el.parentElement}>
              {MetricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
            </Select>
          </div>
        </div>
        <div className={styles.cell} onClick={sortBy('validation')}>
          <span className={styles.text}>{EN.Validation}</span>
          <span>{'validation' !== sort.key ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}</span>
        </div>
        <div className={styles.cell} onClick={sortBy('holdout')}>
          <span className={styles.text}>{EN.Holdout}</span>
          <span>{'holdout' !== sort.key ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}</span>
        </div>
      </div>
    </div>
  </div>
}

export default observer(ClassificationTable)