import React, { Component } from 'react';
import classnames from 'classnames';
import { Table, Tabs, Modal, Select, Radio, Button, Tooltip, Icon, InputNumber } from 'antd';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx'
import styles from './AdvancedView.module.css';
import { Hint, Switch } from 'components/Common';
import FitPlotHover from './iconMR-FitPlot-Hover.svg';
import FitPlotNormal from './iconMR-FitPlot-Normal.svg';
import FitPlotSelected from './iconMR-FitPlot-Selected.svg';
import ResidualHover from './iconMR-Residual-Hover.svg';
import ResidualNormal from './iconMR-Residual-Normal.svg';
import ResidualSelected from './iconMR-ResidualPlot-Selected.svg';
import varImpactHover from './icon-variable-impact-linear-hover.svg';
import varImpactSelected from './icon-variable-impact-selected.svg';
import varImpactNormal from './icon-variable-impact-linear-normal.svg';

import nonlinearImg from './img-residual-plot-nonlinear.svg';
import heteroscedasticityImg from './img-residual-plot-heteroscedasticity.svg';
import largeImg from './img-residual-plot-large-y.svg';
import yAxisUnbalancedImg from './img-residual-plot-y-axis-unbalanced.svg';
import outliersImg from './img-residual-plot-outliers.svg';
import xAxisUnbalancedImg from './img-residual-plot-x-axis-unbalanced.svg';
import randomlyImg from './img-residual-plot-randomly.svg';

import VariableImpact from '../Result/VariableImpact';
import { computed } from 'mobx';
import moment from 'moment';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import request from '../../Request'
const { TabPane } = Tabs;
const { Option } = Select;

import {
  FitPlot,
  SpeedvsAccuracys,
  ResidualPlot,
  LiftChart,
  RocChart,
} from "../../Charts"
import DetailCurves from './DetailCurves';
import Thumbnail from './Thumbnail';
import MetricBased from '../Result/Classification/MetricBased'

@inject('projectStore')
@observer
export default class AdvancedView extends Component {

  @observable fbeta = this.props.project.fbeta
  // undefined = can not sort, false = no sort ,1 = asc, -1 = desc
  // @observable sortState = {
  //   'Model Name': 1,
  //   'Fbeta': false,
  //   'Precision': false,
  //   'Recall': false,
  //   'LogLoss': false,
  //   'Cutoff Threshold': false,
  //   'Validation': false,
  //   'Holdout': false,
  //   'Normalized RMSE': false,
  //   'RMSE': false,
  //   'MSLE': false,
  //   'RMSLE': false,
  //   'MSE': false,
  //   'MAE': false,
  //   'R2': false,
  //   'AdjustR2': false,
  //   'KS': false,
  //   'Time': false
  // };
  // @observable metric = {
  //   key: '',
  //   display: ''
  // };

