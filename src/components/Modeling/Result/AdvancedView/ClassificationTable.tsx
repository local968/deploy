import React, { ReactElement, useState, MouseEvent, useMemo } from 'react'
import styles from './Table.module.css'
import EN from '../../../../constant/en'
import { Icon, Switch, Select, Tooltip } from 'antd'
import Project from 'stores/Project';
import Model from 'stores/Model';
import { Hint } from 'components/Common';
import {observer } from 'mobx-react';
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
  display: 'Fbeta',
  key: 'fbeta'
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
  models: Model[],
  currentSettingId: string
}

const ClassificationTable = (props: ClassificationTableProps) => {
  const { sort, handleSort, project, metric, handleChange, models, currentSettingId } = props;
  const { isHoldout, fbeta } = project;
  const [detailArr, setDetail] = useState([] as string[]);

  const sortMethods = (aModel, bModel) => {
    switch (sort.key) {
      case 'fbeta':
        {
          const dataKey = isHoldout ? 'Holdout' : 'Validation'
          const aModelData = aModel.fbeta(fbeta, dataKey)
          const bModelData = bModel.fbeta(fbeta, dataKey)
          return (aModelData - bModelData) * sort.value
        }
      case 'precision':
        {
          const dataKey = isHoldout ? 'Holdout' : 'Validation'
          const aModelData = aModel[`precision${dataKey}`]
          const bModelData = bModel[`precision${dataKey}`]
          return (aModelData - bModelData) * sort.value
        }
      case 'recall':
        {
          const dataKey = isHoldout ? 'Holdout' : 'Validation'
          const aModelData = aModel[`recall${dataKey}`]
          const bModelData = bModel[`recall${dataKey}`]
          return (aModelData - bModelData) * sort.value
        }
      case 'logLoss':
        {
          const aFitIndex = aModel.fitIndex
          const bFitIndex = bModel.fitIndex
          const dataKey = isHoldout ? 'holdoutChartData' : 'chartData'
          const aModelData = (aModel[dataKey].roc.LOGLOSS[aFitIndex])
          const bModelData = (bModel[dataKey].roc.LOGLOSS[bFitIndex])
          return (aModelData - bModelData) * sort.value
        }
      case 'cutoff':
        {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const dataKey = isHoldout ? 'holdoutChartData' : 'chartData';
          const aModelData = (aModel[dataKey].roc.Threshold[aFitIndex]);
          const bModelData = (bModel[dataKey].roc.Threshold[bFitIndex]);
          return (aModelData - bModelData) * sort.value
        }
      case 'validation':
        {
          const aModelData = metric === 'fbeta' ? aModel.fbeta(fbeta, 'Validation') : aModel[(metric === 'log_loss' ? 'logloss' : metric) + 'Validation']
          const bModelData = metric === 'fbeta' ? bModel.fbeta(fbeta, 'Validation') : bModel[(metric === 'log_loss' ? 'logloss' : metric) + 'Validation']
          return (aModelData - bModelData) * sort.value
        }
      case 'holdout':
        {
          const aModelData = metric === 'fbeta' ? aModel.fbeta(fbeta, 'Holdout') : aModel[(metric === 'log_loss' ? 'logloss' : metric) + 'Holdout']
          const bModelData = metric === 'fbeta' ? bModel.fbeta(fbeta, 'Holdout') : bModel[(metric === 'log_loss' ? 'logloss' : metric) + 'Holdout']
          return (aModelData - bModelData) * sort.value
        }
      case 'ks':
        {
          const dataKey = isHoldout ? 'Holdout' : 'Validation'
          const aModelData = aModel[`ks${dataKey}`]
          const bModelData = bModel[`ks${dataKey}`]
          return (aModelData - bModelData) * sort.value
        }
      case 'time':
        return (sort.value === 1 ? 1 : -1) * ((aModel.createTime || 0) - (bModel.createTime || 0))
      case 'name':
      default:
        return (aModel.modelName > bModel.modelName ? 1 : -1) * (sort.value === 1 ? 1 : -1)
      // const aModelTime = aModel.name.split('.').splice(1, Infinity).join('.');
      // const aModelUnix = moment(aModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
      // const bModelTime = bModel.name.split('.').splice(1, Infinity).join('.');
      // const bModelUnix = moment(bModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
      // return this.sortState[currentSort] === 1 ? aModelUnix - bModelUnix : bModelUnix - aModelUnix
    }
  };

  const filtedModels = useMemo(() => {
    let _models = [...models];
    if (currentSettingId !== 'all') {
      const currentSetting = project.settings.find(setting => setting.id === currentSettingId)
      if (currentSetting) _models = _models.filter(model => model.settingId === currentSetting.id)
    }
    return _models.sort(sortMethods)
  }, [models.map(m => m.fitIndex), sort.key, sort.value, currentSettingId])

  const sortBy = (key: string) => () => {
    handleSort(key)
  }

  const handleHoldout = () => {
    project.upIsHoldout(!isHoldout);
  }

  const handleDetail = (s: string) => {
    if (detailArr.includes(s)) return setDetail(detailArr.filter(d => d !== s))
    return setDetail([...detailArr, s])
  };
  const modelElements = useMemo(() => {
    return models.reduce((els, m) => ({ ...els, [m.id]: <Row
        model={m}
        metric={metric}
        project={project}
        key={m.id}
        detail={detailArr.includes(m.id)}
        handleDetail={handleDetail} /> }), {})
  }, [detailArr, metric,isHoldout]);

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
          <span className={styles.text} title={h.label}>{h.label}</span>
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
          <div className={styles.metricBg}/>
          <div className={styles.metric}>
            <span className={styles.metricText} >{EN.MeasurementMetric}</span>
            <Select size="large" value={metric} onChange={handleChange} style={{ width: '120px', fontSize: '1.125rem' }} getPopupContainer={el => el.parentElement}>
              {MetricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
            </Select>
          </div>
        </div>
        <div className={styles.headerCell} onClick={sortBy('validation')}>
          <span className={styles.text} title={EN.Validation}>{EN.Validation}</span>
          <span>{'validation' !== sort.key ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}</span>
        </div>
        <div className={styles.headerCell} onClick={sortBy('holdout')}>
          <span className={styles.text} title={EN.Holdout}>{EN.Holdout}</span>
          <span>{'holdout' !== sort.key ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}</span>
        </div>
      </div>
    </div>
    <div className={styles.body}>
      {filtedModels.map(m => modelElements[m.id])}
    </div>
  </div>
}

export default observer(ClassificationTable)

interface ClassificationRowProps {
  model: Model,
  metric: string,
  project: Project,
  detail: boolean,
  handleDetail: (s: string) => void,
}

const ClassificationRow = observer((props: ClassificationRowProps) => {
  const { model, project, metric, detail, handleDetail } = props
  const { isHoldout, fbeta, selectModel, recommendModel, criteria, costOption: { TP, FN, FP, TN } } = project
  const isRecommend = recommendModel.id === model.id
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
  return <Tooltip
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
        <span className={styles.text} title={model.id}>{model.id}</span>
        <span className={styles.icon}><Icon type='down' style={detail ? { transform: 'rotateZ(180deg)' } : {}} /></span>
      </div>
      <div className={styles.cell}><span className={styles.text} title={moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')}>{moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')}</span></div>
      <div className={styles.cell}><span className={styles.text} title={formatNumber(model.fbeta(fbeta, type).toString())}>{formatNumber(model.fbeta(fbeta, type).toString())}</span></div>
      <div className={styles.cell}><span className={styles.text} title={formatNumber(model[`precision${type}`].toString())}>{formatNumber(model[`precision${type}`].toString())}</span></div>
      <div className={styles.cell}><span className={styles.text} title={formatNumber(model[`recall${type}`].toString())}>{formatNumber(model[`recall${type}`].toString())}</span></div>
      <div className={styles.cell}><span className={styles.text} title={formatNumber(model[`logloss${type}`].toString())}>{formatNumber(model[`logloss${type}`].toString())}</span></div>
      <div className={styles.cell}><span className={styles.text} title={formatNumber(model.cutoff.toString())}>{formatNumber(model.cutoff.toString())}</span></div>
      <div className={styles.cell}><span className={styles.text} title={formatNumber(model[`ks${type}`].toString())}>{formatNumber(model[`ks${type}`].toString())}</span></div>
      <div className={styles.scoreCell}>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((metric === 'fbeta' ? model.fbeta(fbeta, 'Validation') : model[`${metric === 'log_loss' ? 'logloss' : metric}Validation`]).toString())}>{formatNumber(metric === 'fbeta' ? model.fbeta(fbeta, 'Validation') : model[`${metric === 'log_loss' ? 'logloss' : metric}Validation`].toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((metric === 'fbeta' ? model.fbeta(fbeta, 'Holdout') : model[`${metric === 'log_loss' ? 'logloss' : metric}Holdout`]).toString())}>{formatNumber(metric === 'fbeta' ? model.fbeta(fbeta, 'Holdout') : model[`${metric === 'log_loss' ? 'logloss' : metric}Holdout`].toString())}</span></div>
      </div>
    </div>
  </Tooltip>
});

const Row = (props: ClassificationRowProps) => {
  const { model, project, detail } = props;
  const { targetArray, targetColMap, renameVariable } = project;
  const [v0, v1] = !targetArray.length ? Object.keys(targetColMap) : targetArray;
  const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];
  return <div className={styles.rowBody}>
    <ClassificationRow {...props} />
    {detail && <DetailCurves
      model={model}
      yes={yes}
      no={no}
      project={project}
    />}
  </div>
}
