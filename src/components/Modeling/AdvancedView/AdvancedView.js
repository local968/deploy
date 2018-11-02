import React, { Component } from 'react';
import classnames from 'classnames';
import { Table, Tabs, Modal, Select } from 'antd';
import { observer } from 'mobx-react';
import styles from './AdvancedView.module.less';
import RocChart from 'components/D3Chart/RocChart';
import PRChart from 'components/D3Chart/PRChart';
import PredictionDistribution from 'components/D3Chart/PredictionDistribution';
import LiftChart from 'components/D3Chart/LiftChart';
import SpeedAndAcc from 'components/D3Chart/SpeedAndAcc';
import modelComp from './Btn-ModelComparison-normal.svg';
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

import { VariableImpact } from '../Result';

const TabPane = Tabs.TabPane;

@observer
export default class AdvancedView extends Component {
  componentWillMount() {
    if (this.props.project.problemType === 'Classification') {
      this.props.project.chartData();
    } else {
      this.props.project.fitPlotAndResidualPlot();
    }
  }

  render() {
    const { models, project } = this.props;
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.row}>
          <div className={styles.modelResult} >
            Modeling Results :{' '}
            <div className={styles.status}>&nbsp;&nbsp;OK</div>
          </div>
          {project.problemType === 'Classification' && <div className={styles.modelComp} >
            <ModelComp models={models} />
          </div>}
        </div>
        <AdvancedModelTable models={models} project={project} />
      </div>
    )
  }
}