  @computed
  get filtedModels() {
    const { models, project, projectStore, sort, metric, currentSettingId } = this.props;
    // const {problemType} = project;
    // problemType === "Classification"&&this.props.projectStore.project.upIsHoldout(false);
    const { isHoldout, fbeta } = this.props.projectStore.project;

    let _filtedModels = [...models];
    // const currentSort = Object.keys(this.sortState).find(key => this.sortState[key])
    // const metricKey = this.metric.key;

    let { stopFilter, oldfiltedModels } = projectStore;
    const sortMethods = (aModel, bModel) => {
      switch (sort.key) {
        case 'Fbeta':
          {
            const dataKey = isHoldout ? 'Holdout' : 'Validation'
            const aModelData = aModel.fbeta(fbeta, dataKey)
            const bModelData = bModel.fbeta(fbeta, dataKey)
            return (aModelData - bModelData) * sort.value
          }
        case 'Precision':
          {
            const dataKey = isHoldout ? 'Holdout' : 'Validation'
            const aModelData = aModel[`precision${dataKey}`]
            const bModelData = bModel[`precision${dataKey}`]
            return (aModelData - bModelData) * sort.value
          }
        case 'Recall':
          {
            const dataKey = isHoldout ? 'Holdout' : 'Validation'
            const aModelData = aModel[`recall${dataKey}`]
            const bModelData = bModel[`recall${dataKey}`]
            return (aModelData - bModelData) * sort.value
          }
        case 'LogLoss':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const dataKey = isHoldout ? 'holdoutChartData' : 'chartData'
            const aModelData = (aModel[dataKey].roc.LOGLOSS[aFitIndex])
            const bModelData = (bModel[dataKey].roc.LOGLOSS[bFitIndex])
            return (aModelData - bModelData) * sort.value
          }
        case 'Cutoff Threshold':
          {
            const aFitIndex = aModel.fitIndex;
            const bFitIndex = bModel.fitIndex;
            const dataKey = isHoldout ? 'holdoutChartData' : 'chartData';
            const aModelData = (aModel[dataKey].roc.Threshold[aFitIndex]);
            const bModelData = (bModel[dataKey].roc.Threshold[bFitIndex]);
            return (aModelData - bModelData) * sort.value
          }
        case 'Normalized RMSE':
          {
            const aModelData = isHoldout ? aModel.score.holdoutScore.nrmse : aModel.score.validateScore.nrmse
            const bModelData = isHoldout ? bModel.score.holdoutScore.nrmse : bModel.score.validateScore.nrmse
            return (aModelData - bModelData) * sort.value
          }
        case 'RMSE':
          {
            const aModelData = isHoldout ? (aModel.score.holdoutScore.rmse) : (aModel.score.validateScore.rmse)
            const bModelData = isHoldout ? (bModel.score.holdoutScore.rmse) : (bModel.score.validateScore.rmse)
            return (aModelData - bModelData) * sort.value
          }
        case 'MSLE':
          {
            const aModelData = isHoldout ? (aModel.score.holdoutScore.msle) : (aModel.score.validateScore.msle)
            const bModelData = isHoldout ? (bModel.score.holdoutScore.msle) : (bModel.score.validateScore.msle)
            return (aModelData - bModelData) * sort.value
          }
        case 'RMSLE':
          {
            const aModelData = isHoldout ? (aModel.score.holdoutScore.rmsle) : (aModel.score.validateScore.rmsle)
            const bModelData = isHoldout ? (bModel.score.holdoutScore.rmsle) : (bModel.score.validateScore.rmsle)
            return (aModelData - bModelData) * sort.value
          }
        case 'MSE':
          {
            const aModelData = isHoldout ? (aModel.score.holdoutScore.mse) : (aModel.score.validateScore.mse)
            const bModelData = isHoldout ? (bModel.score.holdoutScore.mse) : (bModel.score.validateScore.mse)
            return (aModelData - bModelData) * sort.value
          }
        case 'MAE':
          {
            const aModelData = isHoldout ? (aModel.score.holdoutScore.mae) : (aModel.score.validateScore.mae)
            const bModelData = isHoldout ? (bModel.score.holdoutScore.mae) : (bModel.score.validateScore.mae)
            return (aModelData - bModelData) * sort.value
          }
        case 'R2':
          {
            const aModelData = isHoldout ? (aModel.score.holdoutScore.r2) : (aModel.score.validateScore.r2)
            const bModelData = isHoldout ? (bModel.score.holdoutScore.r2) : (bModel.score.validateScore.r2)
            return (aModelData - bModelData) * sort.value
          }
        case 'AdjustR2':
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
        case 'KS':
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

    projectStore.changeNewfiltedModels(_filtedModels);
    if (!oldfiltedModels) {
      projectStore.changeOldfiltedModels(_filtedModels);
      oldfiltedModels = _filtedModels;
    }
    if (stopFilter && oldfiltedModels) {
      _filtedModels = oldfiltedModels.sort(sortMethods);
    } else {
      _filtedModels = _filtedModels.sort(sortMethods);
    }

    if (currentSettingId === 'all') return _filtedModels;
    const currentSetting = project.settings.find(setting => setting.id === currentSettingId)
    if (currentSetting && currentSetting.models)
      return _filtedModels.filter(model => currentSetting.models.find(id => model.id === id))
    return []
  }

  @computed
  get performance() {
    try {
      const { project } = this.props;
      const { selectModel: current } = project;
      if (project.problemType === 'Classification') {
        return current ? (current.score.validateScore.auc > 0.8 && EN.GOOD) || (current.score.validateScore.auc > 0.6 && EN.OK) || EN.NotSatisfied : ''
      } else {
        return current ? (current.score.validateScore.r2 > 0.5 && EN.Acceptable) || EN.NotAcceptable : ''
      }
    } catch (e) {
      return 'OK'
    }
  }

  @computed
  get metricOptions() {
    const { project } = this.props
    if (project && project.problemType) {
      return project.problemType === 'Classification' ?
        [{
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
        // [{
        //   display: 'AUC',
        //   key: 'auc'
        // }, {
        //   display: 'F1',
        //   key: 'f1'
        // }, {
        //   key: "log_loss",
        //   display: 'LogLoss'
        // }]
        : [{
          display: 'MSE',
          key: 'mse'
        }, {
          display: 'RMSE',
          key: 'rmse'
        }, {
          display: <div>R<sup>2</sup></div>,
          key: 'r2'
        }]
    }
    return []
  }

  // changeSort = (type) => action(() => {
  //   const currentActive = Object.keys(this.sortState).find(key => this.sortState[key]);
  //   if (type === currentActive) {
  //     this.sortState[type] = this.sortState[type] === 1 ? 2 : 1;
  //   } else {
  //     this.sortState[currentActive] = false;
  //     this.sortState[type] = 1
  //   }
  //   if (window.localStorage)
  //     window.localStorage.setItem(`advancedViewSort:${this.props.project.id}`, JSON.stringify(this.sortState))

  // });

  // handleChange = action(value => {
  //   this.metric = this.metricOptions.find(m => m.key === value);
  //   // if (window.localStorage)
  //   //   window.localStorage.setItem(`advancedViewMetric:${this.props.project.id}`, value)
  // });

  constructor(props) {
    super(props);
    props.project.problemType === "Classification" && props.projectStore.project.upIsHoldout(false);
    // const currentSetting = props.projectStore.project.currentSetting
    // this.metric = (currentSetting && currentSetting.setting) ? this.metricOptions.find(m => m.key === currentSetting.setting.measurement) : this.metricOptions[0]
    // autorun(() => {
    //   const { project } = props;
    //   if (project && project.measurement)
    //     this.metric = this.metricOptions.find(metric => metric.key === project.measurement) || this.metricOptions[0]
    // });

    // if (window.localStorage) {
    //   runInAction(() => {
    //     try {
    //       const storagedSort = JSON.parse(window.localStorage.getItem(`advancedViewSort:${props.project.id}`))
    //       const storagedMetric = window.localStorage.getItem(`advancedViewMetric:${props.project.id}`)
    //       // if (storagedSort) this.sortState = storagedSort
    //       // if (storagedMetric) this.metric = this.metricOptions.find(m => m.key === storagedMetric);
    //     } catch (e) { }
    //   })
    // }
    // props.projectStore.changeStopFilter(true)
    props.projectStore.changeOldfiltedModels(undefined)
  }

  handleHoldout() {
    const { isHoldout } = this.props.projectStore.project;
    this.props.projectStore.project.upIsHoldout(!isHoldout);
  }

  handleMetricCorrection = (correction, isAll) => {
    const { selectModel, models } = this.props.project;
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
          for (let i = 1; i < Length; i++) {
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
            console.log("Recall: cannot find one ,use " + lastRecall > firstRecall ? 'last' : 'first' + ' one')
          }
          break;
        case 'none':
          curIndex = Object.values(Threshold).findIndex(c => c === 0.5)
          break;
        case 'precision':
          curIndex = undefined
          let precisionAllFilter = true
          const precisionFn = (correction.type === 'Recall' && Recall) || (correction.type === 'Recall(0)' && Recall0) || (correction.type === 'Precision(0)' && Precision0)
          for (let i = 1; i < Length; i++) {
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
            console.log("Precision: cannot find one ,use " + lastPrecision > firstPrecision ? 'last' : 'first' + ' one')
          }
          break;
      }
      if (curIndex === fitIndex) return Promise.resolve()
      return m.updateModel({ fitIndex: curIndex })
    })
    return Promise.all(promises).then(() => {
      return this.props.project.updateProject({
        metricCorrection: correction,
        selectId
      })
    })
  }

