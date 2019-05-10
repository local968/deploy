import React, { Component } from 'react';
import classnames from 'classnames';
import { Table } from 'antd';
import { observer, inject } from 'mobx-react';
import styles from './AdvancedView.module.css';
import RocChart from 'components/D3Chart/RocChart';
import PRChart from 'components/D3Chart/PRChart';
import PredictionDistribution from 'components/D3Chart/PredictionDistribution';
import LiftChart from 'components/D3Chart/LiftChart';
import PredictVActual from '../Model/PredictVActual'
import { NumberInput } from 'components/Common';
import { formatNumber } from 'util'
import { observable, computed, action, autorun, runInAction } from 'mobx';
import EN from '../../../constant/en';
import moment from 'moment';

@inject('projectStore')
@observer
class AdvancedView extends Component {

  @observable currentSettingId = 'all';

  // undefined = can not sort, false = no sort ,1 = asc, 2 = desc
  @observable sortState = {
    'Model Name': 1,
    'F1-Score': false,
    'Precision': false,
    'Recall': false,
    'LogLoss': false,
    'Cutoff Threshold': false,
    'Validation': false,
    'Holdout': false,
    'Normalized RMSE': false,
    'RMSE': false,
    'MSLE': false,
    'RMSLE': false,
    'MSE': false,
    'MAE': false,
    'R2': false,
    'adjustR2': false,
    'KS': false
  };
  @observable metric = {
    key: '',
    display: ''
  };

