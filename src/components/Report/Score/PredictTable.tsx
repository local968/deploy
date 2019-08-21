import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import styles from './AdvancedView.module.css';
import EN from '../../../constant/en';
import { formatNumber } from '../../../util';
import { Table } from 'antd';
import classnames from 'classnames'
import { NumberInput } from '../../Common';

interface Interface {
  project: any;
  models: any;
  model:any
  yes:any
  no:any
}
@observer
class PredictTable extends Component<Interface> {
  @observable showCost = false;
  @observable costOption = { ...this.props.project.costOption };
  @observable showTip = false;
  @observable distribution = this.props.project.distribution || '';
  totalLines = this.props.project.totalLines;
  onChange = e => {
    const criteria = e.target.value;
    this.showCost = criteria === 'cost';
    this.showTip = false;
    const data: any = { criteria };
    if (!this.showCost) {
      const { models } = this.props;
      data.selectId = '';
      models.forEach(m => {
        if (!m.initialFitIndex) return;
        return m.updateModel({ fitIndex: m.initialFitIndex });
      });
    } else {
      this.handleSubmit();
    }
    return this.props.project.updateProject(data);
  };

  costInput = (row, col) => {
    const { project } = this.props;
    const isCost = row !== col;
    const field = (row === col ? 'T' : 'F') + (col === 1 ? 'P' : 'N');
    return (
      <div className={styles.costTd}>
        <div
          className={classnames(styles.costColor, styles[`cost${row}${col}`])}
        />
        <div className={styles.costName}>
          <span>{isCost ? EN.Cost : EN.Benefit}</span>
        </div>
        <div className={styles.costInput}>
          <NumberInput
            value={project.costOption[field]}
            onBlur={this.handleChange.bind(null, field)}
            min={0}
            max={100}
            isInt={true}
          />
        </div>
        <div className={styles.costUnits}>
          <span>{EN.Units}</span>
        </div>
      </div>
    );
  };

  handleChange = (field, value) => {
    const { project } = this.props;
    project.costOption[field] = value;
  };

  handleSubmit = () => {
    const { project } = this.props;
    const { models } = project;
    const { targetCounts } = project;
    const { TP, FN, FP, TN } = this.costOption;
    const [v0, v1] = Object.values(targetCounts);
    const percent0 = parseFloat(formatNumber(String(v1 / (v0 + v1)), 4));
    const percentNew =
      typeof this.distribution === 'number'
        ? this.distribution / 100
        : percent0;
    models.forEach(m => {
      const benefit = m.getBenefit(TP, FN, FP, TN, percentNew, percent0);
      if (benefit.index !== m.fitIndex)
        return m.updateModel({ fitIndex: benefit.index });
    });
    return project.updateProject({
      costOption: { ...this.costOption },
      selectId: '',
      distribution: this.distribution,
    });
  };

