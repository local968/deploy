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
    label: 'R²',
    value: 'r2',
    sort: true,
    hint: EN.R2isastatisticalmeasure
  },
  {
    label: 'Adjust R²',
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
  models: Model[],
  currentSettingId: string
}

const RegressionTable = (props: RegressionTableProps) => {
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
      case 'nrmse':
        {
          const aModelData = isHoldout ? aModel.score.holdoutScore.nrmse : aModel.score.validateScore.nrmse
          const bModelData = isHoldout ? bModel.score.holdoutScore.nrmse : bModel.score.validateScore.nrmse
          return (aModelData - bModelData) * sort.value
        }
      case 'rmse':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.rmse) : (aModel.score.validateScore.rmse)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.rmse) : (bModel.score.validateScore.rmse)
          return (aModelData - bModelData) * sort.value
        }
      case 'msle':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.msle) : (aModel.score.validateScore.msle)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.msle) : (bModel.score.validateScore.msle)
          return (aModelData - bModelData) * sort.value
        }
      case 'rmsle':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.rmsle) : (aModel.score.validateScore.rmsle)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.rmsle) : (bModel.score.validateScore.rmsle)
          return (aModelData - bModelData) * sort.value
        }
      case 'mse':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.mse) : (aModel.score.validateScore.mse)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.mse) : (bModel.score.validateScore.mse)
          return (aModelData - bModelData) * sort.value
        }
      case 'mae':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.mae) : (aModel.score.validateScore.mae)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.mae) : (bModel.score.validateScore.mae)
          return (aModelData - bModelData) * sort.value
        }
      case 'r2':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.r2) : (aModel.score.validateScore.r2)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.r2) : (bModel.score.validateScore.r2)
          return (aModelData - bModelData) * sort.value
        }
      case 'adjustR2':
        {
          const aModelData = isHoldout ? (aModel.score.holdoutScore.adjustR2) : (aModel.score.validateScore.adjustR2)
          const bModelData = isHoldout ? (bModel.score.holdoutScore.adjustR2) : (bModel.score.validateScore.adjustR2)
          return (aModelData - bModelData) * sort.value
        }
      case 'validation':
        {
          const aModelData = (aModel.score.validateScore[metric || 'r2'])
          const bModelData = (bModel.score.validateScore[metric || 'r2'])
          return (aModelData - bModelData) * sort.value
        }
      case 'holdout':
        {
          const aModelData = (aModel.score.holdoutScore[metric || 'r2'])
          const bModelData = (bModel.score.holdoutScore[metric || 'r2'])
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
    return models.reduce((els, m) => ({ ...els, [m.id]: <RegressionTableRow model={m} project={project} metric={metric} key={m.id} detail={detailArr.includes(m.id)} handleDetail={handleDetail} /> }), {})
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
      {/* {filtedModels.map((m, i) => <RegressionTableRow model={m} project={project} metric={metric} key={i} detail={detailArr.includes(m.id)} handleDetail={handleDetail} />)} */}
    </div>
  </div>
}

export default observer(RegressionTable)

interface RegressionTableRowProps {
  model: Model,
  metric: string,
  project: Project,
  detail: boolean,
  handleDetail: (s: string) => void
}

const RegressionTableRow = observer((props: RegressionTableRowProps) => {
  const { model, project, metric, detail, handleDetail } = props
  const { isHoldout, mapHeader, newVariable, selectModel, recommendModel } = project
  const { score } = model
  const newMapHeader = { ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}), ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}) }

  const modelScore = isHoldout ? score.holdoutScore : score.validateScore
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
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.nrmse.toString())}>{formatNumber(modelScore.nrmse.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.rmse.toString())}>{formatNumber(modelScore.rmse.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.msle.toString())}>{formatNumber(modelScore.msle.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.rmsle.toString())}>{formatNumber(modelScore.rmsle.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.mse.toString())}>{formatNumber(modelScore.mse.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.mae.toString())}>{formatNumber(modelScore.mae.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.r2.toString())}>{formatNumber(modelScore.r2.toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber(modelScore.adjustR2.toString())}>{formatNumber(modelScore.adjustR2.toString())}</span></div>
        <div className={styles.scoreCell}>
          <div className={styles.cell}><span className={styles.text} title={formatNumber(model.score.validateScore[metric].toString())}>{formatNumber(model.score.validateScore[metric].toString())}</span></div>
          <div className={styles.cell}><span className={styles.text} title={formatNumber(model.score.holdoutScore[metric].toString())}>{formatNumber(model.score.holdoutScore[metric].toString())}</span></div>
        </div>
      </div>
    </Tooltip>
    {detail && <RegressionDetailCurves
      project={project}
      model={model}
      mapHeader={newMapHeader}
    />}
  </div>
})