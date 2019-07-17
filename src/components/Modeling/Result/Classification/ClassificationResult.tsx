import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Hint, NumberInput } from 'components/Common';
import { formatNumber } from '../../../../util';
import EN from '../../../../constant/en';
import ModelTable from './ModelTable'
import Performance from './Performance'
interface Interface {
  project:any
  models:any
  exportReport:any
  sort:any
  handleSort:any
}
@observer
export default class ClassificationView extends Component<Interface> {
  @observable showCost = false;
  @observable costOption = { ...this.props.project.costOption };
  @observable showTip = false;
  @observable distribution = this.props.project.distribution || '';
  totalLines = this.props.project.totalLines;

  onChange = async e => {
    const criteria = e.target.value;
    this.showCost = criteria === 'cost';
    this.showTip = false;
    const data:any = { criteria };
    if (!this.showCost) {
      const { models } = this.props;
      data.selectId = '';
      models.forEach(async m => {
        if (!m.initialFitIndex) return;
        await m.updateModel({ fitIndex: m.initialFitIndex });
      });
    } else {
      await this.handleSubmit();
    }
    return this.props.project.updateProject(data);
  };

  onSelect = model => {
    this.props.project.setSelectModel(model.id);
  };

  onHide = () => {
    this.showCost = false;
    this.showTip = false;
  };

  costInput = (row, col, defaultValue:any = false) => {
    const field = (row === col ? 'T' : 'F') + (col === 1 ? 'P' : 'N');
    const { project = {} } = this.props;
    const target = project.targetArray.length
      ? project.targetArray
      : Object.keys(project.targetColMap);
    let targetArray = defaultValue ? ['no', 'yes'] : target;
    let event = targetArray[row];
    if (project.renameVariable && project.renameVariable[event]) {
      event = project.renameVariable[event];
    }
    const correct = col === row ? EN.correctly : EN.incorrectly;
    const bool = row === col ? EN.True : EN.False;
    const posNeg = col === 1 ? EN.Positive : EN.Negative;
    return (
      <div className={styles.costTd}>
        <div className={styles.newCostTitle}>
          <p>
            {EN.Predict} {`<${event}>`} {correct}
          </p>
          <p>
            ({bool}
            {posNeg},{field})
          </p>
        </div>
        <div className={styles.costInput}>
          <NumberInput
            disabled={defaultValue}
            value={defaultValue || this.costOption[field]}
            onBlur={this.handleChange.bind(null, field)}
            min={0.0}
            max={1000000000.0}
            isInt={false}
            digits={2}
            cut={true}
          />
        </div>
        <div className={styles.costUnits}>
          <span>{EN.Units}</span>
        </div>
      </div>
    );
  };
  handleChange = (field, value) => {
    this.costOption[field] = value;
  };

  handleChangeEvent = value => {
    this.distribution = value;
  };

  handleSubmit = () => {
    const { models, project } = this.props;
    const { targetCounts } = project;
    const { TP, FN, FP, TN } = this.costOption;
    const [v0, v1] = Object.values(targetCounts);
    const percent0 = parseFloat(formatNumber(String(v1 / (v0 + v1)), 4));
    const percentNew =
      typeof this.distribution === 'number'
        ? this.distribution / 100
        : percent0;
    models.forEach(async m => {
      const benefit = m.getBenefit(TP, FN, FP, TN, percentNew, percent0);
      if (benefit.index !== m.fitIndex)
        await m.updateModel({ fitIndex: benefit.index });
    });
    return project.updateProject({
      costOption: { ...this.costOption },
      selectId: '',
      distribution: this.distribution,
    });
  };

  reset = () => {
    const { models, project } = this.props;
    const { targetCounts } = project;
    const [v0, v1] = Object.values(targetCounts);
    const percent = parseInt(String((v1 / (v0 + v1)) * 10000), 0);
    this.distribution = percent / 100;
    this.costOption = { TP: 0, FN: 0, FP: 0, TN: 0 };
    models.forEach(async m => {
      if (!m.initialFitIndex) return;
      await m.updateModel({ fitIndex: m.initialFitIndex });
    });
    return project.updateProject({
      costOption: this.costOption,
      selectId: '',
      distribution: percent / 100,
    });
  };

