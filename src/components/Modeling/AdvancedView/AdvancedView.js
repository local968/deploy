import React, { Component } from 'react';
import classnames from 'classnames';
import { Table, Tabs, Modal, Select, Radio, Button, Tooltip, Icon } from 'antd';
import { observer, inject } from 'mobx-react';
import styles from './AdvancedView.module.css';
import { Hint, Switch } from 'components/Common';
import ModelProcess from './ModelProcess';
import modelProcess from './icon-model-process-flow-normal.svg';
import processHover from './icon-model-process-flow-hover.svg';
import processSelectd from './icon-model-process-flow-selected.svg';
import ROCCurve from './icon-roc-curve-normal.svg';
import liftChart from './icon-lift-chart-normal.svg';
import precisionRecall from './icon-precision-recall-tradeoff-normal.svg';
import predictDist from './icon-prediction-distribution-normal.svg';
import liftchartHover from './icon-lift-chart-hover.svg';
import rocHover from './icon-roc-curve-hover.svg';
import precisionRecallHover from './icon-precision-recall-tradeoff-hover.svg';
import predictionDistribution from './icon-prediction-distribution-hover.svg';
import liftchartSelected from './icon-lift-chart-selected.svg';
import FitPlotHover from './iconMR-FitPlot-Hover.svg';
import FitPlotNormal from './iconMR-FitPlot-Normal.svg';
import FitPlotSelected from './iconMR-FitPlot-Selected.svg';
import ResidualHover from './iconMR-Residual-Hover.svg';
import ResidualNormal from './iconMR-Residual-Normal.svg';
import ResidualSelected from './iconMR-ResidualPlot-Selected.svg';
import rocSelected from './icon-roc-curve-selected.svg';
import precisionRecallSelected from './icon-precision-recall-tradeoff-selected.svg';
import predictionDistributionSelected from './icon-prediction-distribution-selected.svg';
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
import { observable, computed, action } from 'mobx';
import moment from 'moment';
import { formatNumber } from 'util'
// import FitPlot from "../../Charts/FitPlot";
import ResidualPlot from "../../Charts/ResidualPlot";
import EN from '../../../constant/en';
import ROCCurves from "../../Charts/ROCCurves";
import PredictionDistributions from "../../Charts/PredictionDistributions";
import PRCharts from "../../Charts/PRCharts";
import SingleLiftCharts from '../../Charts/SingleLiftCharts'
import SpeedvsAccuracys from "../../Charts/SpeedvsAccuracys";
import LiftChart2 from "../../Charts/LiftChart2";
import RocChart2 from "../../Charts/RocChart2";
import FitPlot2 from "../../Charts/FitPlot2";
import request from '../../Request'
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@inject('projectStore')
@observer
export default class AdvancedView extends Component {

  @observable currentSettingId = 'all';

  // undefined = can not sort, false = no sort ,1 = asc, -1 = desc
  // @observable sortState = {
  //   'Model Name': 1,
  //   'F1-Score': false,
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
    const { models, project, projectStore, sort, metric } = this.props;
    let _filtedModels = [...models];
    // const currentSort = Object.keys(this.sortState).find(key => this.sortState[key])
    // const metricKey = this.metric.key;

    let { stopFilter, oldfiltedModels } = projectStore;

