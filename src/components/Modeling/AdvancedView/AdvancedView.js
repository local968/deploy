import React, { Component } from 'react';
import classnames from 'classnames';
import { Table } from 'antd';
import { observer } from 'mobx-react';
import styles from './AdvancedView.module.less';
import RocChart from '../../D3Chart/RocChart';
import PRChart from '../../D3Chart/PRChart';
import PredictionDistribution from '../../D3Chart/PredictionDistribution';
import LiftChart from '../../D3Chart/LiftChart';

export default class AdvancedView extends Component {
  render() {
    const { models, project } = this.props;
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.row}>
          <span>
            Modeling Results :{' '}
            <div className={styles.status}>&nbsp;&nbsp;OK</div>
          </span>
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
  handleClick = e => {
    e.stopPropagation();
    this.setState({ curve: e.target.value });
  }
  render() {
    const { model, model: {id} } = this.props;
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
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} >
          <div>
            <button onClick={this.handleClick} value="roc" >Roc Curve</button>
            <button onClick={this.handleClick} value="pd" >Prediction Distribution</button>
            <button onClick={this.handleClick} value="prt" >Precision Recall Tradeoff</button>
            <button onClick={this.handleClick} value="lift" >Lift Chart</button>
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
  render () {
    const {model} = this.props;
    const {fitIndex, chartData} = model;
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
      col1: `${Math.round(FP)}(FP)` ,
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