  handleReset = (isAll = false) => {
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

  handleBeta = (value) => {
    this.fbeta = value
  }

  submitBeta = () => {
    this.props.project.updateProject({
      fbeta: this.fbeta
    })
  }

  render() {
    const { project, sort, handleSort, handleChange, metric, handleHoldout, currentSettingId, changeSetting } = this.props;
    const { isHoldout, train2Finished, metricCorrection, problemType } = this.props.projectStore.project;
    const currMetric = this.metricOptions.find(m => m.key === (metric || (problemType === 'Classification' ? 'auc' : 'r2'))) || {}
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.modelResult} >
          {EN.ModelingResults} :{' '}
          <div className={styles.status}>&nbsp;&nbsp;{this.performance}</div>
        </div>
        <div className={styles.middle}>
          <div className={styles.settings}>
            <span className={styles.label}>{EN.ModelNameContains}:</span>
            <Select className={styles.settingsSelect} value={currentSettingId} onChange={changeSetting} getPopupContainer={() => document.getElementsByClassName(styles.settings)[0]}>
              <Option value={'all'}>{EN.All}</Option>
              {project.settings.map(setting => <Option key={setting.id} value={setting.id} >{setting.name}</Option>)}
            </Select>
          </div>
          {project.problemType === 'Classification' && <MetricBased finished={train2Finished} MetricCorrection={this.handleMetricCorrection} metricCorrection={metricCorrection} handleReset={this.handleReset} />}
          {project.problemType === 'Classification' && <ModelComp models={this.filtedModels} />}
        </div>
        <div className={styles.metricSelection} >
          {project.problemType === 'Classification' && <div className={styles.metricFbeta}>
            <span>{EN.FbetaValue}</span>
            <Hint content={EN.FbetaValueHint} />
            <InputNumber min={0.1} max={10} step={0.1} style={{ marginLeft: 10 }} onChange={this.handleBeta} value={this.fbeta} />
            <div className={styles.metricFbetaBlock}>
              <a onClick={this.submitBeta} className={styles.metricFbetaBtn}>{EN.Submit}</a>
            </div>
          </div>}
          <div className={styles.metricSwitch}>
            <span>{EN.Validation}</span>
            <Switch checked={isHoldout} onChange={this.handleHoldout.bind(this)} style={{ backgroundColor: '#1D2B3C' }} />
            <span>{EN.Holdout}</span>
          </div>
          <span className={styles.text} >{EN.MeasurementMetric}</span>
          <Select size="large" value={currMetric.key} onChange={handleChange} style={{ width: '150px', fontSize: '1.125rem' }} getPopupContainer={() => document.getElementsByClassName(styles.metricSelection)[0]}>
            {this.metricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
          </Select>
        </div>
        <AdvancedModelTable {...this.props} models={this.filtedModels} project={project} sort={sort} handleSort={handleSort} metric={currMetric} isHoldout={isHoldout} />
      </div>
    )
  }
}