  reset = () => {
    const { project:{targetCounts} } = this.props;
    const [v0, v1] = Object.values(targetCounts);
    const percent = parseInt(String((v1 / (v0 + v1)) * 10000), 0);
    this.distribution = percent / 100;
    this.costOption = { TP: 0, FN: 0, FP: 0, TN: 0 };
  };
  render() {
    const { project = {}, model, yes, no } = this.props;
    const { fitIndex, chartData } = model;
    let TN = chartData.roc.TN[fitIndex];
    let FP = chartData.roc.FP[fitIndex];
    let TP = chartData.roc.TP[fitIndex];
    let FN = chartData.roc.FN[fitIndex];
    const {
      selectModel: current,
      criteria,
      targetColMap,
      targetArrayTemp,
      distribution,
    } = project;
    if (!current) return null;

    const { targetCounts = {} } = project;
    const { roc = {} } = chartData;

    const Threshold = (roc.Threshold && roc.Threshold[fitIndex]) || -1;

    const tc:any = Object.values(targetCounts);
    const event = parseInt(String((tc[1] / (tc[0] + tc[1])) * 10000), 0);
    const target = project.targetArray.length
      ? project.targetArray
      : Object.keys(project.targetColMap);

    let events = target[1];

    let _target = project.renameVariable[events];
    if (_target) {
      events = _target;
    }

    const currentPerformance = current
      ? (current.score.validateScore.auc > 0.8 && EN.GOOD) ||
        (current.score.validateScore.auc > 0.6 && EN.OK) ||
        EN.NotSatisfied
      : '';
    const [v0, v1] = !targetArrayTemp.length
      ? Object.keys(targetColMap)
      : targetArrayTemp;
    const text =
      criteria === 'cost' && (TP | FN || FP || TN)
        ? EN.BenefitCost
        : EN.Recommended;
    const curBenefit = current.getBenefit(
      TP,
      FN,
      FP,
      TN,
      typeof distribution === 'number' ? distribution / 100 : event / 10000,
      event / 10000,
    );

    const column = [
      {
        title: '',
        dataIndex: 'rowName',
        className: styles.actual,
      },
      {
        title: `${EN.Predict}: ${no}`,
        dataIndex: 'col1',
      },
      {
        title: `${EN.Predict}: ${yes}`,
        dataIndex: 'col2',
      },
      {
        title: '',
        dataIndex: 'sum',
      },
    ];

    // set default value
    const data = [
      {
        rowName: `${EN.Actual}: ${no}`,
        col1: `${Math.round(TN)}(TN)`,
        col2: `${Math.round(FP)}(FP)`,
        sum: +TN + +FP,
      },
      {
        rowName: `${EN.Actual}: ${yes}`,
        col1: `${Math.round(FN)}(FN)`,
        col2: `${Math.round(TP)}(TP)`,
        sum: Number(FN) + +TP,
      },
      {
        rowName: '',
        col1: +TN + +FN,
        col2: +FP + +TP,
        sum: +TN + +FN + +FP + +TP,
      },
    ];

    console.log(data, '--------------------------', project.criteria, '123.js');

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
          pagination={false}
        />

        {project.criteria === 'cost' ? (
          <div className={styles.costBlock}>
            {/*<div className={styles.costClose} onClick={this.onHide}><span>+</span></div>*/}
            <section className={styles.newTitle}>
              <label>{EN.Input}</label>
              <dl>
                <dt>
                  <span>{EN.Basedonyourbizscenario}</span>
                  <span>
                    <span style={{ display: 'block' }}>
                      <b>{EN.A}</b>
                      {EN.Pleaseenterbenefitandcostin}
                    </span>
                  </span>
                  <span>
                    <span style={{ display: 'block' }}>
                      <b>{EN.B}</b>
                      {EN.Noteifacorrectpredictionbringsyouprofit}
                    </span>
                  </span>
                </dt>
              </dl>
              <dl style={{ margin: '0.1em 0' }}>
                <dt>
                  <div className={styles.eventInput}>
                    <span style={{ marginRight: '0.5em' }}>
                      {EN.EventDistribution}
                    </span>
                    <span>
                      {typeof this.distribution === 'number'
                        ? this.distribution
                        : event / 100}{' '}
                    </span>
                    {/*<NumberInput value={typeof this.distribution === 'number' ? this.distribution : (event / 100)} min={0.00} max={100.00} isInt={false} digits={2} cut={true} />*/}
                    <span style={{ marginLeft: '0.5em' }}>%</span>
                    {/*<span style={{ marginLeft: '10px' }}><a className={styles.reset} onClick={this.reset}>{EN.Reset}</a></span>*/}
                  </div>
                </dt>
                <div className={styles.eventButton}>
                  {/*<a*/}
                  {/*  className={styles.myButton}*/}
                  {/*  href="javascript:;" onClick={() => {*/}
                  {/*  this.showTip = true;*/}
                  {/*}*/}
                  {/*}>{EN.Tips}</a>*/}
                </div>
              </dl>
            </section>
            <div className={styles.costBox}>
              <div className={styles.costTable}>
                <div className={styles.costRow}>
                  <div className={styles.costName}>
                    <div
                      className={classnames(styles.costColor, styles.cost1)}
                    />
                    <span>{EN.Benefit}</span>
                  </div>
                  <div className={styles.costCell}>{this.costInput(1, 1)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 0)}</div>
                </div>
                <div className={styles.costRow}>
                  <div className={styles.costName}>
                    <div
                      className={classnames(styles.costColor, styles.cost2)}
                    />
                    <span>{EN.Cost}</span>
                  </div>
                  <div className={styles.costCell}>{this.costInput(1, 0)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 1)}</div>
                </div>
              </div>
            </div>
            {!!(TP || FN || FP || TN) && (
              <div className={styles.costTextBox}>
                <div>
                  <span className={styles.newStext}>
                    <b>
                      {EN.Resultbasedonthedataset}
                      {`<${
                        typeof distribution === 'number'
                          ? distribution
                          : event / 100
                      }%>`}
                      {EN.Events}
                    </b>
                  </span>
                </div>
                <div style={{ display: Threshold !== -1 ? '' : 'none' }}>
                  <span className={styles.newStext}>
                    {EN.Theoptimalthreshold}
                    {`<${formatNumber(Threshold, 3)}>`}
                  </span>
                </div>
                <div style={{ display: Threshold !== -1 ? '' : 'none' }}>
                  <span className={styles.newStext}>
                    {EN.Theoverallbenefit}
                    {`<${
                      curBenefit.benefit > Math.pow(10, 7)
                        ? curBenefit.benefit.toPrecision(3)
                        : formatNumber(curBenefit.benefit, 2)
                    }>`}
                  </span>
                </div>
                {/* <div className={styles.costText}><span>{curBenefit.text}</span></div> */}
              </div>
            )}
            {/*<div className={styles.costButton}>*/}
            {/*  <button onClick={this.handleSubmit}><span>{EN.Submit}</span></button>*/}
            {/*</div>*/}
          </div>
        ) : null}

        {/*<div className={styles.costBlock}>*/}
        {/*  <div className={styles.costBox}>*/}
        {/*    <div className={styles.costTable}>*/}
        {/*      <div className={styles.costRow}>*/}
        {/*        <div className={styles.sepCell}>*/}
        {/*          <div className={styles.sepText} style={{ marginLeft: 'auto' }}><span title={EN.Predicted}>{EN.Predicted}</span></div>*/}
        {/*          <div className={styles.sep}><span></span></div>*/}
        {/*          <div className={styles.sepText} style={{ marginRight: 'auto' }}><span title={EN.Actual}>{EN.Actual}</span></div>*/}
        {/*        </div>*/}
        {/*        <div className={classnames(styles.costCell, styles.costCellCenter)}><span title={yes}>{yes}</span></div>*/}
        {/*        <div className={classnames(styles.costCell, styles.costCellCenter)}><span title={no}>{no}</span></div>*/}
        {/*      </div>*/}
        {/*      <div className={styles.costRow}>*/}
        {/*        <div className={classnames(styles.costCell, styles.costCellSmall)}><span title={yes}>{yes}</span></div>*/}
        {/*        <div className={styles.costCell}>{this.costInput(1, 1)}</div>*/}
        {/*        <div className={styles.costCell}>{this.costInput(1, 0)}</div>*/}
        {/*      </div>*/}
        {/*      <div className={styles.costRow}>*/}
        {/*        <div className={classnames(styles.costCell, styles.costCellSmall)}><span title={no}>{no}</span></div>*/}
        {/*        <div className={styles.costCell}>{this.costInput(0, 1)}</div>*/}
        {/*        <div className={styles.costCell}>{this.costInput(0, 0)}</div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  {!!(cTP || cFN || cFP || cTN) && <div className={styles.costTextBox}>*/}
        {/*    /!* <div className={styles.costText}><span>The best benefit score based on 3616 row samples size:</span></div> *!/*/}
        {/*    <div className={styles.costText}><span>{current.getBenefit(cTP, cFN, cFP, cTN).text}</span></div>*/}
        {/*  </div>}*/}
        {/*  <div className={styles.costButton}>*/}
        {/*    <button onClick={this.handleSubmit}><span>{EN.Submit}</span></button>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    );
  }
}
export default PredictTable;
