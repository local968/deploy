import React, { Component } from 'react';
import classnames from 'classnames';
import { Table, Tabs, Modal } from 'antd';
import { observer } from 'mobx-react';
import styles from './AdvancedView.module.less';
import RocChart from '../../D3Chart/RocChart';
import PRChart from '../../D3Chart/PRChart';
import PredictionDistribution from '../../D3Chart/PredictionDistribution';
import LiftChart from '../../D3Chart/LiftChart';
import SpeedAndAcc from '../../D3Chart/SpeedAndAcc';
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
import rocSelected from './icon-roc-curve-selected.svg';
import precisionRecallSelected from './icon-precision-recall-tradeoff-selected.svg';
import predictionDistributionSelected from './icon-prediction-distribution-selected.svg';

const TabPane = Tabs.TabPane;

export default class AdvancedView extends Component {
  render() {
    const { models, project } = this.props;
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.row}>
          <div className={styles.modelResult} >
            Modeling Results :{' '}
            <div className={styles.status}>&nbsp;&nbsp;OK</div>
          </div>
          <div className={styles.modelComp} >
            <ModelComp models={models} />
          </div>
        </div>
        <AdvancedModelTable models={models} project={project} />
      </div>
    )
  }
}

class AdvancedModelTable extends Component {
  render() {
    const { models, project } = this.props;
    const texts = ['Model Name', 'F1-Score', 'Precision', 'Recall', 'Cutoff Threshold'];
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
      return (
        <ModelRow key={m.id} texts={texts} model={m} />
      )
    })
    return (
      <div className={styles.advancedModelTable} >
        {header}
        {dataSource}
      </div>
    )
  }
}

@observer
class ModelRow extends Component {
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
    const { model, texts, checked } = this.props;
    const { id, fitIndex, chartData: { roc } } = model;
    const { detail } = this.state;
    return (
      <div onClick={this.handleResult} >
        <Row >
          {texts.map(t => {
            switch (t) {
              case 'Model Name':
                return (
                  <RowCell key={1} data={<div key={1} >
                    {/* <span onClick={this.handleClick} >
                      <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    </span> */}
                    <span className={styles.modelName} >{id}</span>
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
    curve: "roc"
  }
  handleClick = val => {
    this.setState({ curve: val });
  }
  render() {
    const { model, model: { id } } = this.props;
    const { curve } = this.state;
    let curComponent;
    switch (this.state.curve) {
      case 'roc':
        curComponent = <RocChart height={190} width={500} className={`roc${id}`} model={model} />
        break;
      case 'pd':
        curComponent = <PredictionDistribution height={190} width={500} className={`roc${id}`} model={model} />
        break;
      case 'prt':
        curComponent = <PRChart height={190} width={500} className={`precisionrecall${id}`} model={model} />
        break;
      case 'lift':
        curComponent = <LiftChart height={190} width={500} className={`lift${id}`} model={model} />;
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
    }];
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} >
          <div className={styles.thumbnails} >
            <Thumbnail curSelected={curve} thumbnail={thumbnails[0]} onClick={this.handleClick} value="roc" />
            <Thumbnail curSelected={curve} thumbnail={thumbnails[1]} onClick={this.handleClick} value="pd" />
            <Thumbnail curSelected={curve} thumbnail={thumbnails[2]} onClick={this.handleClick} value="prt" />
            <Thumbnail curSelected={curve} thumbnail={thumbnails[3]} onClick={this.handleClick} value="lift" />
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
        <img src={icon} />
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
    this.setState({modelCompVisible: true});
  }
  handleCancel = () => {
    this.setState({modelCompVisible: false});
  }
  render() {
    const {models} = this.props;
    return (
      <div className={styles.modelComp}>
        <img
          onClick={this.handleClick}
          src={modelComp} />
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