    const sortMethods = (aModel, bModel) => {
      switch (sort.key) {
        case 'F1-Score':
          {
            const aFitIndex = aModel.fitIndex;
            const bFitIndex = bModel.fitIndex;
            const aModelData = (aModel.chartData.roc.F1[aFitIndex]);
            const bModelData = (bModel.chartData.roc.F1[bFitIndex]);
            return (aModelData - bModelData) * sort.value
          }
        case 'Precision':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = (aModel.chartData.roc.Precision[aFitIndex])
            const bModelData = (bModel.chartData.roc.Precision[bFitIndex])
            return (aModelData - bModelData) * sort.value
          }
        case 'Recall':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = (aModel.chartData.roc.Recall[aFitIndex])
            const bModelData = (bModel.chartData.roc.Recall[bFitIndex])
            return (aModelData - bModelData) * sort.value
          }
        case 'LogLoss':
        case 'log_loss':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = (aModel.chartData.roc.LOGLOSS[aFitIndex])
            const bModelData = (bModel.chartData.roc.LOGLOSS[bFitIndex])
            return (aModelData - bModelData) * sort.value
          }
        case 'Cutoff Threshold':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = (aModel.chartData.roc.Threshold[aFitIndex])
            const bModelData = (bModel.chartData.roc.Threshold[bFitIndex])
            return (aModelData - bModelData) * sort.value
          }
        case 'Normalized RMSE':
          {
            const aModelData = (aModel.score.validateScore.nrmse)
            const bModelData = (bModel.score.validateScore.nrmse)
            return (aModelData - bModelData) * sort.value
          }
        case 'RMSE':
          {
            const aModelData = (aModel.score.validateScore.rmse)
            const bModelData = (bModel.score.validateScore.rmse)
            return (aModelData - bModelData) * sort.value
          }
        case 'MSLE':
          {
            const aModelData = (aModel.score.validateScore.msle)
            const bModelData = (bModel.score.validateScore.msle)
            return (aModelData - bModelData) * sort.value
          }
        case 'RMSLE':
          {
            const aModelData = (aModel.score.validateScore.rmsle)
            const bModelData = (bModel.score.validateScore.rmsle)
            return (aModelData - bModelData) * sort.value
          }
        case 'MSE':
          {
            const aModelData = (aModel.score.validateScore.mse)
            const bModelData = (bModel.score.validateScore.mse)
            return (aModelData - bModelData) * sort.value
          }
        case 'MAE':
          {
            const aModelData = (aModel.score.validateScore.mae)
            const bModelData = (bModel.score.validateScore.mae)
            return (aModelData - bModelData) * sort.value
          }
        case 'R2':
          {
            const aModelData = (aModel.score.validateScore.r2)
            const bModelData = (bModel.score.validateScore.r2)
            return (aModelData - bModelData) * sort.value
          }
        case 'AdjustR2':
          {
            const aModelData = (aModel.score.validateScore.adjustR2)
            const bModelData = (bModel.score.validateScore.adjustR2)
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
              aModelData = metric === 'auc' ? (aModel.score.validateScore[metric]) : (aModel[metric + 'Validation'])
              bModelData = metric === 'auc' ? (bModel.score.validateScore[metric]) : (bModel[metric + 'Validation'])
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
              aModelData = metric === 'auc' ? (aModel.score.holdoutScore[metric]) : (aModel[metric + 'Holdout'])
              bModelData = metric === 'auc' ? (bModel.score.holdoutScore[metric]) : (bModel[metric + 'Holdout'])
            }
            return (aModelData - bModelData) * sort.value
          }
        case 'KS':
          {
            const aFitIndex = aModel.fitIndex;
            const bFitIndex = bModel.fitIndex;
            const aModelData = (aModel.chartData.roc.KS[aFitIndex]);
            const bModelData = (bModel.chartData.roc.KS[bFitIndex]);
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

    if (this.currentSettingId === 'all') return _filtedModels;
    const currentSetting = project.settings.find(setting => setting.id === this.currentSettingId)
    if (currentSetting && currentSetting.models && currentSetting.models.length > 0)
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

  changeSetting = action((settingId) => {
    this.currentSettingId = settingId
  });

  // handleChange = action(value => {
  //   this.metric = this.metricOptions.find(m => m.key === value);
  //   // if (window.localStorage)
  //   //   window.localStorage.setItem(`advancedViewMetric:${this.props.project.id}`, value)
  // });

  constructor(props) {
    super(props);
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

  render() {
    const { project, sort, handleSort, handleChange, metric, isHoldout, handleHoldout } = this.props;
    const { problemType } = project
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
            <Select className={styles.settingsSelect} value={this.currentSettingId} onChange={this.changeSetting} getPopupContainer={() => document.getElementsByClassName(styles.settings)[0]}>
              <Option value={'all'}>{EN.All}</Option>
              {project.settings.map(setting => <Option key={setting.id} value={setting.id} >{setting.name}</Option>)}
            </Select>
          </div>
          {project.problemType === 'Classification' && <ModelComp models={this.filtedModels} />}
        </div>
        <div className={styles.metricSelection} >
          <div className={styles.metricSwitch}>
            <span>{EN.Validation}</span>
            <Switch checked={isHoldout} onChange={handleHoldout} style={{ backgroundColor: '#1D2B3C' }} />
            <span>{EN.Holdout}</span>
          </div>
          <span className={styles.text} >{EN.MeasurementMetric}</span>
          <Select size="large" value={currMetric.key} onChange={handleChange} style={{ width: '150px', fontSize: '1.125rem' }} getPopupContainer={() => document.getElementsByClassName(styles.metricSelection)[0]}>
            {this.metricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
          </Select>
        </div>
        <AdvancedModelTable {...this.props} models={this.filtedModels} project={project} sort={sort} handleSort={handleSort} metric={currMetric} />
      </div>
    )
  }
}

const questMarks = {
  Accuracy: EN.Givenaparticularpopulation,
  Recall: EN.Itrepresentsthecompleteness,
  'Cutoff Threshold': EN.Manyclassifiersareabletoproduce,
  'F1-Score': <p>{EN.TheF1scoreistheharmonicmean}<br /><br />{EN.PrecisionRecall}</p>,
  Precision: <p>{EN.Itmeasureshowmanytruepositivesamong}</p>,
  KS: EN.Efficientwaytodetermine,
  'Normalized RMSE': EN.RootMeanSquareError,
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
    const { models, project: { problemType, selectModel, targetArray, targetColMap, renameVariable }, sort, handleSort, metric } = this.props;
    const [v0, v1] = !targetArray.length ? Object.keys(targetColMap) : targetArray;
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];
    const texts = problemType === 'Classification' ?
      [EN.ModelName, EN.Time, 'F1-Score', 'Precision', 'Recall', 'LogLoss', 'Cutoff Threshold', 'KS', EN.Validation, EN.Holdout] :
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
        return <ClassificationModelRow no={no} yes={yes} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} metric={metric.key} />
      } else {
        return <RegressionModleRow project={this.props.project} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} metric={metric.key} />
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
    const { model, texts, metric, checked } = this.props;
    const { score, modelName, reason } = model;
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
                  </div>}
                  />
                )
              case 'Normalized RMSE':
                return <RowCell key={10} data={score.validateScore.nrmse} title={score.validateScore.nrmse === 'null' ? (validate || {}).nrmse : ""} />;
              case 'RMSE':
                return <RowCell key={2} data={score.validateScore.rmse} title={score.validateScore.rmse === 'null' ? (validate || {}).rmse : ""} />;
              case 'MSLE':
                return <RowCell key={11} data={score.validateScore.msle} title={score.validateScore.msle === 'null' ? (validate || {}).msle : ""} />;
              case 'RMSLE':
                return <RowCell key={9} data={score.validateScore.rmsle} title={score.validateScore.rmsle === 'null' ? (validate || {}).rmsle : ""} />;
              case 'MSE':
                return <RowCell key={3} data={score.validateScore.mse} title={score.validateScore.mse === 'null' ? (validate || {}).mse : ""} />;
              case 'MAE':
                return <RowCell key={4} data={score.validateScore.mae} title={score.validateScore.mae === 'null' ? (validate || {}).mae : ""} />;
              case 'R2':
                return <RowCell key={5} data={score.validateScore.r2} title={score.validateScore.r2 === 'null' ? (validate || {}).r2 : ""} />;
              case 'AdjustR2':
                return <RowCell key={8} data={score.validateScore.adjustR2} title={score.validateScore.adjustR2 === 'null' ? (validate || {}).adjustR2 : ""} />;
              case EN.Validation:
                return <RowCell key={6} data={score.validateScore[metric]} title={score.validateScore[metric] === 'null' ? (validate || {})[metric] : ""} />;
              case EN.Holdout:
                return <RowCell key={7} data={score.holdoutScore[metric]} title={score.holdoutScore[metric] === 'null' ? (holdout || {})[metric] : ""} />;
              case EN.Time:
                return <RowCell key={12} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <RegressionDetailCurves project={this.props.project} model={model} />}
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

  setChartDate() {
    const url = this.props.model.fitAndResidualPlotData;
    request.post({
      url: '/graphics/fit-plot',
      data: {
        url,
      },
    }).then(chartDate => {
      this.setState({
        chartDate
      })
    });
  }

  render() {
    const { model } = this.props;
    const { curve, diagnoseType, chartDate } = this.state;
    let curComponent;
    switch (curve) {
      case EN.VariableImpact:
        curComponent = <div style={{ fontSize: 60 }} ><VariableImpact model={model} /></div>
        break;
      case EN.FitPlot:
        curComponent = <div className={styles.plot}>
          {chartDate && <FitPlot2
            title={EN.FitPlot}
            x_name={EN.Truevalue}
            y_name={EN.Predictvalue}
            chartDate={chartDate}
          />}
        </div>;
        break;
      case EN.ResidualPlot:
        const Plot = <ResidualPlot
          title={EN.ResidualPlot}
          x_name={EN.Truevalue}
          y_name={EN.Predictvalue}
          chartDate={chartDate}
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
    const { model, texts, metric, checked, yes, no } = this.props;
    if (!model.chartData) return null;
    const { modelName, fitIndex, chartData: { roc, rocHoldout }, score } = model;
    const { detail } = this.state;
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
                      <span className={styles.modelName} alt={modelName} >{modelName}</span>
                    </Tooltip>
                  </div>}
                  />
                );
              case 'F1-Score':
                return <RowCell key={2} data={model.f1Validation} />;
              case 'Precision':
                return <RowCell key={3} data={model.precisionValidation} />;
              case 'Recall':
                return <RowCell key={4} data={model.recallValidation} />;
              case 'LogLoss':
                return <RowCell key={5} data={roc.LOGLOSS[fitIndex]} />;
              case 'Cutoff Threshold':
                return <RowCell key={6} data={roc.Threshold[fitIndex]} />;
              case 'KS':
                return <RowCell key={7} data={roc.KS[fitIndex]} />;
              case EN.Validation:
                return <RowCell key={8} data={metric === 'log_loss' ? roc.LOGLOSS[fitIndex] : metric === 'auc' ? score.validateScore[metric] : model[metric + 'Validation']} />;
              case EN.Holdout:
                return <RowCell key={9} data={metric === 'log_loss' ? rocHoldout.LOGLOSS[fitIndex] : metric === 'auc' ? score.holdoutScore[metric] : model[metric + 'Holdout']} />;
              case EN.Time:
                return <RowCell key={10} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <DetailCurves model={model} yes={yes} no={no} />}
      </div>
    )
  }
}