  @computed
  get filtedModels() {
    const { models, project, projectStore } = this.props;
    let _filtedModels = [...models];
    const currentSort = Object.keys(this.sortState).find(key => this.sortState[key])
    const metricKey = this.metric.key;

    let { stopFilter, oldfiltedModels } = projectStore;

    const sortMethods = (aModel, bModel) => {
      switch (currentSort) {
        case 'F1-Score':
          {
            const aFitIndex = aModel.fitIndex;
            const bFitIndex = bModel.fitIndex;
            const aModelData = formatNumber(aModel.chartData.roc.F1[aFitIndex]);
            const bModelData = formatNumber(bModel.chartData.roc.F1[bFitIndex]);
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
        case 'KS':
          {
            const aFitIndex = aModel.fitIndex;
            const bFitIndex = bModel.fitIndex;
            const aModelData = formatNumber(aModel.chartData.roc.KS[aFitIndex]);
            const bModelData = formatNumber(bModel.chartData.roc.KS[bFitIndex]);
            return this.sortState[currentSort] === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Model Name':
        default:
          const aModelTime = aModel.name.split('.').splice(1, Infinity).join('.');
          const aModelUnix = moment(aModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
          const bModelTime = bModel.name.split('.').splice(1, Infinity).join('.');
          const bModelUnix = moment(bModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
          return this.sortState[currentSort] === 1 ? aModelUnix - bModelUnix : bModelUnix - aModelUnix
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
      return _filtedModels.filter(model => currentSetting.models.find(id => model.name === id))
    return _filtedModels
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
      return EN.OK
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

  changeSetting = action((settingId) => {
    this.currentSettingId = settingId
  });

  handleChange = action(value => {
    this.metric = this.metricOptions.find(m => m.key === value);
    if (window.localStorage)
      window.localStorage.setItem(`advancedViewMetric:${this.props.project.id}`, value)
  });

  constructor(props) {
    super(props);
    this.metric = this.metricOptions.find(m => m.key === props.projectStore.project.currentSetting.setting.measurement)
    autorun(() => {
      const { project } = props;
      if (project && project.measurement)
        this.metric = this.metricOptions.find(metric => metric.key === project.measurement) || this.metricOptions[0]
    });

    if (window.localStorage) {
      runInAction(() => {
        try {
          const storagedSort = JSON.parse(window.localStorage.getItem(`advancedViewSort:${props.project.id}`))
          const storagedMetric = window.localStorage.getItem(`advancedViewMetric:${props.project.id}`)
          if (storagedSort) this.sortState = storagedSort
          if (storagedMetric) this.metric = this.metricOptions.find(m => m.key === storagedMetric);
        } catch (e) { }
      })
    }
    // props.projectStore.changeStopFilter(true)
    props.projectStore.changeOldfiltedModels(undefined)
  }

  render() {
    const { project } = this.props;

    return (
      <div className={styles.advancedModelResult}>
        {/* <div className={styles.metricSelection} >
          <span className={styles.text} >Measurement Metric</span>
          <Select size="large" value={this.metric.key} onChange={this.handleChange} style={{ minWidth: '80px' }}>
            {this.metricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
          </Select>
        </div> */}
        <AdvancedModelTable {...this.props} models={this.filtedModels} project={project} sortState={this.sortState} changeSort={this.changeSort} metric={this.metric} />
      </div>
    )
  }
}

export default AdvancedView

@observer
class AdvancedModelTable extends Component {

  onClickCheckbox = (modelId) => (e) => {
    this.props.project.setSelectModel(modelId);
    e.stopPropagation()
  };

  render() {
    const { models, project, metric } = this.props;
    const { problemType, selectModel } = project
    const texts = problemType === 'Classification' ?
      ['Model Name', 'F1-Score', 'Precision', 'Recall', 'LogLoss', 'Cutoff Threshold', 'KS', 'Validation', 'Holdout'] :
      ['Model Name', 'Normalized RMSE', 'RMSE', 'MSLE', 'RMSLE', 'MSE', 'MAE', 'R2', 'adjustR2', 'Validation', 'Holdout',];
    const dataSource = models.map(m => {
      if (problemType === 'Classification') {
        return <ClassificationModelRow key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} metric={metric.key} />
      } else {
        return <RegressionModleRow project={this.props.project} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} metric={metric.key} />
      }
    });
    return (
      <React.Fragment>
        <div className={styles.advancedModelTable} >
          {dataSource}
        </div>
      </React.Fragment>
    )
  }
}

@observer class RegressionModleRow extends Component {

  render() {
    const { model } = this.props;
    return (
      <div >
        <RegressionDetailCurves project={this.props.project} model={model} />
      </div>
    )
  }
}

@observer
class RegressionDetailCurves extends Component {
  state = {
    visible: false,
    diagnoseType: null
  }

  handleDiagnose = () => {
    this.setState({ visible: true });
  }

  handleDiagnoseType = e => {
    this.setState({ diagnoseType: e.target.value });
  }

  render() {
    const { model, project } = this.props;

    return (
      <div className={styles.charts}>
        <PredictVActual model={model} project={project} />
        <div className={styles.reportChart}>
          <div className={styles.chartContent}><img className={styles.img} src={model.fitPlotBase64} alt="fit plot" /></div>
        </div>
        <div className={styles.reportChart}>
          <div className={styles.chartContent}>
            <img className={styles.img} src={model.residualPlotBase64} alt="residual plot" />
          </div>
        </div>
      </div>
    )
  }
}

@observer
class ClassificationModelRow extends Component {

  render() {
    const { model } = this.props;
    if (!model.chartData) return null;
    return (
      <div >
        <DetailCurves model={model} />
      </div>
    )
  }
}

class DetailCurves extends Component {

  reset = () => {
    this.props.model.resetFitIndex();
  }
  render() {
    const { model, model: { mid } } = this.props;

    return (
      <div className={styles.charts}>
        <div className={styles.reportChart}>
          <span className={styles.chartTitle}>{EN.ROCCurves}</span>
          <div className={styles.chartContent}><RocChart height={190} width={400} className={`roc${mid}`} model={model} /></div>
        </div>
        <div className={styles.reportChart}>
          <span className={styles.chartTitle}>{EN.PredictionDistribution}</span>
          <div className={styles.chartContent}><PredictionDistribution height={190} width={400} className={`pd${mid}`} model={model} /></div>
        </div>
        <div className={styles.reportChart}>
          <span className={styles.chartTitle}>{EN.PrecisionRecallTradeoff}</span>
          <div className={styles.chartContent}><PRChart height={190} width={400} className={`precisionrecall${mid}`} model={model} /></div>
        </div>
        <div className={styles.reportChart}>
          <span className={styles.chartTitle}>{EN.LiftChart}</span>
          <div className={styles.chartContent}><LiftChart height={190} width={400} className={`lift${mid}`} model={model} /></div>
        </div>
      </div>
    )
  }
}
@observer
class PredictTable extends Component {
  @observable showCost = false
  @observable costOption = { ...this.props.project.costOption }

  onChange = e => {
    const criteria = e.target.value
    this.showCost = criteria === 'cost'
    const data = { criteria }
    if (!this.showCost) {
      const { models } = this.props
      data.selectId = ''
      // this.costOption = { TP: 0, FN: 0, FP: 0, TN: 0 }
      // data.costOption = { TP: 0, FN: 0, FP: 0, TN: 0 }
      models.forEach(m => {
        if (!m.initialFitIndex) return
        m.updateModel({ fitIndex: m.initialFitIndex })
      })
    } else {
      this.handleSubmit()
    }
    this.props.project.updateProject(data)
  }

  costInput = (row, col) => {
    const { project } = this.props
    const isCost = row !== col
    const field = (row === col ? "T" : "F") + (col === 1 ? "P" : "N")
    return <div className={styles.costTd}>
      <div className={classnames(styles.costColor, styles[`cost${row}${col}`])}></div>
      <div className={styles.costName}><span>{isCost ? EN.Cost : EN.Benefit}</span></div>
      <div className={styles.costInput}><NumberInput value={project.costOption[field]} onBlur={this.handleChange.bind(null, field)} min={0} max={100} isInt={true} /></div>
      <div className={styles.costUnits}><span>{EN.Units}</span></div>
    </div>
  }

  handleChange = (field, value) => {
    const { project } = this.props
    project.costOption[field] = value
  }

  handleSubmit = () => {
    const { project } = this.props
    const { models } = project
    const { TP, FN, FP, TN } = project.costOption
    models.forEach(m => {
      const benefit = m.getBenefit(TP, FN, FP, TN)
      if (benefit.index !== m.fitIndex) m.updateModel({ fitIndex: benefit.index })
    })
    project.updateProject({ costOption: { ...this.costOption }, selectId: '' })
  }

  render() {
    const { model, yes, no, project } = this.props;
    const { fitIndex, chartData } = model;
    const current = model
    const { TP: cTP, FN: cFN, FP: cFP, TN: cTN } = project.costOption
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
      <div className={styles.costbase}>
        <Table
          className={styles.predictTable}
          columns={column}
          bordered
          rowKey={re => {
            return re.rowName;
          }}
          dataSource={data}
          pagination={false} />
        <div className={styles.costBlock}>
          <div className={styles.costBox}>
            <div className={styles.costTable}>
              <div className={styles.costRow}>
                <div className={styles.sepCell}>
                  <div className={styles.sepText} style={{ marginLeft: 'auto' }}><span title={EN.Predicted}>{EN.Predicted}</span></div>
                  <div className={styles.sep}><span></span></div>
                  <div className={styles.sepText} style={{ marginRight: 'auto' }}><span title={EN.Actual}>{EN.Actual}</span></div>
                </div>
                <div className={classnames(styles.costCell, styles.costCellCenter)}><span title={yes}>{yes}</span></div>
                <div className={classnames(styles.costCell, styles.costCellCenter)}><span title={no}>{no}</span></div>
              </div>
              <div className={styles.costRow}>
                <div className={classnames(styles.costCell, styles.costCellSmall)}><span title={yes}>{yes}</span></div>
                <div className={styles.costCell}>{this.costInput(1, 1)}</div>
                <div className={styles.costCell}>{this.costInput(1, 0)}</div>
              </div>
              <div className={styles.costRow}>
                <div className={classnames(styles.costCell, styles.costCellSmall)}><span title={no}>{no}</span></div>
                <div className={styles.costCell}>{this.costInput(0, 1)}</div>
                <div className={styles.costCell}>{this.costInput(0, 0)}</div>
              </div>
            </div>
          </div>
          {!!(cTP || cFN || cFP || cTN) && <div className={styles.costTextBox}>
            {/* <div className={styles.costText}><span>The best benefit score based on 3616 row samples size:</span></div> */}
            <div className={styles.costText}><span>{current.getBenefit(cTP, cFN, cFP, cTN).text}</span></div>
          </div>}
          <div className={styles.costButton}>
            <button onClick={this.handleSubmit}><span>{EN.Submit}</span></button>
          </div>
        </div>
      </div>
    );
  }
}

export { PredictTable }