const questMarks = {
  Accuracy: EN.Givenaparticularpopulation,
  Recall: EN.Itrepresentsthecompleteness,
  'Cutoff Threshold': EN.Manyclassifiersareabletoproduce,
  'Fbeta': <p>{EN.TheFbetascoreistheharmonicmean}<br /><br />{EN.PrecisionRecallbeta}</p>,
  Precision: <p>{EN.Itmeasureshowmanytruepositivesamong}</p>,
  KS: EN.Efficientwaytodetermine,
  'Normalized RMSE': EN.RootMeanSquareErrorRMSEmeasures,
  R2: EN.R2isastatisticalmeasure,
  RMSE: EN.RootMeanSquareErrorprediction,
  RMSLE: EN.RMSLEissimilarwithRMSE,
  MSE: EN.MeanSquaredErro,
  MAE: EN.MeanAbsoluteError,
  AdjustR2: EN.TheadjustedR2tells,
  LogLoss: <p>{EN.LogLossis}<br /><br />{EN.Thelikelihoodfunctionanswers}</p>
}

@observer
class AdvancedModelTable extends Component {

  onClickCheckbox = (modelId) => (e) => {
    this.props.project.setSelectModel(modelId);
    e.stopPropagation()
  };

  render() {
    const { models, project: { problemType, selectModel, targetArray, targetColMap, renameVariable, mapHeader, newVariable, fbeta }, sort, handleSort, metric, isHoldout, project } = this.props;
    const [v0, v1] = !targetArray.length ? Object.keys(targetColMap) : targetArray;
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];
    const newMapHeader = { ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}), ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}) }
    const texts = problemType === 'Classification' ?
      [EN.ModelName, EN.Time, 'Fbeta', 'Precision', 'Recall', 'LogLoss', 'Cutoff Threshold', 'KS', EN.Validation, EN.Holdout] :
      [EN.ModelName, EN.Time, 'Normalized RMSE', 'RMSE', 'MSLE', 'RMSLE', 'MSE', 'MAE', 'R2', 'AdjustR2', EN.Validation, EN.Holdout];
    const arr = []
    const replaceR2 = str => str.replace(/R2/g, 'R²');
    const getHint = (text) => questMarks.hasOwnProperty(text.toString()) ? <Hint content={questMarks[text.toString()]} /> : ''
    const headerData = texts.reduce((prev, curr) => {
      const label = <div className={styles.headerLabel} title={replaceR2(curr)}>{replaceR2(curr)}</div>;
      if (curr === sort.key) {
        if (sort.value === 1) return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='up' /></div> }
        if (sort.value === -1) return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='up' style={{ transform: 'rotateZ(180deg)' }} /></div> }
      } else {
        if (arr.includes(curr)) {
          return { ...prev, [curr]: curr };
        }
        return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='minus' /></div> }
      }
      return prev
    }, {});
    const header = <div className={styles.tableHeader}><Row>{texts.map(t => <RowCell data={headerData[t]} key={t} />)}</Row></div>
    const dataSource = models.map(m => {
      if (problemType === 'Classification') {
        return <ClassificationModelRow
          no={no} yes={yes}
          key={m.id} texts={texts}
          onClickCheckbox={this.onClickCheckbox(m.id)}
          checked={selectModel.id === m.id}
          model={m}
          metric={metric.key}
          isHoldout={isHoldout}
          project={project}
          fbeta={fbeta}
          mapHeader={newMapHeader} />
      } else {
        return <RegressionModleRow
          project={this.props.project}
          key={m.id}
          texts={texts}
          onClickCheckbox={this.onClickCheckbox(m.id)}
          checked={selectModel.id === m.id}
          model={m}
          metric={metric.key}
          isHoldout={isHoldout}
          mapHeader={newMapHeader} />
      }
    });
    return (
      <div className={styles.advancedModelTableDiv}>
        {header}
        <div className={styles.advancedModelTable} >

          {dataSource}
        </div>
      </div>
    )
  }
}