class DetailCurves extends Component {
  state = {
    curve: EN.ROCCurve,
    show: true,
  }
  handleClick = val => {
    this.setState({ curve: val });
  }
  reset = () => {
    this.props.model.resetFitIndex();
    this.setState({
      show: false
    })
    setTimeout(() => {
      this.setState({
        show: true
      })
    }, 0)
  };
  render() {
    const { model, model: { mid }, yes, no, project } = this.props;
    const { curve, show } = this.state;
    let curComponent;
    let hasReset = true;
    switch (curve) {
      case EN.ROCCurve:
        curComponent = show && <ROCCurves
          height={300}
          width={500}
          x_name={EN.FalsePositiveDate}
          y_name={EN.TruePositiveRate}
          model={model}
        />;
        break;
      case EN.PredictionDistribution:
        curComponent = show && <PredictionDistributions
          height={300}
          width={500}
          x_name={EN.ProbabilityThreshold}
          y_name={EN.ProbabilityDensity}
          model={model}
        />;
        break;
      case EN.PrecisionRecallTradeoff:
        curComponent = show && <PRCharts
          height={300} width={500}
          x_name={EN.Recall}
          y_name={EN.Precision}
          model={model}
        />
        break;
      case EN.LiftChart:
        curComponent = <SingleLiftCharts
          height={300} width={500}
          x_name={EN.percentage}
          y_name={EN.lift}
          model={model}
        />
        hasReset = false;
        break;
      case EN.VariableImpact:
        curComponent = <div style={{ fontSize: 50 }} ><VariableImpact model={model} /></div>
        hasReset = false;
        break;
      case EN.ModelProcessFlow:
        curComponent = <div style={{ maxWidth: document.body.clientWidth / 2 }} >
          <ModelProcess model={model} className={`modelprocess${mid}`} />
        </div>
        hasReset = false;
        break;
      default:
        break;
    }
    const thumbnails = [{
      normalIcon: ROCCurve,
      hoverIcon: rocHover,
      selectedIcon: rocSelected,
      text: EN.ROCCurve
    }, {
      normalIcon: predictDist,
      hoverIcon: predictionDistribution,
      selectedIcon: predictionDistributionSelected,
      text: EN.PredictionDistribution
    }, {
      normalIcon: precisionRecall,
      hoverIcon: precisionRecallHover,
      selectedIcon: precisionRecallSelected,
      text: EN.PrecisionRecallTradeoff
    }, {
      normalIcon: liftChart,
      hoverIcon: liftchartHover,
      selectedIcon: liftchartSelected,
      text: EN.LiftChart
    }, {
      normalIcon: varImpactNormal,
      hoverIcon: varImpactHover,
      selectedIcon: varImpactSelected,
      text: EN.VariableImpact
    }, {
      normalIcon: modelProcess,
      hoverIcon: processHover,
      selectedIcon: processSelectd,
      text: EN.ModelProcessFlow
    }];
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} style={{ flex: 1 }}>
          <div className={styles.thumbnails}>
            {thumbnails.slice(0, 5).map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
          </div>
          <PredictTable model={model} yes={yes} no={no} />
        </div>
        <div className={styles.rightPanel} style={{ marginLeft: 10 }}>
          {curComponent}
          {hasReset && <button onClick={this.reset} className={styles.button + ' ' + styles.buttonr} >{EN.Reset}</button>}
        </div>
      </div>
    )
  }
}

