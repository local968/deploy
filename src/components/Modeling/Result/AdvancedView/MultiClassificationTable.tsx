import React, { ReactElement, useState, MouseEvent, useMemo } from 'react'
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
import MultiClassificationDetailCurves from './MultiClassificationDetailCurves';

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
    label: 'Accuracy',
    value: 'acc',
    sort: true,
    hint: EN.RootMeanSquareErrorRMSEmeasures
  },
  {
    label: 'Macro-P',
    value: 'macrop',
    sort: true,
    hint: EN.RootMeanSquareErrorprediction
  },
  {
    label: 'Macro-R',
    value: 'macror',
    sort: true,
  },
  {
    label: 'Macro-F1',
    value: 'macrof1',
    sort: true,
    hint: EN.RMSLEissimilarwithRMSE
  },
  // {
  //   label: 'AP',
  //   value: 'AP',
  //   sort: true,
  //   hint: EN.MeanSquaredErro
  // },
  // {
  //   label: 'mAP',
  //   value: 'mAP',
  //   sort: true,
  //   hint: EN.MeanAbsoluteError
  // },
  {
    label: 'Kappa',
    value: 'kappa',
    sort: true,
    hint: EN.R2isastatisticalmeasure
  },
  // {
  //   label: 'AUC',
  //   value: 'AUC',
  //   sort: true,
  //   hint: EN.TheadjustedR2tells
  // },
  // {
  //   label: 'AUCPR',
  //   value: 'AUCPR',
  //   sort: true,
  //   hint: EN.TheadjustedR2tells
  // },
  {
    label: 'Macro-AUC',
    value: 'macroauc',
    sort: true,
    hint: EN.TheadjustedR2tells
  },
  // {
  //   label: 'F-measure',
  //   value: 'F-measure',
  //   sort: true,
  //   hint: EN.TheadjustedR2tells
  // },
  // {
  //   label: 'Gini',
  //   value: 'Gini',
  //   sort: true,
  //   hint: EN.TheadjustedR2tells
  // },
  {
    label: 'HammingLoss',
    value: 'hammingLoss',
    sort: true,
    hint: EN.TheadjustedR2tells
  },
  // {
  //   label: 'ZeroOneLoss',
  //   value: 'ZeroOneLoss',
  //   sort: true,
  //   hint: EN.TheadjustedR2tells
  // }
]

const MetricOptions = [{ key: "macro_auc", display: 'Macro AUC' }, { key: "macro_f1", display: 'Macro F1' }, { key: "micro_f1", display: 'Micro F1' }, { key: "macro_recall", display: 'Macro Recall' }, { key: "micro_recall", display: 'Micro Recall' }, { key: "macro_precision", display: 'Macro Precision' }, { key: "micro_precision", display: 'Micro Precision' }]