@observer class RegressionModleRow extends Component {
  state = {
    detail: false
  }
  handleResult = e => {
    this.setState({ detail: !this.state.detail });
  }
  render() {
    const { model, texts, metric, checked, isHoldout, mapHeader, project } = this.props;
    const { score: { validateScore, holdoutScore }, modelName, reason } = model;
    const { detail } = this.state;
    const { validate, holdout } = reason || {}
    return (
      <div >
        <Row onClick={this.handleResult} >
          {texts.map(t => {
            switch (t) {
              case EN.ModelName:
                return (
                  <RowCell key={1} data={<div key={1} >
                    <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    <Tooltip title={modelName}>
                      <span className={styles.modelName} alt={modelName}>{modelName}</span>
                    </Tooltip>
                    <Icon type='down' style={detail ? { transform: 'rotateZ(180deg)' } : {}} />
                  </div>}
                  />
                )
              case 'Normalized RMSE':
                return <RowCell key={10} data={(isHoldout ? holdoutScore : validateScore).nrmse} title={(isHoldout ? holdoutScore : validateScore).nrmse === 'null' ? (validate || {}).nrmse : ""} />;
              case 'RMSE':
                return <RowCell key={2} data={(isHoldout ? holdoutScore : validateScore).rmse} title={(isHoldout ? holdoutScore : validateScore).rmse === 'null' ? (validate || {}).rmse : ""} />;
              case 'MSLE':
                return <RowCell key={11} data={(isHoldout ? holdoutScore : validateScore).msle} title={(isHoldout ? holdoutScore : validateScore).msle === 'null' ? (validate || {}).msle : ""} />;
              case 'RMSLE':
                return <RowCell key={9} data={(isHoldout ? holdoutScore : validateScore).rmsle} title={(isHoldout ? holdoutScore : validateScore).rmsle === 'null' ? (validate || {}).rmsle : ""} />;
              case 'MSE':
                return <RowCell key={3} data={(isHoldout ? holdoutScore : validateScore).mse} title={(isHoldout ? holdoutScore : validateScore).mse === 'null' ? (validate || {}).mse : ""} />;
              case 'MAE':
                return <RowCell key={4} data={(isHoldout ? holdoutScore : validateScore).mae} title={(isHoldout ? holdoutScore : validateScore).mae === 'null' ? (validate || {}).mae : ""} />;
              case 'R2':
                return <RowCell key={5} data={(isHoldout ? holdoutScore : validateScore).r2} title={(isHoldout ? holdoutScore : validateScore).r2 === 'null' ? (validate || {}).r2 : ""} />;
              case 'AdjustR2':
                return <RowCell key={8} data={(isHoldout ? holdoutScore : validateScore).adjustR2} title={(isHoldout ? holdoutScore : validateScore).adjustR2 === 'null' ? (validate || {}).adjustR2 : ""} />;
              case EN.Validation:
                return <RowCell key={6} data={validateScore[metric]} title={validateScore[metric] === 'null' ? (validate || {})[metric] : ""} />;
              case EN.Holdout:
                return <RowCell key={7} data={holdoutScore[metric]} title={holdoutScore[metric] === 'null' ? (holdout || {})[metric] : ""} />;
              case EN.Time:
                return <RowCell key={12} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <RegressionDetailCurves
          isHoldout={isHoldout}
          project={project}
          model={model}
          mapHeader={mapHeader}
        />}
      </div>
    )
  }
}

@observer
class RegressionDetailCurves extends Component {
  state = {
    curve: EN.VariableImpact,
    visible: false,
    diagnoseType: null
  }

  handleClick = val => {
    this.setState({ curve: val });
  }

  handleDiagnose = () => {
    this.setState({ visible: true });
  }

  handleDiagnoseType = e => {
    this.setState({ diagnoseType: e.target.value });
  }

  componentDidMount() {
    this.setChartDate()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isHoldout !== this.props.isHoldout) {
      this.setState({
        show: false
      }, () => {
        this.setState({
          show: true
        })
      });
    }
  }

  setChartDate(isHoldout = this.props.isHoldout) {
    const { validatePlotData, holdoutPlotData } = this.props.model;

    request.post({
      url: '/graphics/list',
      data: [{
        name: 'fit-plot',
        data: {
          url: validatePlotData,
        }
      }, {
        name: 'fit-plot',
        data: {
          url: holdoutPlotData,
        }
      }]
    }).then(data => {
      const [chartDate, holdOutChartDate] = data;
      this.setState({
        chartDate,
        holdOutChartDate,
        show: true,
      })
    });

    // request.post({
    //   url: '/graphics/fit-plot',
    //   data: {
    //     url,
    //   },
    // }).then(chartDate => {
    //   this.setState({
    //     chartDate
    //   })
    // });
  }

  render() {
    const { model, isHoldout, mapHeader } = this.props;
    const { curve, diagnoseType, chartDate, show, holdOutChartDate } = this.state;
    let curComponent;
    switch (curve) {
      case EN.VariableImpact:
        curComponent = <div style={{ fontSize: 60 }} ><VariableImpact model={model} mapHeader={mapHeader} /></div>
        break;
      case EN.FitPlot:
        curComponent = <div className={styles.plot} style={{ height: 300, width: 500 }}>
          {show && <FitPlot
            title={EN.FitPlot}
            x_name={EN.Truevalue}
            y_name={EN.Predictvalue}
            chartDate={isHoldout ? holdOutChartDate : chartDate}
          />}
        </div>;
        break;
      case EN.ResidualPlot:
        const Plot = show && <ResidualPlot
          title={EN.ResidualPlot}
          // x_name={EN.Truevalue}
          y_name={EN.Predictvalue}
          chartDate={isHoldout ? holdOutChartDate : chartDate}
        />;
        curComponent = (
          <div className={styles.plot} >
            {/*<img className={styles.img} src={model.residualPlotPath} alt="residual plot" />*/}
            {/*<ResidualPlot/>*/}
            {chartDate && Plot}
            <Modal
              visible={this.state.visible}
              title={EN.ResidualPlotDiagnose}
              width={1200}
              onOk={() => this.setState({ visible: false })}
              onCancel={() => this.setState({ visible: false })}
            >
              <ResidualDiagnose
                handleDiagnoseType={this.handleDiagnoseType}
                diagnoseType={diagnoseType}
                Plot={Plot}
                residualplot={model.residualPlotPath} />
            </Modal>
            <DiagnoseResult project={this.props.project} handleDiagnose={this.handleDiagnose} diagnoseType={diagnoseType} />
          </div>
        );
        break;
      default:
        break
    }
    const thumbnails = [{
      text: EN.FitPlot,
      hoverIcon: FitPlotHover,
      normalIcon: FitPlotNormal,
      selectedIcon: FitPlotSelected,
      type: 'fitplot'
    }, {
      text: EN.ResidualPlot,
      hoverIcon: ResidualHover,
      normalIcon: ResidualNormal,
      selectedIcon: ResidualSelected,
      type: 'residualplot'
    }, {
      normalIcon: varImpactNormal,
      hoverIcon: varImpactHover,
      selectedIcon: varImpactSelected,
      text: EN.VariableImpact
    }]
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} style={{ minWidth: 210 }} >
          {thumbnails.map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
        </div>
        <div className={styles.rightPanel} >
          {curComponent}
        </div>
      </div>
    )
  }
}

@observer
class ClassificationModelRow extends Component {
  state = {
    detail: false
  };
  handleResult = () => {
    this.setState({ detail: !this.state.detail });
  };
  render() {
    const { model, texts, metric, checked, yes, no, isHoldout, project, fbeta } = this.props;
    if (!model.chartData) return null;
    const { modelName, fitIndex, holdoutChartData, chartData, score } = model;
    const { detail } = this.state;
    return (
      <div>
        <Row onClick={this.handleResult} >
          {texts.map(t => {
            switch (t) {
              case EN.ModelName:
                return (
                  <RowCell key={1} data={<div key={1} >
                    <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    <Tooltip title={modelName}>
                      <span className={styles.modelName} alt={modelName} >{modelName}</span>
                    </Tooltip>
                    <Icon type='down' style={detail ? { transform: 'rotateZ(180deg)' } : {}} />
                  </div>}
                  />
                );
              case 'Fbeta':
                return <RowCell key={2} data={model.fbeta(fbeta, isHoldout ? 'Holdout' : 'Validation')} />;
              case 'Precision':
                return <RowCell key={3} data={model[`precision${isHoldout ? 'Holdout' : 'Validation'}`]} />;
              case 'Recall':
                return <RowCell key={4} data={model[`recall${isHoldout ? 'Holdout' : 'Validation'}`]} />;
              case 'LogLoss':
                return <RowCell key={5} data={(isHoldout ? holdoutChartData : chartData).roc.LOGLOSS[fitIndex]} />;
              case 'Cutoff Threshold':
                return <RowCell key={6} data={chartData.roc.Threshold[fitIndex]} />;
              case 'KS':
                return <RowCell key={7} data={model[`ks${isHoldout ? 'Holdout' : 'Validation'}`]} />;
              case EN.Validation:
                return <RowCell key={8} data={metric === 'log_loss' ? chartData.roc.LOGLOSS[fitIndex] : metric === 'auc' ? score.validateScore[metric] : model[metric + 'Validation']} />;
              case EN.Holdout:
                return <RowCell key={9} data={metric === 'log_loss' ? holdoutChartData.roc.LOGLOSS[fitIndex] : metric === 'auc' ? score.holdoutScore[metric] : model[metric + 'Holdout']} />;
              case EN.Time:
                return <RowCell key={10} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <DetailCurves
          model={model}
          yes={yes}
          no={no}
          project={project}
        />}
      </div>
    )
  }
}

class Row extends Component {
  render() {
    const { children, rowStyle, ...other } = this.props;
    return (
      <div className={styles.adrow} style={rowStyle} {...other} >
        {children}
      </div>
    );
  }
}

class RowCell extends Component {
  render() {
    const { data, cellStyle, cellClassName, title, ...rest } = this.props;
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={title ? title : typeof data === 'object' ? '' : formatNumber(data)}
      >
        {formatNumber(data)}
      </div>
    );
  }
}

class ModelComp extends Component {
  state = {
    modelCompVisible: false,
    select: true,
  };
  handleClick = () => {
    this.setState({ modelCompVisible: true });
  };
  handleCancel = () => {
    this.setState({ modelCompVisible: false });
  };
  render() {
    const { models } = this.props;
    const { select } = this.state;
    return (
      <div className={styles.modelComp}>
        <a onClick={this.handleClick} className={styles.comparison}>{EN.ModelComparisonCharts}</a>
        <Modal
          width={1000}
          visible={this.state.modelCompVisible}
          onCancel={this.handleCancel}
          closable={false}
          footer={
            <Button key="cancel" type="primary" onClick={this.handleCancel}>{EN.Close}</Button>
          }
        >
          <div>
            <h4>{EN.ModelComparisonCharts}</h4>
            <Tabs defaultActiveKey="1">
              <TabPane tab={EN.SpeedvsAccuracy} key="1">
                <SpeedvsAccuracys
                  // width={600}
                  selectAll={select}
                  height={400}
                  x_name={EN.Speedms1000rows}
                  y_name={EN.Accuracy}
                  models={models}
                />
              </TabPane>
              <TabPane tab={EN.LiftsCharts} key="3">
                <LiftChart
                  selectAll={select}
                  models={models}
                  x_name={EN.percentage}
                  y_name={EN.lift}
                  mom='lift'
                  x='PERCENTAGE'
                  y='LIFT'
                  formatter={true}
                />
              </TabPane>
              <TabPane tab={EN.ROCCurves} key="4">
                <RocChart
                  models={models}
                  selectAll={select}
                  x_name={EN.FalsePositiveDate}
                  y_name={EN.TruePositiveRate}
                  mom='roc'
                  x='FPR'
                  y='TPR'
                />
              </TabPane>
            </Tabs>
            <div className={styles.mccb}>
              <Button type="primary" onClick={async () => {
                await this.setState({ select: false });
                this.setState({ select: true });
              }}>{EN.SelectAll}</Button>
              <Button type="primary" onClick={async () => {
                await this.setState({ select: true });
                this.setState({ select: false });
              }}>{EN.DeselectAll}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

class ResidualDiagnose extends Component {
  render() {
    const plots = [{
      plot: randomlyImg,
      type: 'random',
      text: EN.RandomlyDistributed
    }, {
      plot: yAxisUnbalancedImg,
      type: 'yUnbalanced',
      text: EN.YaxisUnbalanced
    }, {
      plot: xAxisUnbalancedImg,
      type: 'xUnbalanced',
      text: EN.XaxisUnbalanced
    }, {
      plot: outliersImg,
      type: 'outliers',
      text: EN.Outliers
    }, {
      plot: nonlinearImg,
      type: 'nonlinear',
      text: EN.Nonlinear
    }, {
      plot: heteroscedasticityImg,
      type: 'heteroscedasticity',
      text: EN.Heteroscedasticity
    }, {
      plot: largeImg,
      type: 'largey',
      text: EN.LargeYaxisDataPoints
    }];
    const { diagnoseType, residualplot } = this.props;
    const RadioGroup = Radio.Group;
    // const disabled = diagnoseType === '';
    // const disabled = false;
    return (
      <div className={styles.residualDiagnose} >
        <div className={styles.plot} style={{ zoom: 0.7 }}>
          {/*<img width={300} src={residualplot} alt="" />*/}
          {this.props.Plot}
        </div>
        <div className={styles.choosePlot} >
          <div>{EN.Whichplotdoesyourresidual}</div>
          <RadioGroup value={diagnoseType} onChange={this.props.handleDiagnoseType} >
            {plots.map((p, i) => (
              <div className={styles.radioWrapper} key={i}>
                <Radio value={p.type} >{p.text}</Radio>
                <div>
                  <img width={200} src={p.plot} alt='plot' />
                </div>
              </div>
            ))}
          </RadioGroup >
        </div>

      </div>
    );
  }
}

class DiagnoseResult extends Component {
  handleNewData = () => {
    const { updateProject, nextMainStep } = this.props.project
    updateProject(nextMainStep(2))
  }
  handleSetting = () => {
    const { updateProject, jump } = this.props.project
    updateProject(jump(3, 1))
    // history.push(`/modeling/${this.props.projectId}/1`);
  }
  handleOutlierFix = () => {
    const { updateProject, jump } = this.props.project
    updateProject(jump(2, 3))
    // history.push(`/data/${this.props.projectId}/5`);
  }
  render() {
    const { diagnoseType } = this.props;
    let result;
    // const type = 'large';
    switch (diagnoseType) {
      case 'random':
        result = <div className={styles.content} >{EN.Perfectyourresidualplot} </div>;
        break;
      case 'yUnbalanced':
        result = (
          <div className={styles.content}>
            <div>{EN.Yourplotisunbalancedonyaxis}</div>
            <ul className={styles.items} >
              <li>{EN.Lookingforanopportunity}</li>
              <li>{EN.Checkingifyourmodel}</li>
            </ul>
            <div className={styles.action} >
              <span>{EN.Youcantransformorselect}</span>
              <button onClick={this.handleSetting} className={styles.button} >{EN.GotoAdvancedVariableSetting}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button} >{EN.LoadMyNewData}</button>
            </div>
          </div>
        );
        break;
      case 'xUnbalanced':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >{EN.DiagnoseResults}</div>
            <div>{EN.Yourplotisunbalancedonxaxis}</div>
            <ul className={styles.items} >
              <li>{EN.Lookingforanopportunitytousefully}</li>
              <li>{EN.Checkingifyourmodellack}</li>
            </ul>
            <div className={styles.action} >
              <span>{EN.Youcantransformorselectvariables}</span>
              <button onClick={this.handleSetting} className={styles.button} >{EN.GotoAdvancedVariableSetting}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button} >{EN.LoadMyNewData}</button>
            </div>
          </div>
        );
        break;
      case 'outliers':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >{EN.DiagnoseResults}</div>
            <div>{EN.Yourplotishassomeoutliers}</div>
            <ul className={styles.items} >
              <li>{EN.Deletingtheoutliers}</li>
              <li>{EN.Checkingifyourmodellack}</li>
            </ul>
            <div className={styles.action} >
              <span>{EN.Youcandeletetheoutliers}</span>
              <button onClick={this.handleOutlierFix} className={styles.button} >{EN.GotoEdittheFixesforOutliers}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Youcantransformorselectvariables}</span>
              <button onClick={this.handleSetting} className={styles.button} >{EN.GotoAdvancedVariableSetting}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button} >{EN.LoadMyNewData}</button>
            </div>
          </div>
        );
        break;
      case 'nonlinear':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >{EN.DiagnoseResults}</div>
            <div>{EN.Yourplotisnonlinear}</div>
            <ul className={styles.items} >
              <li>{EN.Lookingforanopportunityusefully}</li>
              <li>{EN.Checkingifyourneedtoaddnewavariable}</li>
            </ul>
            <div className={styles.action} >
              <span>{EN.Youcantransformorselect}</span>
              <button onClick={this.handleSetting} className={styles.button} >{EN.GotoAdvancedVariableSetting}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button} >{EN.LoadMyNewData}</button>
            </div>
          </div>
        );
        break;
      case 'heteroscedasticity':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >{EN.DiagnoseResults}</div>
            <div>{EN.Yourplotisheteroscedasticity}</div>
            <ul className={styles.items} >
              <li>{EN.Lookingforanopportunityusefully}</li>
              <li>{EN.Checkingifyourneedtoaddnewavariable}</li>
            </ul>
            <div className={styles.action} >
              <span>{EN.Youcantransformorselect}</span>
              <button onClick={this.handleSetting} className={styles.button} >{EN.GotoAdvancedVariableSetting}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button} >{EN.LoadMyNewData}</button>
            </div>
          </div>
        );
        break;
      case 'largey':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >{EN.DiagnoseResults}</div>
            <div>{EN.Yourplothaslargeyaxisdatapoints}</div>
            <ul className={styles.items} >
              <li>{EN.Lookingforanopportunityusefully}</li>
              <li>{EN.Checkingifyourneedtoaddnewavariable}</li>
            </ul>
            <div className={styles.action} >
              <span>{EN.Youcantransformorselect}</span>
              <button onClick={this.handleSetting} className={styles.button} >{EN.GotoAdvancedVariableSetting}</button>
            </div>
            <div className={styles.action} >
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button} >{EN.LoadMyNewData}</button>
            </div>
          </div>
        );
        break;
      default: break;
    }
    return (
      <div className={styles.diagnoseResult} >
        <button onClick={this.props.handleDiagnose} className={styles.button} >{EN.Diagnose}</button>
        {result}
      </div>
    );
  }
}
