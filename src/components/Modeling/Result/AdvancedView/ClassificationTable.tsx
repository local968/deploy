import React, { ReactElement, useState, MouseEvent } from 'react'
import styles from './Table.module.css'
import EN from '../../../../constant/en'
import { Icon, Switch, Select, Tooltip } from 'antd'
import Project from 'stores/Project';
import Model from 'stores/Model';
import { Hint } from 'components/Common';
import { observer } from 'mobx-react';
import { TableHeader } from './AdvancedViewTable';
import moment from 'moment';
import { formatNumber } from '../../../../util'
import DetailCurves from './DetailCurves';

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
  handleSort: (k: string) => void,
  models: Model[]
}

const ClassificationTable = (props: ClassificationTableProps) => {
  const { sort, handleSort, project, metric, handleChange, models } = props
  const { isHoldout } = project
  const [detailArr, setDetail] = useState([] as string[])

  const sortBy = (key: string) => () => {
    handleSort(key)
  }

  const handleHoldout = () => {
    project.upIsHoldout(!isHoldout);
  }

  const handleDetail = (s: string) => {
    if (detailArr.includes(s)) return setDetail(detailArr.filter(d => s !== s))
    return setDetail([...detailArr, s])
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
      {models.map((m, i) => <ClassificationRow model={m} project={project} metric={metric} key={i} detail={detailArr.includes(m.id)} handleDetail={handleDetail} />)}
    </div>
  </div>
}

export default observer(ClassificationTable)

interface ClassificationRowProps {
  model: Model,
  metric: string,
  project: Project,
  detail: boolean,
  handleDetail: (s: string) => void
}

const ClassificationRow = observer((props: ClassificationRowProps) => {
  const { model, project, metric, detail, handleDetail } = props
  const { isHoldout, fbeta, targetArray, targetColMap, renameVariable, selectModel, defualtRecommendModel, criteria, costOption: { TP, FN, FP, TN } } = project
  const isRecommend = defualtRecommendModel[0] ? defualtRecommendModel[0].id === model.id : false
  const [v0, v1] = !targetArray.length ? Object.keys(targetColMap) : targetArray;
  const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];
  const text =
    criteria === 'cost' && (TP || FN || FP || TN)
      ? EN.BenefitCost
      : EN.Recommended;
  const type = isHoldout ? 'Holdout' : 'Validation'

  const handleResult = (id) => () => {
    handleDetail(id);
  }

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectModel.id === model.id) return
    project.updateProject({ selectId: model.id })
  }

  return <div className={styles.rowBody}>
    <Tooltip
      placement="left"
      title={isRecommend ? text : EN.Selected}
      visible={selectModel.id === model.id || isRecommend}
      overlayClassName={styles.recommendLabel}
      autoAdjustOverflow={false}
      arrowPointAtCenter={true}
      getPopupContainer={el => el.parentElement}
    >
      <div className={styles.row} onClick={handleResult(model.id)}>
        <div className={styles.check}><input type='radio' name='modelRadio' checked={selectModel.id === model.id} onClick={handleClick} onChange={() => { }} /></div>
        <div className={`${styles.cell} ${styles.name}`}>
          <span className={styles.text}>{model.id}</span>
          <span className={styles.icon}><Icon type='down' style={detail ? { transform: 'rotateZ(180deg)' } : {}} /></span>
        </div>
        <div className={styles.cell}><span className={styles.text}>{moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model.fbeta(fbeta, type).toString())}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model[`precision${type}`].toString())}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model[`recall${type}`].toString())}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model[`logloss${type}`].toString())}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model.cutoff.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text}>{formatNumber(model[`ks${type}`].toString())}</span></div>
        <div className={styles.scoreCell}>
          <div className={styles.cell}><span className={styles.text}>{formatNumber(metric === 'fbeta' ? model.fbeta(fbeta, 'Validation') : model[`${metric}Validation`].toString())}</span></div>
          <div className={styles.cell}><span className={styles.text}>{formatNumber(metric === 'fbeta' ? model.fbeta(fbeta, 'Holdout') : model[`${metric}Holdout`].toString())}</span></div>
        </div>
      </div>
    </Tooltip>
    {detail && <DetailCurves
      model={model}
      yes={yes}
      no={no}
      project={project}
    />}
  </div>
})