interface MultiClassificationTableProps {
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

const MultiClassificationTable = (props: MultiClassificationTableProps) => {
  const { sort, handleSort, project, metric, handleChange, models, currentSettingId } = props
  const { isHoldout } = project
  const [detailArr, setDetail] = useState([] as string[])

  const sortBy = (key: string) => () => {
    handleSort(key)
  }

  const handleHoldout = () => {
    project.upIsHoldout(!isHoldout);
  }

  const handleDetail = (s: string) => {
    if (detailArr.includes(s)) return setDetail(detailArr.filter(d => d !== s))
    return setDetail([...detailArr, s])
  }

  const sortMethods = (aModel, bModel) => {
    switch (sort.key) {
      case 'macrop':
        {
          const aModelData = isHoldout ? aModel.score.holdoutScore.macro_P : aModel.score.validateScore.macro_P
          const bModelData = isHoldout ? bModel.score.holdoutScore.macro_P : bModel.score.validateScore.macro_P
          return (aModelData - bModelData) * sort.value
        }
      case 'macror':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.macro_R) : (aModel.score.validateScore.macro_R)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.macro_R) : (bModel.score.validateScore.macro_R)
          return (aModelData - bModelData) * sort.value
        }
      case 'macrof1':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.macro_F1) : (aModel.score.validateScore.macro_F1)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.macro_F1) : (bModel.score.validateScore.macro_F1)
          return (aModelData - bModelData) * sort.value
        }
      case 'acc':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.Accuracy) : (aModel.score.validateScore.Accuracy)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.Accuracy) : (bModel.score.validateScore.Accuracy)
          return (aModelData - bModelData) * sort.value
        }
      // case 'ap':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.AP) : (aModel.score.validateScore.AP)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.AP) : (bModel.score.validateScore.AP)
      //     return (aModelData - bModelData) * sort.value
      //   }
      // case 'map':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.mAP) : (aModel.score.validateScore.mAP)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.mAP) : (bModel.score.validateScore.mAP)
      //     return (aModelData - bModelData) * sort.value
      //   }
      case 'kappa':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.Kappa) : (aModel.score.validateScore.Kappa)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.Kappa) : (bModel.score.validateScore.Kappa)
          return (aModelData - bModelData) * sort.value
        }
      // case 'auc':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.auc) : (aModel.score.validateScore.auc)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.auc) : (bModel.score.validateScore.auc)
      //     return (aModelData - bModelData) * sort.value
      //   }
      // case 'aucpr':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.aucpr) : (aModel.score.validateScore.aucpr)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.aucpr) : (bModel.score.validateScore.aucpr)
      //     return (aModelData - bModelData) * sort.value
      //   }
      case 'macroauc':
        {
          const aModelData = isHoldout ? (aModel.holdoutChartData.roc_auc.macro) : (aModel.chartData.roc_auc.macro)
          const bModelData = isHoldout ? (bModel.holdoutChartData.roc_auc.macro) : (bModel.chartData.roc_auc.macro)
          return (aModelData - bModelData) * sort.value
        }
      // case 'fmeasure':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.fmeasure) : (aModel.score.validateScore.fmeasure)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.fmeasure) : (bModel.score.validateScore.fmeasure)
      //     return (aModelData - bModelData) * sort.value
      //   }
      // case 'gini':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.gini) : (aModel.score.validateScore.gini)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.gini) : (bModel.score.validateScore.gini)
      //     return (aModelData - bModelData) * sort.value
      //   }
      case 'hammingLoss':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.HammingLoss) : (aModel.score.validateScore.HammingLoss)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.HammingLoss) : (bModel.score.validateScore.HammingLoss)
          return (aModelData - bModelData) * sort.value
        }
      // case 'zeroOneLoss':
      //   {
      //     const aModelData = isHoldout ? (aModel.score.holdoutScore.ZeroOneLoss) : (aModel.score.validateScore.ZeroOneLoss)
      //     const bModelData = isHoldout ? (bModel.score.holdoutScore.ZeroOneLoss) : (bModel.score.validateScore.ZeroOneLoss)
      //     return (aModelData - bModelData) * sort.value
      //   }
      case 'validation':
        {
          const [t, p] = metric.split("_")
          const aModelData = metric === 'macro_auc' ? aModel.chartData.roc_auc.macro : p === 'f1' ? aModel.score.validateScore[`${t}_F1`] : aModel.score.validateScore[`${t}_${p.slice(0, 1).toUpperCase()}`]
          const bModelData = metric === 'macro_auc' ? bModel.chartData.roc_auc.macro : p === 'f1' ? bModel.score.validateScore[`${t}_F1`] : bModel.score.validateScore[`${t}_${p.slice(0, 1).toUpperCase()}`]
          return (aModelData - bModelData) * sort.value
        }
      case 'holdout':
        {
          const [t, p] = metric.split("_")
          const aModelData = metric === 'macro_auc' ? aModel.holdoutChartData.roc_auc.macro : p === 'f1' ? aModel.score.holdoutScore[`${t}_F1`] : aModel.score.holdoutScore[`${t}_${p.slice(0, 1).toUpperCase()}`]
          const bModelData = metric === 'macro_auc' ? bModel.holdoutChartData.roc_auc.macro : p === 'f1' ? bModel.score.holdoutScore[`${t}_F1`] : bModel.score.holdoutScore[`${t}_${p.slice(0, 1).toUpperCase()}`]
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

  const modelElements = useMemo(() => {
    return models.reduce((els, m) => ({ ...els, [m.id]: <MultiClassificationTableRow model={m} project={project} metric={metric} key={m.id} detail={detailArr.includes(m.id)} handleDetail={handleDetail} /> }), {})
  }, [detailArr, metric])

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
          <div className={styles.metricBg}></div>
          <div className={styles.metric}>
            <span className={styles.metricText} >{EN.MeasurementMetric}</span>
            <Select size="large" value={metric} onChange={handleChange} style={{ width: '140px', fontSize: '1rem' }} getPopupContainer={el => el.parentElement}>
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
      {/* {filtedModels.map((m, i) => <RegressionTableRow model={m} project={project} metric={metric} key={i} detail={detailArr.includes(m.id)} handleDetail={handleDetail} />)} */}
    </div>
  </div>
}