class Thumbnail extends Component {
  state = {
    clickActive: false,
    hoverActive: false
  }
  componentDidMount() {
    const { curSelected, value } = this.props;
    this.setState({ clickActive: curSelected === value });
  }
  componentWillReceiveProps(nextProps) {
    const { curSelected, value } = nextProps;
    this.setState({ clickActive: curSelected === value });
  }
  handleClick = e => {
    e.stopPropagation();
    this.setState({ clickActive: true });
    this.props.onClick(this.props.value);
  }
  // handleMouseEnter = () => {
  //   this.setState({ hoverActive: true });
  // }
  // handleMouseLeave = () => {
  //   this.setState({ hoverActive: false });
  // };
  render() {
    const { selectedIcon, hoverIcon, normalIcon, text } = this.props.thumbnail;
    const { clickActive, hoverActive } = this.state;
    const icon = clickActive ? selectedIcon : hoverActive ? hoverIcon : normalIcon;
    return (
      <div
        className={styles.thumbnail}
        // onMouseEnter={this.handleMouseEnter}
        // onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
      >
        <img src={icon} alt="icon" />
        <div>{text}</div>
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


@observer
class PredictTable extends Component {
  render() {
    const { model, yes, no } = this.props;
    const { fitIndex, chartData } = model;
    let TN = chartData.roc.TN[fitIndex];
    let FP = chartData.roc.FP[fitIndex];
    let TP = chartData.roc.TP[fitIndex];
    let FN = chartData.roc.FN[fitIndex];
    const column = [{
      title: '',
      dataIndex: 'rowName',
      className: styles.actual
    }, {
      title: `${EN.Predict}: ${no}`,
      dataIndex: 'col1',
    }, {
      title: `${EN.Predict}: ${yes}`,
      dataIndex: 'col2'
    }, {
      title: '',
      dataIndex: 'sum'
    }];

    // set default value
    const data = [{
      rowName: `${EN.Actual}: ${no}`,
      col1: `${Math.round(TN)}(TN)`,
      col2: `${Math.round(FP)}(FP)`,
      sum: +TN + +FP,
    }, {
      rowName: `${EN.Actual}: ${yes}`,
      col1: `${Math.round(FN)}(FN)`,
      col2: `${Math.round(TP)}(TP)`,
      sum: Number(FN) + +TP
    }, {
      rowName: '',
      col1: +TN + +FN,
      col2: +FP + +TP,
      sum: +TN + +FN + +FP + +TP
    }];
    return (
      <Table
        className={styles.predictTable}
        columns={column}
        bordered
        rowKey={re => {
          return re.rowName;
        }}
        dataSource={data}
        pagination={false} />
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
                <LiftChart2
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
                <RocChart2
                  models={models}
                  selectAll={select}
                  x_name={EN.FalsePositiveDate}
                  y_name={EN.TruePositiveRate}
                  mom='roc'
                  x='FPR'
                  y='TPR'
                />
              </TabPane>
              {/* <TabPane tab="Learning Curves" key="2">
                <Learning width={600} height={400} className="learningComp" models={models} model={models[0]} />
              </TabPane> */}
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