  render() {
    const { models, project = {}, exportReport, sort, handleSort } = this.props;
    const {
      train2Finished,
      trainModel,
      abortTrain,
      selectModel: current,
      recommendModel,
      criteria,
      costOption: { TP, FN, FP, TN },
      targetColMap,
      targetArrayTemp,
      renameVariable,
      isAbort,
      distribution,
      mapHeader,
      newVariable,
      stopIds,
    } = project;
    if (!current) return null;
    const { selectModel = {}, targetCounts = {} } = project;

    const { fitIndex = 1, chartData = {} } = selectModel;
    const { roc = {} } = chartData;

    const Threshold = (roc.Threshold && roc.Threshold[fitIndex]) || -1;

    const tc:any = Object.values(targetCounts);
    // const event = (tc[1] / (tc[0] + tc[1]) * 100).toFixed(3);
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
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];
    const text =
      criteria === 'cost' && (TP || FN || FP || TN)
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
    const newMapHeader = {
      ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}),
      ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}),
    };
    return (
      <div>
        <div className={styles.result}>
          <div className={styles.box}>
            <div className={styles.title}>
              <span>{EN.RecommendedAModel}</span>
            </div>
            <div className={styles.row}>
              <span>{EN.ModelingResult} : </span>
              <div className={styles.status}>
                &nbsp;&nbsp;{currentPerformance}
              </div>
            </div>
            <div className={styles.row}>
              <span>
                {EN.SelectedModel} :
                <a className={styles.nohover}>&nbsp;{current.modelName}</a>
              </span>
            </div>
            <div className={styles.row}>
              <span>
                {EN.Target} :
                <a className={styles.nohover}>
                  &nbsp;{mapHeader[project.target]}
                </a>
              </span>
            </div>
          </div>
          <Performance current={current} yes={yes} no={no} />
        </div>
        <div className={styles.line} />
        <div className={styles.selectBlock}>
          <div className={styles.selectText}>
            <span> {EN.Selectyourmodelbasedonyourown}</span>
          </div>
          <div className={styles.radioGroup}>
            <div className={styles.radio}>
              <input
                type="radio"
                name="criteria"
                value="default"
                id="criteria_default"
                readOnly
                onClick={this.onChange}
                checked={criteria === 'default'}
              />
              <label htmlFor="criteria_default">
                {EN.R2LearnsDefaultSelection}
              </label>
            </div>
            <div className={styles.radio}>
              <input
                type="radio"
                name="criteria"
                value="cost"
                id="criteria_cost"
                readOnly
                onClick={this.onChange}
                checked={criteria === 'cost'}
              />
              <label htmlFor="criteria_cost">
                {EN.BenefitCost}
                <Hint content={EN.Ifyoucanestimatethebusiness} />
              </label>
            </div>
            {this.showCost && (
              <div className={styles.costBlock}>
                <div className={styles.costClose} onClick={this.onHide}>
                  <span>+</span>
                </div>
                <section className={styles.newTitle}>
                  <label>{EN.Input}</label>
                  <dl>
                    <dt className={styles.newTitleDt}>
                      <p>{EN.Basedonyourbizscenario}</p>
                      <p><b>{EN.A}</b>
                        {EN.Pleaseenterbenefitandcostin}</p>
                      <p><b>{EN.B}</b>
                        {EN.Pleaseenterbenefitandcostins}</p>
                      <p><span style={{ color: '#f5a623', fontStyle: 'italic' }}>
                        {EN.Noteifacorrectpredictionbringsyouprofit}
                      </span></p>
                    </dt>
                    {/*<dt>*/}
                    {/*  <span>{EN.Basedonyourbizscenario}</span>*/}
                    {/*  <span><span style={{ display: 'block' }}><b>{EN.A}</b>{EN.Pleaseenterbenefitandcostin}</span></span>*/}
                    {/*  <span><span style={{ display: 'block' }}><b>{EN.B}</b>{EN.Noteifacorrectpredictionbringsyouprofit}</span></span>*/}
                    {/*</dt>*/}
                  </dl>
                  <dl style={{ margin: '0.1em 0' }}>
                    <dt>
                      <div className={styles.eventInput}>
                        <span style={{ marginRight: '0.5em' }}>
                          {EN.EventDistribution}
                        </span>
                        <NumberInput
                          value={
                            typeof this.distribution === 'number'
                              ? this.distribution
                              : event / 100
                          }
                          onBlur={this.handleChangeEvent}
                          min={0.0}
                          max={100.0}
                          isInt={false}
                          digits={2}
                          cut={true}
                        />
                        <span style={{ marginLeft: '0.5em' }}>%</span>
                        <span style={{ marginLeft: '10px' }}>
                          <a className={styles.reset} onClick={this.reset}>
                            {EN.Reset}
                          </a>
                        </span>
                      </div>
                    </dt>
                    <div className={styles.eventButton}>
                      <a
                        className={styles.myButton}
                        href="javascript:"
                        onClick={() => {
                          this.showTip = true;
                        }}
                      >
                        {EN.Tips}
                      </a>
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
                      <div className={styles.costCell}>
                        {this.costInput(1, 1)}
                      </div>
                      <div className={styles.costCell}>
                        {this.costInput(0, 0)}
                      </div>
                    </div>
                    <div className={styles.costRow}>
                      <div className={styles.costName}>
                        <div
                          className={classnames(styles.costColor, styles.cost2)}
                        />
                        <span>{EN.Cost}</span>
                      </div>
                      <div className={styles.costCell}>
                        {this.costInput(1, 0)}
                      </div>
                      <div className={styles.costCell}>
                        {this.costInput(0, 1)}
                      </div>
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
                <div className={styles.costButton}>
                  <button onClick={this.handleSubmit}>
                    <span>{EN.Submit}</span>
                  </button>
                </div>
              </div>
            )}
            {this.showTip && (
              <div className={styles.costBlock}>
                <a
                  href="javascript:"
                  style={{
                    marginBottom: 5,
                  }}
                  onClick={() => {
                    this.showTip = false;
                  }}
                  className={styles.myButton}
                >
                  {EN.Return}
                </a>
                <section className={styles.newTitle}>
                  <label>{EN.Input}</label>
                  <dl>
                    <dt
                      className={styles.newTitleDt}
                      style={{ fontSize: '12px', display: 'block !important'}}
                    >
                      <p><b>{EN.A}</b>
                        {EN.Boththebenefitandcost}</p>
                      <p><b>{EN.B}</b>
                        {EN.Eventdistributioninputranges}</p>
                      <p><span style={{ color: '#f5a623', fontStyle: 'italic' }}>
                        {EN.NoteAllinputsentered}
                      </span></p>
                    </dt>
                    {/*<dt>*/}
                    {/*  <span><span style={{ display: 'block' }}><b>{EN.A}</b>{EN.Boththebenefitandcost}</span></span>*/}
                    {/*  <span><span style={{ display: 'block' }}><b>{EN.B}</b>{EN.Eventdistributioninputranges}</span></span>*/}
                    {/*  <span style={{ color: '#f5a623', fontStyle: 'italic' }}>{EN.NoteAllinputsentered}</span>*/}
                    {/*</dt>*/}
                  </dl>
                  <label>{EN.BenefitCost}</label>
                  <dl>
                    <dt>
                      <span>
                        {EN.Benefitcostiscalculated}
                        (r<sub>modified</sub>/r<sub>0</sub>)*({EN.Benefits}*TP–
                        {EN.Costs}*FN)+(1-r<sub>modified</sub>) /(1-r
                        <sub>0</sub>)*({EN.Benefits}*TN–{EN.Costs}*FP);
                        {EN.TPTruePositiveTNTrueNegative}
                      </span>
                    </dt>
                    {/*<dt>*/}
                    {/*  <span>{EN.Benefitcostiscalculated}</span>*/}
                    {/*  <span><span style={{ display: 'block' }}>(r<sub>modified</sub>/r<sub>0</sub>)*({EN.Benefits}*TP–{EN.Costs}*FN)+(1-r<sub>modified</sub>) /(1-r<sub>0</sub>)*({EN.Benefits}*TN–{EN.Costs}*FP);</span></span>*/}
                    {/*  <span>{EN.TPTruePositiveTNTrueNegative}</span>*/}
                    {/*</dt>*/}
                  </dl>
                  <label>{EN.EventDistribution}</label>
                  <dl>
                    <dt>
                      <span>
                        {EN.Eventdistributionistheproportion}r<sub>0</sub>
                        {EN.Isthedefaulteventdistribution}r<sub>modified</sub>
                        {EN.Istheuserprovideddistribution}
                      </span>
                    </dt>
                  </dl>
                  <label>{EN.Example}</label>
                  <dl>
                    <dt>
                      <span>{EN.Inthisloandefaultexample}</span>
                    </dt>
                  </dl>
                  <ul>
                    <li>{EN.Acorrectpredictionof}</li>
                    <li>{EN.Acorrectpredictionofnondefault}</li>
                    <li>{EN.Anincorrectpredictionofthedefault}</li>
                    <li>{EN.Andanincorrectpredictionofthenondefault}</li>
                    <li>{EN.Thedistributionof}</li>
                  </ul>
                  <p>{EN.Youcaninputthisinformationinto}</p>
                </section>
                <section className={styles.newTitle}>
                  <dl style={{ margin: '0.1em 0' }}>
                    <dt>
                      <div className={styles.eventInput}>
                        <span style={{ marginRight: '0.5em' }}>
                          {EN.EventDistribution}
                        </span>
                        <input value={20} onChange={null} />
                        <span style={{ marginLeft: '0.5em' }}>%</span>
                      </div>
                    </dt>
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
                      <div className={styles.costCell}>
                        {this.costInput(1, 1, 200)}
                      </div>
                      <div className={styles.costCell}>
                        {this.costInput(0, 0, 100)}
                      </div>
                    </div>
                    <div className={styles.costRow}>
                      <div className={styles.costName}>
                        <div
                          className={classnames(styles.costColor, styles.cost2)}
                        />
                        <span>{EN.Cost}</span>
                      </div>
                      <div className={styles.costCell}>
                        {this.costInput(1, 0, 200)}
                      </div>
                      <div className={styles.costCell}>
                        {this.costInput(0, 1, 100)}
                      </div>
                    </div>
                  </div>
                </div>
                <p>
                  {EN.R2Learnthenautomaticallyfinds}
                  {EN.Thatmaximizethebenefit}
                </p>
                <p>{EN.Currentbenefitcostequals}</p>
                <p>
                  (0.2/0.1)*(200*2000(TP) –
                  200*100(FN))+(0.8/0.9)*(100*10000(TN)-100*200(FP)) =
                  11631111.11
                </p>
                {/*{!!(TP || FN || FP || TN) && <div className={styles.costTextBox}>*/}
                {/*<div><span className={styles.newStext}>Result based on the data set of {`<${this.totalLines}>`} records with a distribution of {`<${event.toFixed(3)}%>`} events.: </span></div>*/}
                {/*<div><span className={styles.newStext}>The optimal threshold:{`<${current.accValidation.toFixed(3)}>`}</span></div>*/}
                {/*<div className={styles.costText}><span>{current.getBenefit(TP, FN, FP, TN).text}</span></div>*/}
                {/*</div>}*/}
              </div>
            )}
          </div>
        </div>
        <ModelTable
          models={models}
          current={current}
          onSelect={this.onSelect}
          train2Finished={train2Finished}
          trainModel={trainModel}
          abortTrain={abortTrain}
          isAbort={isAbort}
          project={project}
          exportReport={exportReport}
          recommendId={recommendModel.id}
          text={text}
          sort={sort}
          handleSort={handleSort}
          mapHeader={newMapHeader}
          stopIds={stopIds}
        />
      </div>
    );
  }
}