@observer
class AdvancedModelTable extends Component {
  constructor(props) {
    super(props);
    const { project: { problemType, measurement } } = props;
    const metricOptions = problemType === 'Classification' ? [{
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
    this.state = {
      metric: metricOptions.find(metric => metric.key === measurement) || metricOptions[0],
      metricOptions
    }
  }
  handleChange = value => {
    const metric = this.state.metricOptions.find(m => m.key === value);
    this.setState({ metric: metric })
  }
  render() {
    const { models, project: { problemType } } = this.props;
    const { metric, metricOptions } = this.state;
    const texts = problemType === 'Classification' ?
      ['Model Name', 'F1-Score', 'Precision', 'Recall', 'Cutoff Threshold', 'Validation', 'Holdout'] :
      ['Model Name', 'RMSE', 'MSE', 'MAE', 'R2', 'Validation', 'Holdout']
    const header = (
      <Row>
        {texts.map(t => {
          return (
            <RowCell data={t} key={t} />
          )
        })}
      </Row>
    )
    const dataSource = models.map(m => {
      if (problemType === 'Classification') {
        return (
          <ClassificationModelRow key={m.id} texts={texts} model={m} metric={metric.key} />
        )
      } else {
        return <RegressionModleRow key={m.id} texts={texts} model={m} metric={metric.key} />
      }
    })
    const Option = Select.Option;
    return (
      <div className={styles.advancedModelTable} >
        <div className={styles.metricSelection} >
          <span className={styles.text} >Measurement Metric</span>
          <Select size="large" value={metric.display} onChange={this.handleChange} >
            {metricOptions.map(mo => <Option value={mo.key} key={mo.key} >{mo.display}</Option>)}
          </Select>
        </div>
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
    const { model, texts, metric } = this.props;
    const { score, name } = model;
    const { detail } = this.state;
    return (
      <div >
        <Row onClick={this.handleResult} >
          {texts.map(t => {
            switch (t) {
              case 'Model Name':
                return (
                  <RowCell key={1} data={<div key={1} >
                    <span className={styles.modelName} >{name}</span>
                  </div>}
                  />
                )
              case 'RMSE':
                return <RowCell key={2} data={score.validateScore.rmse} />;
              case 'MSE':
                return <RowCell key={3} data={score.validateScore.mse} />;
              case 'MAE':
                return <RowCell key={4} data={score.validateScore.mae} />;
              case 'R2':
                return <RowCell key={5} data={score.validateScore.r2} />;
              case 'Validation':
                return <RowCell key={6} data={score.validateScore[metric]} />;
              case 'Holdout':
                return <RowCell key={7} data={score.holdoutScore[metric]} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <RegressionDetailCurves model={model} />}
      </div>
    )
  }
}

@observer
class RegressionDetailCurves extends Component {
  state = {
    curve: "Variable Impact"
  }

  handleClick = val => {
    this.setState({ curve: val });
  }

  render() {
    const { model } = this.props;
    const { curve } = this.state;
    let curComponent;
    switch (curve) {
      case 'Variable Impact':
        curComponent = <div style={{ fontSize: 60 }} ><VariableImpact model={model} /></div>
        break;
      case 'Fit Plot':
        curComponent = (
          <div className={styles.plot} >
            <img className={styles.img} src={model.fitPlot} alt="fit plot" />
          </div>
        )
        break;
      case 'Residual Plot':
        curComponent = (
          <div className={styles.plot} >
            <img className={styles.img} src={model.residualPlot} alt="residual plot" />
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
    const { model, texts, metric } = this.props;
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
                    {/* <span onClick={this.handleClick} >
                      <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    </span> */}
                    <span className={styles.modelName} >{name}</span>
                  </div>}
                  />
                )
              case 'F1-Score':
                return <RowCell key={2} data={roc.F1[fitIndex]} />;
              case 'Precision':
                return <RowCell key={3} data={roc.Precision[fitIndex]} />;
              case 'Recall':
                return <RowCell key={4} data={roc.Recall[fitIndex]} />;
              case 'Cutoff Threshold':
                return <RowCell key={5} data={roc.Threshold[fitIndex]} />;
              case 'Validation':
                return <RowCell key={6} data={score.validateScore[metric]} />;
              case 'Holdout':
                return <RowCell key={7} data={score.holdoutScore[metric]} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <DetailCurves model={model} />}
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
  render() {
    const { model, model: { id } } = this.props;
    const { curve } = this.state;
    let curComponent;
    switch (this.state.curve) {
      case 'ROC Curve':
        curComponent = <RocChart height={190} width={500} className={`roc${id}`} model={model} />
        break;
      case 'Prediction Distribution':
        curComponent = <PredictionDistribution height={190} width={500} className={`roc${id}`} model={model} />
        break;
      case 'Precision Recall Tradeoff':
        curComponent = <PRChart height={190} width={500} className={`precisionrecall${id}`} model={model} />
        break;
      case 'Lift Chart':
        curComponent = <LiftChart height={190} width={500} className={`lift${id}`} model={model} />;
        break;
      case 'Variable Impact':
        curComponent = <div style={{ fontSize: 50 }} ><VariableImpact model={model} /></div>
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
    }];
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} >
          <div className={styles.thumbnails} >
            {thumbnails.map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
          </div>
          <PredictTable model={model} />
        </div>
        <div className={styles.rightPanel} >
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

    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={(typeof data === 'string' || typeof data === 'number') ? data : null}
      >
        {other ? <span className={styles.hasotherCell} >{data}</span> : data}
        {other}
      </div>
    );
  }
}


@observer
class PredictTable extends Component {
  render() {
    const { model } = this.props;
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
      title: 'Predict: Yes',
      dataIndex: 'col1'
    }, {
      title: 'Predict: No',
      dataIndex: 'col2',
    }, {
      title: '',
      dataIndex: 'sum'
    }];

    // set default value

    const data = [{
      rowName: 'Actual: Yes',
      col2: `${Math.round(FN)}(FN)`,
      col1: `${Math.round(TP)}(TP)`,
      sum: Number(FN) + +TP
    }, {
      rowName: 'Actual: No',
      col2: `${Math.round(TN)}(TN)`,
      col1: `${Math.round(FP)}(FP)`,
      sum: +TN + +FP,
    }, {
      rowName: '',
      col2: +TN + +FN,
      col1: +FP + +TP,
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
        <img
          onClick={this.handleClick}
          src={modelComp}
          alt="comp" />
        <Modal
          width={1000}
          visible={this.state.modelCompVisible}
          onCancel={this.handleCancel}>
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