export default observer(MultiClassificationTable)

interface MultiClassificationTableRowProps {
  model: Model,
  metric: string,
  project: Project,
  detail: boolean,
  handleDetail: (s: string) => void
}

const MultiClassificationTableRow = observer((props: MultiClassificationTableRowProps) => {
  const { model, project, metric, detail, handleDetail } = props
  const { isHoldout, mapHeader, newVariable, selectModel, recommendModel } = project
  const { score, holdoutChartData, chartData } = model
  const newMapHeader = { ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}), ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}) }
  const [t, p] = metric.split("_")
  const validate = metric === 'macro_auc' ? chartData.roc_auc.macro : p === 'f1' ? score.validateScore[`${t}_F1`] : score.validateScore[`${t}_${p.slice(0, 1).toUpperCase()}`]
  const holdout = metric === 'macro_auc' ? holdoutChartData.roc_auc.macro : p === 'f1' ? score.holdoutScore[`${t}_F1`] : score.holdoutScore[`${t}_${p.slice(0, 1).toUpperCase()}`]

  const modelScore = isHoldout ? score.holdoutScore : score.validateScore
  const modelChartData = isHoldout ? holdoutChartData : chartData
  const isRecommend = recommendModel.id === model.id
  const handleResult = (id) => () => {
    handleDetail(id)
  }

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectModel.id === model.id) return
    project.updateProject({ selectId: model.id })
  }

  return <div className={styles.rowBody}>
    <Tooltip
      placement="left"
      title={isRecommend ? EN.Recommended : EN.Selected}
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
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.Accuracy.toString())}>{formatNumber(modelScore.Accuracy.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.macro_P.toString())}>{formatNumber(modelScore.macro_P.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.macro_R.toString())}>{formatNumber(modelScore.macro_R.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.macro_F1.toString())}>{formatNumber(modelScore.macro_F1.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.Kappa.toString())}>{formatNumber(modelScore.Kappa.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelChartData.roc_auc.macro.toString())}>{formatNumber(modelChartData.roc_auc.macro.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.HammingLoss.toString())}>{formatNumber(modelScore.HammingLoss.toString())}</span></div>
        {/* <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.adjustR2.toString())}>{formatNumber(modelScore.adjustR2.toString())}</span></div> */}
        <div className={styles.scoreCell}>
          <div className={styles.cell}><span className={styles.text} title={formatNumber(validate.toString())}>{formatNumber(validate.toString())}</span></div>
          <div className={styles.cell}><span className={styles.text} title={formatNumber(holdout.toString())}>{formatNumber(holdout.toString())}</span></div>
        </div>
      </div>
    </Tooltip>
    {detail && <MultiClassificationDetailCurves
      project={project}
      model={model}
      // mapHeader={newMapHeader}
    />}
  </div>
})