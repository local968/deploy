import React, { useMemo } from 'react'
import styles from './AdvancedView.module.css'
import EN from '../../../../constant/en'
import { Select } from 'antd'
import Project from 'stores/Project';
import Model from 'stores/Model';
import AdvancedViewTable from './AdvancedViewTable'
import MetricBased from '../Classification/MetricBased'
import ModelComp from './ModelComp'
import { observer } from 'mobx-react';

const { Option } = Select;

interface AdvancedViewProps {
  project: Project,
  models: Model[],
  currentSettingId: string,
  changeSetting: (s: string) => void,
  sort: {
    key: string,
    value: number
  }
  handleSort: (k: string) => void,
  metric: string,
  handleChange: (k: string) => void
}

const AdvancedView = (props: AdvancedViewProps) => {
  const { project, currentSettingId, changeSetting, models, sort, handleSort, metric, handleChange } = props
  const { selectModel, problemType, train2Finished, metricCorrection, isHoldout, fbeta } = project

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
      case EN.Validation:
        {
          const { problemType } = project
          let aModelData, bModelData
          if (problemType === 'Regression') {
            aModelData = (aModel.score.validateScore[metric || 'r2'])
            bModelData = (bModel.score.validateScore[metric || 'r2'])
          } else {
            aModelData = metric === 'log_loss' ? aModel.chartData.roc.LOGLOSS[aModel.fitIndex] : metric === 'auc' ? (aModel.score.validateScore[metric]) : (aModel[metric + 'Validation'])
            bModelData = metric === 'log_loss' ? bModel.chartData.roc.LOGLOSS[bModel.fitIndex] : metric === 'auc' ? (bModel.score.validateScore[metric]) : (bModel[metric + 'Validation'])
          }
          return (aModelData - bModelData) * sort.value
        }
      case EN.Holdout:
        {
          const { problemType } = project
          let aModelData, bModelData
          if (problemType === 'Regression') {
            aModelData = (aModel.score.holdoutScore[metric || 'r2'])
            bModelData = (bModel.score.holdoutScore[metric || 'r2'])
          } else {
            aModelData = metric === 'log_loss' ? aModel.holdoutChartData.roc.LOGLOSS[aModel.fitIndex] : metric === 'auc' ? (aModel.score.holdoutScore[metric]) : (aModel[metric + 'Holdout'])
            bModelData = metric === 'log_loss' ? bModel.holdoutChartData.roc.LOGLOSS[bModel.fitIndex] : metric === 'auc' ? (bModel.score.holdoutScore[metric]) : (bModel[metric + 'Holdout'])
          }
          return (aModelData - bModelData) * sort.value
        }
      case 'ks':
        {
          const dataKey = isHoldout ? 'Holdout' : 'Validation'
          const aModelData = aModel[`ks${dataKey}`]
          const bModelData = bModel[`ks${dataKey}`]
          return (aModelData - bModelData) * sort.value
        }
      case EN.Time:
        return (sort.value === 1 ? 1 : -1) * ((aModel.createTime || 0) - (bModel.createTime || 0))
      case EN.ModelName:
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

  const performance = useMemo(() => {
    try {
      if (problemType === 'Classification') {
        return selectModel ? (selectModel.score.validateScore.auc > 0.8 && EN.GOOD) || (selectModel.score.validateScore.auc > 0.6 && EN.OK) || EN.NotSatisfied : ''
      } else {
        return selectModel ? (selectModel.score.validateScore.r2 > 0.5 && EN.Acceptable) || EN.NotAcceptable : ''
      }
    } catch (e) {
      return 'OK'
    }
  }, [selectModel, problemType])

  const handleMetricCorrection = (correction, isAll) => {
    //不应用到全部  保存当前选择模型ID
    const selectId = selectModel.id
    const curModels = isAll ? models : [selectModel]

    const promises = curModels.map(m => {
      const { chartData: { roc }, initialFitIndex, fitIndex } = m
      const { TP, TN, FP, FN, Threshold } = roc
      const Length = 101
      const Tpr = index => TP[index] / (TP[index] + FN[index])
      const Fpr = index => FP[index] / (FP[index] + TN[index])
      const Recall = index => TP[index] / (TP[index] + FN[index])
      const Recall0 = index => TN[index] / (TN[index] + FP[index])
      const Precision = index => TP[index] / (TP[index] + FP[index])
      const Precision0 = index => TN[index] / (TN[index] + FN[index])
      const KS = index => Tpr(index) - Fpr(index)
      const Fbeta = (index, beta) => (1 + beta * beta) * Precision(index) * Recall(index) / (beta * beta * Precision(index) + Recall(index))
      const Accuracy = index => (TN[index] + TP[index]) / (TN[index] + TP[index] + FN[index] + FP[index])
      let curIndex = fitIndex

      switch (correction.metric) {
        case 'default':
          curIndex = initialFitIndex
          break;
        case 'ks':
          curIndex = 0
          for (let i = 1; i < Length; i++) {
            const prevKs = KS(curIndex)
            const newKs = KS(i)
            if (newKs > prevKs) curIndex = i
          }
          break;
        case 'fbeta':
          curIndex = 0
          for (let i = 1; i < Length; i++) {
            const prevFbeta = Fbeta(curIndex, correction.value)
            const newFbeta = Fbeta(i, correction.value)
            if (newFbeta > prevFbeta) curIndex = i
          }
          break;
        case 'acc':
          curIndex = 0
          for (let i = 1; i < Length; i++) {
            const prevAcc = Accuracy(curIndex)
            const newAcc = Accuracy(i)
            if (newAcc > prevAcc) curIndex = i
          }
          break;
        case 'recall':
          curIndex = undefined
          let reacallAllFilter = true
          const recallFn = (correction.type === 'Precision' && Precision) || (correction.type === 'Recall(0)' && Recall0) || (correction.type === 'Precision(0)' && Precision0)
          for (let i = 0; i < Length; i++) {
            if (recallFn(i) < correction.value) continue
            if (curIndex === undefined) {
              curIndex = i
              continue
            }
            reacallAllFilter = false
            const prevRecall = Recall(curIndex)
            const newRecall = Recall(i)
            if (newRecall > prevRecall) curIndex = i
          }
          if (reacallAllFilter) {
            const firstRecall = Recall(curIndex)
            const lastRecall = Recall(Length - 1)
            if (lastRecall > firstRecall) curIndex = Length - 1
            console.log("Recall: cannot find one ,use " + (lastRecall > firstRecall ? 'last' : 'first') + ' one')
          }
          break;
        case 'none':
          curIndex = Object.values(Threshold).findIndex(c => c === 0.5)
          break;
        case 'precision':
          curIndex = undefined
          let precisionAllFilter = true
          const precisionFn = (correction.type === 'Recall' && Recall) || (correction.type === 'Recall(0)' && Recall0) || (correction.type === 'Precision(0)' && Precision0)
          for (let i = 0; i < Length; i++) {
            if (precisionFn(i) < correction.value) continue
            if (curIndex === undefined) {
              curIndex = i
              continue
            }
            precisionAllFilter = false
            const prevPrecision = Precision(curIndex)
            const newPrecision = Precision(i)
            if (newPrecision > prevPrecision) curIndex = i
          }
          if (precisionAllFilter) {
            const firstPrecision = Precision(curIndex)
            const lastPrecision = Precision(Length - 1)
            if (lastPrecision > firstPrecision) curIndex = Length - 1
            console.log("Precision: cannot find one ,use " + (lastPrecision > firstPrecision ? 'last' : 'first') + ' one')
          }
          break;
      }
      if (curIndex === fitIndex) return Promise.resolve()
      return m.updateModel({ fitIndex: curIndex })
    })
    return Promise.all(promises).then(() => {
      return project.updateProject({
        metricCorrection: correction,
        selectId
      })
    })
  }

  const handleReset = (isAll = false) => {
    const { models, selectModel, updateProject } = this.props.project;
    const _models = isAll ? models : [selectModel]
    _models.forEach(m => {
      const { initialFitIndex, fitIndex } = m
      if (initialFitIndex === fitIndex) return
      m.updateModel({ fitIndex: initialFitIndex })
    });
    updateProject({
      metricCorrection: { metric: 'default', type: '', value: 0 }
    })
  }

  return <div className={styles.main}>
    <div className={styles.title}>
      <div className={styles.model}>
        <span className={styles.label}>{EN.ModelingResults} :<div className={styles.status} style={{ marginLeft: 10 }}>{performance}</div></span>
      </div>
    </div>
    <div className={styles.options}>
      <div className={styles.filter}>
        <span className={styles.label}>{EN.ModelNameContains} :</span>
        <Select className={styles.settingsSelect} value={currentSettingId} onChange={changeSetting} getPopupContainer={el => el.parentElement}>
          <Option value={'all'}>{EN.All}</Option>
          {project.settings.map(setting => <Option key={setting.id} value={setting.id} >{setting.name}</Option>)}
        </Select>
      </div>
      {problemType === 'Classification' && <MetricBased finished={train2Finished} MetricCorrection={handleMetricCorrection} metricCorrection={metricCorrection} handleReset={handleReset} />}
      {problemType === 'Classification' && <ModelComp models={filtedModels} />}
    </div>
    <div className={styles.table}>
      <AdvancedViewTable project={project} sort={sort} handleSort={handleSort} metric={metric} handleChange={handleChange} models={filtedModels} />
    </div>
  </div>
}

export default observer(AdvancedView)