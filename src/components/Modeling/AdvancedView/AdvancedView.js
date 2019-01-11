import React, { Component } from 'react';
import classnames from 'classnames';
import { Table, Tabs, Modal, Select, Radio, Button, Tooltip, Icon } from 'antd';
import { observer } from 'mobx-react';
import styles from './AdvancedView.module.less';
import RocChart from 'components/D3Chart/RocChart';
import PRChart from 'components/D3Chart/PRChart';
import PredictionDistribution from 'components/D3Chart/PredictionDistribution';
import LiftChart from 'components/D3Chart/LiftChart';
import SpeedAndAcc from 'components/D3Chart/SpeedAndAcc';
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
import { observable, computed, action, autorun } from 'mobx';
import moment from 'moment';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

@observer
export default class AdvancedView extends Component {

  @observable currentSettingId = 'all'
  // undefined = can not sort, false = no sort ,1 = asc, 2 = desc
  @observable sortState = { 'Model Name': 1, 'F1-Score': false, 'Precision': false, 'Recall': false, 'LogLoss': false, 'Cutoff Threshold': false, 'Validation': false, 'Holdout': false, 'Normalized RMSE': false, 'RMSE': false, 'MSLE': false, 'RMSLE': false, 'MSE': false, 'MAE': false, 'R2': false, 'adjustR2': false }
  @observable metric = {
    key: '',
    display: ''
  }

  @computed
  get filtedModels() {
    const { models, project } = this.props
    let _filtedModels = [...models]
    const currentSort = Object.keys(this.sortState).find(key => this.sortState[key])
    const metricKey = this.metric.key
    const formatNumber = number => {
      try {
        number = parseFloat(number)
        return parseInt(number * 1000, 10)
      } catch (e) {
        console.log('compare error:', e)
        return 0
      }
    }
    const sortMethods = (aModel, bModel) => {
      switch (currentSort) {
        case 'F1-Score':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = formatNumber(aModel.chartData.roc.F1[aFitIndex])
            const bModelData = formatNumber(bModel.chartData.roc.F1[bFitIndex])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Precision':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = formatNumber(aModel.chartData.roc.Precision[aFitIndex])
            const bModelData = formatNumber(bModel.chartData.roc.Precision[bFitIndex])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Recall':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = formatNumber(aModel.chartData.roc.Recall[aFitIndex])
            const bModelData = formatNumber(bModel.chartData.roc.Recall[bFitIndex])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'LogLoss':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = formatNumber(aModel.chartData.roc.LOGLOSS[aFitIndex])
            const bModelData = formatNumber(bModel.chartData.roc.LOGLOSS[bFitIndex])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Cutoff Threshold':
          {
            const aFitIndex = aModel.fitIndex
            const bFitIndex = bModel.fitIndex
            const aModelData = formatNumber(aModel.chartData.roc.Threshold[aFitIndex])
            const bModelData = formatNumber(bModel.chartData.roc.Threshold[bFitIndex])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Normalized RMSE':
          {
            const aModelData = formatNumber(aModel.score.validateScore.nrmse)
            const bModelData = formatNumber(bModel.score.validateScore.nrmse)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'RMSE':
          {
            const aModelData = formatNumber(aModel.score.validateScore.rmse)
            const bModelData = formatNumber(bModel.score.validateScore.rmse)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'MSLE':
          {
            const aModelData = formatNumber(aModel.score.validateScore.msle)
            const bModelData = formatNumber(bModel.score.validateScore.msle)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'RMSLE':
          {
            const aModelData = formatNumber(aModel.score.validateScore.rmsle)
            const bModelData = formatNumber(bModel.score.validateScore.rmsle)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'MSE':
          {
            const aModelData = formatNumber(aModel.score.validateScore.mse)
            const bModelData = formatNumber(bModel.score.validateScore.mse)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'MAE':
          {
            const aModelData = formatNumber(aModel.score.validateScore.mae)
            const bModelData = formatNumber(bModel.score.validateScore.mae)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'R2':
          {
            const aModelData = formatNumber(aModel.score.validateScore.r2)
            const bModelData = formatNumber(bModel.score.validateScore.r2)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'adjustR2':
          {
            const aModelData = formatNumber(aModel.score.validateScore.adjustR2)
            const bModelData = formatNumber(bModel.score.validateScore.adjustR2)
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Validation':
          {
            const aModelData = metricKey === 'acc' ? formatNumber(aModel.validationAcc) : formatNumber(aModel.score.validateScore[metricKey])
            const bModelData = metricKey === 'acc' ? formatNumber(bModel.validationAcc) : formatNumber(bModel.score.validateScore[metricKey])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Holdout':
          {
            const aModelData = metricKey === 'acc' ? formatNumber(aModel.holdoutAcc) : formatNumber(aModel.score.holdoutScore[metricKey])
            const bModelData = metricKey === 'acc' ? formatNumber(bModel.holdoutAcc) : formatNumber(bModel.score.holdoutScore[metricKey])
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Model Name':
        default:
          const aModelTime = aModel.name.split('.').splice(1, Infinity).join('.')
          const aModelUnix = moment(aModelTime, 'MM.DD.YYYY_HH:mm:ss').unix()
          const bModelTime = bModel.name.split('.').splice(1, Infinity).join('.')
          const bModelUnix = moment(bModelTime, 'MM.DD.YYYY_HH:mm:ss').unix()
          return this.sortState[currentSort] === 1 ? aModelUnix - bModelUnix : bModelUnix - aModelUnix
      }
    }
    _filtedModels = _filtedModels.sort(sortMethods)
    if (this.currentSettingId === 'all') return _filtedModels
    const currentSetting = project.settings.find(setting => setting.id === this.currentSettingId)
    if (currentSetting && currentSetting.models && currentSetting.models.length > 0)
      return _filtedModels.filter(model => currentSetting.models.find(id => model.name === id))
    return _filtedModels
  }

  @computed
  get performance() {
    try {
      const { project } = this.props;
      const { selectModel: current } = project;
      if (project.problemType === 'Classification') {
        return current ? (current.score.validateScore.auc > 0.8 && "GOOD") || (current.score.validateScore.auc > 0.6 && "OK") || "NotSatisfied" : ''
      } else {
        return current ? (current.score.validateScore.r2 > 0.5 && "Acceptable") || "Not Acceptable" : ''
      }
    } catch (e) {
      return 'OK'
    }
  }

  @computed
  get metricOptions() {
    const { project } = this.props
    if (project && project.problemType) {
      return project.problemType === 'Classification' ? [{
        display: 'acc',
        key: 'acc'
      }, {
        display: 'auc',
        key: 'auc'
      }] : [{
        display: 'MAE',
        key: 'mae'
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

  changeSort = (type) => action(() => {
    const currentActive = Object.keys(this.sortState).find(key => this.sortState[key])
    if (type === currentActive) return this.sortState[type] = this.sortState[type] === 1 ? 2 : 1
    this.sortState[currentActive] = false
    this.sortState[type] = 1
  })

  changeSetting = action((settingId) => {
    this.currentSettingId = settingId
  })

  handleChange = action(value => {
    this.metric = this.metricOptions.find(m => m.key === value);
  })

  constructor(props) {
    super(props)
    autorun(() => {
      const { project } = props
      if (project && project.measurement)
        this.metric = this.metricOptions.find(metric => metric.key === project.measurement) || this.metricOptions[0]
    })
  }

  render() {
    const { project } = this.props;

    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.modelResult} >
          Modeling Results :{' '}
          <div className={styles.status}>&nbsp;&nbsp;{this.performance}</div>
        </div>
        <div className={styles.middle}>
          <div className={styles.settings}>
            <span className={styles.label}>Model Name Contains:</span>
            <Select className={styles.settingsSelect} value={this.currentSettingId} onChange={this.changeSetting} >
              <Option value={'all'}>All</Option>
              {project.settings.map(setting => <Option key={setting.id} value={setting.id} >{setting.name}</Option>)}
            </Select>
          </div>
          {project.problemType === 'Classification' && <ModelComp models={this.filtedModels} />}
        </div>
        <div className={styles.metricSelection} >
          <span className={styles.text} >Measurement Metric</span>
          <Select size="large" value={this.metric.key} onChange={this.handleChange} >
            {this.metricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
          </Select>
        </div>
        <AdvancedModelTable models={this.filtedModels} project={project} sortState={this.sortState} changeSort={this.changeSort} metric={this.metric} />
      </div>
    )
  }
}

@observer
class AdvancedModelTable extends Component {

  onClickCheckbox = (modelId) => (e) => {
    this.props.project.setSelectModel(modelId);
    e.stopPropagation()
  }

  render() {
    const { models, project: { problemType, selectModel, targetArray, targetColMap, renameVariable }, sortState, changeSort, metric } = this.props;
    const [v0, v1] = !targetArray.length ? Object.keys(targetColMap) : targetArray
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1]
    const texts = problemType === 'Classification' ?
      ['Model Name', 'F1-Score', 'Precision', 'Recall', 'LogLoss', 'Cutoff Threshold', 'Validation', 'Holdout'] :
      ['Model Name', 'Normalized RMSE', 'RMSE', 'MSLE', 'RMSLE', 'MSE', 'MAE', 'R2', 'adjustR2', 'Validation', 'Holdout',];
    const replaceR2 = str => str.replace(/R2/g, 'R²');
    const headerData = texts.reduce((prev, curr) => {
      const label = <div className={styles.headerLabel} title={replaceR2(curr)}>{replaceR2(curr)}</div>
      if (sortState[curr] === undefined) return { ...prev, [curr]: curr }
      if (sortState[curr] === false) return { ...prev, [curr]: <div onClick={changeSort(curr)}>{label}<Icon type='minus' /></div> }
      if (sortState[curr] === 1) return { ...prev, [curr]: <div onClick={changeSort(curr)}>{label}<Icon type='up' /></div> }
      if (sortState[curr] === 2) return { ...prev, [curr]: <div onClick={changeSort(curr)}>{label}<Icon type='up' style={{ transform: 'rotateZ(180deg)' }} /></div> }
      return prev
    }, {});
    const header = <Row>{texts.map(t => <RowCell data={headerData[t]} key={t} />)}</Row>
    const dataSource = models.map(m => {
      if (problemType === 'Classification') {
        return (
          <ClassificationModelRow no={no} yes={yes} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} metric={metric.key} />
        )
      } else {
        return <RegressionModleRow project={this.props.project} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} metric={metric.key} />
      }
    });
    return (
      <div className={styles.advancedModelTable} >
        {header}
        {dataSource}
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
    const { score, name } = model;
    const { detail } = this.state;
    // console.log(score.validateScore)
    return (
      <div >
        <Row onClick={this.handleResult} >
          {texts.map(t => {
            switch (t) {
              case 'Model Name':
                return (
                  <RowCell key={1} data={<div key={1} >
                    <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    <Tooltip title={name}>
                      <span className={styles.modelName} alt={name}>{name}</span>
                    </Tooltip>
                  </div>}
                  />
                )
              case 'Normalized RMSE':
                return <RowCell key={10} data={score.validateScore.nrmse} />;
              case 'RMSE':
                return <RowCell key={2} data={score.validateScore.rmse} />;
              case 'MSLE':
                return <RowCell key={11} data={score.validateScore.msle} />;
              case 'RMSLE':
                return <RowCell key={9} data={score.validateScore.rmsle} />;
              case 'MSE':
                return <RowCell key={3} data={score.validateScore.mse} />;
              case 'MAE':
                return <RowCell key={4} data={score.validateScore.mae} />;
              case 'R2':
                return <RowCell key={5} data={score.validateScore.r2} />;
              case 'adjustR2':
                return <RowCell key={8} data={score.validateScore.adjustR2} />;
              case 'Validation':
                return <RowCell key={6} data={score.validateScore[metric]} />;
              case 'Holdout':
                return <RowCell key={7} data={score.holdoutScore[metric]} />;
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
    curve: "Variable Impact",
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

  render() {
    const { model } = this.props;
    const { curve, diagnoseType } = this.state;
    let curComponent;
    switch (curve) {
      case 'Variable Impact':
        curComponent = <div style={{ fontSize: 60 }} ><VariableImpact model={model} /></div>
        break;
      case 'Fit Plot':
        curComponent = (
          <div className={styles.plot} >
            <img className={styles.img} src={model.fitPlotPath} alt="fit plot" />
          </div>
        )
        break;
      case 'Residual Plot':
        curComponent = (
          <div className={styles.plot} >
            <img className={styles.img} src={model.residualPlotPath} alt="residual plot" />
            <Modal
              visible={this.state.visible}
              title='Residual Plot Diagnose'
              width={1200}
              onOk={() => this.setState({ visible: false })}
              onCancel={() => this.setState({ visible: false })}
            >
              <ResidualDiagnose handleDiagnoseType={this.handleDiagnoseType} diagnoseType={diagnoseType} residualplot={model.residualPlotPath} />
            </Modal>
            <DiagnoseResult project={this.props.project} handleDiagnose={this.handleDiagnose} diagnoseType={diagnoseType} />
          </div>
        )
        break;
      default:
        break
    }
    const thumbnails = [{
      text: 'Fit Plot',
      hoverIcon: FitPlotHover,
      normalIcon: FitPlotNormal,
      selectedIcon: FitPlotSelected,
      type: 'fitplot'
    }, {
      text: 'Residual Plot',
      hoverIcon: ResidualHover,
      normalIcon: ResidualNormal,
      selectedIcon: ResidualSelected,
      type: 'residualplot'
    }, {
      normalIcon: varImpactNormal,
      hoverIcon: varImpactHover,
      selectedIcon: varImpactSelected,
      text: 'Variable Impact'
    }]
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} style={{ minWidth: 0 }} >
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
  }
  handleClick = e => {
    e.stopPropagation();
  }
  handleResult = () => {
    this.setState({ detail: !this.state.detail });
  }
  render() {
    const { model, texts, metric, checked, yes, no } = this.props;
    if (!model.chartData) return null;
    const { name, fitIndex, chartData: { roc }, score } = model;
    const { detail } = this.state;
    return (
      <div >
        <Row onClick={this.handleResult} >
          {texts.map(t => {
            switch (t) {
              case 'Model Name':
                return (
                  <RowCell key={1} data={<div key={1} >
                    <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    <Tooltip title={name}>
                      <span className={styles.modelName} alt={name} >{name}</span>
                    </Tooltip>
                  </div>}
                  />
                )
              case 'F1-Score':
                return <RowCell key={2} data={roc.F1[fitIndex]} />;
              case 'Precision':
                return <RowCell key={3} data={roc.Precision[fitIndex]} />;
              case 'Recall':
                return <RowCell key={4} data={roc.Recall[fitIndex]} />;
              case 'LogLoss':
                return <RowCell key={8} data={roc.LOGLOSS[fitIndex]} />;
              case 'Cutoff Threshold':
                return <RowCell key={5} data={roc.Threshold[fitIndex]} />;
              case 'Validation':
                return <RowCell key={6} data={metric === 'acc' ? model.validationAcc : score.validateScore[metric]} />;
              case 'Holdout':
                return <RowCell key={7} data={metric === 'acc' ? model.holdoutAcc : score.holdoutScore[metric]} />;
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
    curve: "ROC Curve"
  }
  handleClick = val => {
    this.setState({ curve: val });
  }
  reset = () => {
    this.props.model.resetFitIndex();
  }
  render() {
    const { model, model: { mid }, yes, no } = this.props;
    const { curve } = this.state;
    let curComponent;
    let hasReset = true;
    switch (curve) {
      case 'ROC Curve':
        curComponent = <RocChart height={190} width={500} className={`roc${mid}`} model={model} />
        break;
      case 'Prediction Distribution':
        curComponent = <PredictionDistribution height={190} width={500} className={`roc${mid}`} model={model} />
        break;
      case 'Precision Recall Tradeoff':
        curComponent = <PRChart height={190} width={500} className={`precisionrecall${mid}`} model={model} />
        break;
      case 'Lift Chart':
        curComponent = <LiftChart height={190} width={500} className={`lift${mid}`} model={model} />;
        break;
      case 'Variable Impact':
        curComponent = <div style={{ fontSize: 50 }} ><VariableImpact model={model} /></div>
        hasReset = false;
        break;
      case 'Model Process Flow':
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
      text: 'ROC Curve'
    }, {
      normalIcon: predictDist,
      hoverIcon: predictionDistribution,
      selectedIcon: predictionDistributionSelected,
      text: 'Prediction Distribution'
    }, {
      normalIcon: precisionRecall,
      hoverIcon: precisionRecallHover,
      selectedIcon: precisionRecallSelected,
      text: 'Precision Recall Tradeoff'
    }, {
      normalIcon: liftChart,
      hoverIcon: liftchartHover,
      selectedIcon: liftchartSelected,
      text: 'Lift Chart'
    }, {
      normalIcon: varImpactNormal,
      hoverIcon: varImpactHover,
      selectedIcon: varImpactSelected,
      text: 'Variable Impact'
    }, {
      normalIcon: modelProcess,
      hoverIcon: processHover,
      selectedIcon: processSelectd,
      text: 'Model Process Flow'
    }];
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} >
          <div className={styles.thumbnails} >
            {thumbnails.slice(0, 4).map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
          </div>
          <PredictTable model={model} yes={yes} no={no} />
          <div className={styles.thumbnails}>
            {thumbnails.slice(4, 5).map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
          </div>
        </div>
        <div className={styles.rightPanel} >
          {hasReset && <button onClick={this.reset} className={styles.button} >Reset</button>}
          {curComponent}
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
  componentWillReceiveProps(nextProps) {
    const { curSelected, value } = nextProps;
    this.setState({ clickActive: curSelected === value });
  }
  handleClick = e => {
    e.stopPropagation();
    this.setState({ clickActive: true });
    this.props.onClick(this.props.value);
  }
  handleMouseEnter = () => {
    this.setState({ hoverActive: true });
  }
  handleMouseLeave = () => {
    this.setState({ hoverActive: false });
  }
  render() {
    const { selectedIcon, hoverIcon, normalIcon, text } = this.props.thumbnail;
    const { clickActive, hoverActive } = this.state;
    const icon = clickActive ? selectedIcon : hoverActive ? hoverIcon : normalIcon;
    return (
      <div
        className={styles.thumbnail}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
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
    const { data, cellStyle, other, cellClassName, ...rest } = this.props;
    const fixed3 = (data) => typeof data === 'number' ? data.toFixed(3) : data
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={data}
      >
        {other ? <span className={styles.hasotherCell} >{fixed3(data)}</span> : fixed3(data)}
        {other}
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
      title: `Predict: ${no}`,
      dataIndex: 'col1',
    }, {
      title: `Predict: ${yes}`,
      dataIndex: 'col2'
    }, {
      title: '',
      dataIndex: 'sum'
    }];

    // set default value
    const data = [{
      rowName: `Actual: ${no}`,
      col1: `${Math.round(TN)}(TN)`,
      col2: `${Math.round(FP)}(FP)`,
      sum: +TN + +FP,
    }, {
      rowName: `Actual: ${yes}`,
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
    modelCompVisible: false
  }
  handleClick = () => {
    this.setState({ modelCompVisible: true });
  }
  handleCancel = () => {
    this.setState({ modelCompVisible: false });
  }
  render() {
    const { models } = this.props;
    return (
      <div className={styles.modelComp}>
        <a onClick={this.handleClick} className={styles.comparison}>Models comparison charts</a>
        <Modal
          width={1000}
          visible={this.state.modelCompVisible}
          onCancel={this.handleCancel}
          closable={false}
          footer={
            <Button key="cancel" type="primary" onClick={this.handleCancel}>Close</Button>
          }
        >
          <div>
            <h4>Model Comparison Charts</h4>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Speed vs Accuracy" key="1">
                <SpeedAndAcc models={models} width={600} height={400} className="speedComp" />
              </TabPane>
              <TabPane tab="Lifts Charts" key="3">
                <LiftChart className="liftComp" isFocus={false} compareChart={true} width={600} height={400} models={models} model={models[0]} />
              </TabPane>
              <TabPane tab="ROC Curves" key="4">
                <RocChart className="rocComp" isFocus={false} compareChart={true} width={600} height={400} models={models} model={models[0]} />
              </TabPane>
              {/* <TabPane tab="Learning Curves" key="2">
                <Learning width={600} height={400} className="learningComp" models={models} model={models[0]} />
              </TabPane> */}
            </Tabs>
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
      text: 'Randomly Distributed'
    }, {
      plot: yAxisUnbalancedImg,
      type: 'yUnbalanced',
      text: 'Y-axis Unbalanced'
    }, {
      plot: xAxisUnbalancedImg,
      type: 'xUnbalanced',
      text: 'X-axis Unbalanced'
    }, {
      plot: outliersImg,
      type: 'outliers',
      text: 'Outliers'
    }, {
      plot: nonlinearImg,
      type: 'nonlinear',
      text: 'Nonlinear'
    }, {
      plot: heteroscedasticityImg,
      type: 'heteroscedasticity',
      text: 'Heteroscedasticity'
    }, {
      plot: largeImg,
      type: 'largey',
      text: 'Large Y-axis Data Points'
    }];
    const { diagnoseType, residualplot } = this.props;
    const RadioGroup = Radio.Group;
    // const disabled = diagnoseType === '';
    // const disabled = false;
    return (
      <div className={styles.residualDiagnose} >
        <div className={styles.plot} >
          <img width={300} src={residualplot} alt="" />
        </div>
        <div className={styles.choosePlot} >
          <div>Which plot does your residual plot look most similar to?</div>
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
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 3))
    // history.push(`/modeling/${this.props.projectId}/1`);
  }
  handleOutlierFix = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(3, 2))
    // history.push(`/data/${this.props.projectId}/5`);
  }
  render() {
    const { diagnoseType } = this.props;
    let result;
    // const type = 'large';
    switch (diagnoseType) {
      case 'random':
        result = <div className={styles.content} >Perfect, your residual plot is randomly distributed. No need to further improve your models. </div>;
        break;
      case 'yUnbalanced':
        result = (
          <div className={styles.content}>
            <div>Your plot is unbalanced on y-axis. You might be able to improve your model via:</div>
            <ul className={styles.items} >
              <li>Looking for an opportunity to usefully transform your variables, typically your target variable</li>
              <li>Checking if your model lacks informative variables</li>
            </ul>
            <div className={styles.action} >
              <span>You can transform or select variables in our application</span>
              <button onClick={this.handleSetting} className={styles.button} >Go to Advanced Variable Setting</button>
            </div>
            <div className={styles.action} >
              <span>Alternatively, you can modify your data offline and reload it.</span>
              <button onClick={this.handleNewData} className={styles.button} >Load My New Data</button>
            </div>
          </div>
        );
        break;
      case 'xUnbalanced':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >Diagnose Results:</div>
            <div>Your plot is unbalanced on x-axis. You might be able to improve your model via:</div>
            <ul className={styles.items} >
              <li>Looking for an opportunity to usefully transform your variables, typically your predictors</li>
              <li>Checking if your model lacks informative variables</li>
            </ul>
            <div className={styles.action} >
              <span>You can transform or select variables in our application</span>
              <button onClick={this.handleSetting} className={styles.button} >Go to Advanced Variable Setting</button>
            </div>
            <div className={styles.action} >
              <span>Alternatively, you can modify your data offline and reload it.</span>
              <button onClick={this.handleNewData} className={styles.button} >Load My New Data</button>
            </div>
          </div>
        );
        break;
      case 'outliers':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >Diagnose Results:</div>
            <div>Your plot is has some outliers. You might be able to improve your model via:</div>
            <ul className={styles.items} >
              <li>Deleting the outliers if you decide that they are useless</li>
              <li>Checking if your model lacks informative variables</li>
            </ul>
            <div className={styles.action} >
              <span>You can delete the outliers in our application</span>
              <button onClick={this.handleOutlierFix} className={styles.button} >Go to Edit the Fixes for Outliers</button>
            </div>
            <div className={styles.action} >
              <span>You can transform or select variables in our application</span>
              <button onClick={this.handleSetting} className={styles.button} >Go to Advanced Variable Setting</button>
            </div>
            <div className={styles.action} >
              <span>Alternatively, you can modify your data offline and reload it.</span>
              <button onClick={this.handleNewData} className={styles.button} >Load My New Data</button>
            </div>
          </div>
        );
        break;
      case 'nonlinear':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >Diagnose Results:</div>
            <div>Your plot is nonlinear. You might be able to improve your model via:</div>
            <ul className={styles.items} >
              <li>Looking for an opportunity to usefully transform a variable.</li>
              <li>Checking if your need to add new a variable</li>
            </ul>
            <div className={styles.action} >
              <span>You can transform or select variables in our application</span>
              <button onClick={this.handleSetting} className={styles.button} >Go to Advanced Variable Setting</button>
            </div>
            <div className={styles.action} >
              <span>Alternatively, you can modify your data offline and reload it.</span>
              <button onClick={this.handleNewData} className={styles.button} >Load My New Data</button>
            </div>
          </div>
        );
        break;
      case 'heteroscedasticity':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >Diagnose Results:</div>
            <div>Your plot is heteroscedasticity. You might be able to improve your model via:</div>
            <ul className={styles.items} >
              <li>Looking for an opportunity to usefully transform a variable.</li>
              <li>Checking if your need to add new a variable</li>
            </ul>
            <div className={styles.action} >
              <span>You can transform or select variables in our application</span>
              <button onClick={this.handleSetting} className={styles.button} >Go to Advanced Variable Setting</button>
            </div>
            <div className={styles.action} >
              <span>Alternatively, you can modify your data offline and reload it.</span>
              <button onClick={this.handleNewData} className={styles.button} >Load My New Data</button>
            </div>
          </div>
        );
        break;
      case 'largey':
        result = (
          <div className={styles.content}>
            <div className={styles.header} >Diagnose Results:</div>
            <div>Your plot has large y-axis datapoints. You might be able to improve your model via:</div>
            <ul className={styles.items} >
              <li>Looking for an opportunity to usefully transform a variable.</li>
              <li>Checking if your need to add new a variable</li>
            </ul>
            <div className={styles.action} >
              <span>You can transform or select variables in our application</span>
              <button onClick={this.handleSetting} className={styles.button} >Go to Advanced Variable Setting</button>
            </div>
            <div className={styles.action} >
              <span>Alternatively, you can modify your data offline and reload it.</span>
              <button onClick={this.handleNewData} className={styles.button} >Load My New Data</button>
            </div>
          </div>
        );
        break;
      default: break;
    }
    return (
      <div className={styles.diagnoseResult} >
        <button onClick={this.props.handleDiagnose} className={styles.button} >Diagnose</button>
        {result}
      </div>
    );
  }
}
