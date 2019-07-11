import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Progress, Tooltip, Icon } from 'antd';
import { observable, computed } from 'mobx';
import moment from 'moment';
import { Hint, NumberInput, ProgressBar} from 'components/Common';
import VariableImpact from "./VariableImpact"
import Variable from './Variable.svg'
import Process from './Process.svg'
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import MPF from './MPF';
const AccuracyHint = EN.Givenaparticularpopulation

@observer
export default class ClassificationView extends Component {
  @observable showCost = false
  @observable costOption = { ...this.props.project.costOption }
  @observable showTip = false;
  @observable distribution = this.props.project.distribution || ''
  totalLines = this.props.project.totalLines;

  onChange = e => {
    const criteria = e.target.value;
    this.showCost = criteria === 'cost';
    this.showTip = false;
    const data = { criteria };
    if (!this.showCost) {
      const { models } = this.props;
      data.selectId = '';
      models.forEach(m => {
        if (!m.initialFitIndex) return
        m.updateModel({ fitIndex: m.initialFitIndex })
      })
    } else {
      this.handleSubmit()
    }
    this.props.project.updateProject(data);
  };

  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };

  onHide = () => {
    this.showCost = false;
    this.showTip = false;
  };

  costInput = (row, col, defaultValue = false) => {
    const field = (row === col ? "T" : "F") + (col === 1 ? "P" : "N");
    const { project = {} } = this.props;
    const target = project.targetArray.length ? project.targetArray : Object.keys(project.targetColMap);
    let targetArray = defaultValue ? ['no', 'yes'] : target;
    let event = targetArray[row];
    if (project.renameVariable && project.renameVariable[event]) {
      event = project.renameVariable[event]
    }
    const correct = col === row ? EN.correctly : EN.incorrectly;
    const bool = row === col ? EN.True : EN.False;
    const posNeg = col === 1 ? EN.Positive : EN.Negative;
    return <div className={styles.costTd}>
      <div className={styles.newCostTitle}>
        <p>{EN.Predict} {`<${event}>`} {correct}</p>
        <p>({bool}{posNeg},{field})</p>
      </div>
      <div className={styles.costInput}><NumberInput disabled={defaultValue} value={defaultValue || this.costOption[field]} onBlur={this.handleChange.bind(null, field)} min={0.00} max={1000000000.00} isInt={false} digits={2} cut={true} /></div>
      <div className={styles.costUnits}><span>{EN.Units}</span></div>
    </div>;
  };
  handleChange = (field, value) => {
    this.costOption[field] = value
  };

  handleChangeEvent = value => {
    this.distribution = value
    // const { project, models } = this.props;
    // const { targetCounts, distribution } = project
    // if (distribution === value) return
    // const { TP, FN, FP, TN } = this.costOption;
    // const [v0, v1] = Object.values(targetCounts)
    // const percent0 = parseFloat(formatNumber(v1 / (v0 + v1), 4))
    // const percentNew = distribution ? distribution / 100 : percent0
    // models.forEach(m => {
    //   const benefit = m.getBenefit(TP, FN, FP, TN, percentNew, percent0)
    //   if (benefit.index !== m.fitIndex) m.updateModel({ fitIndex: benefit.index })
    // })
    // project.updateProject({ distribution: value })
  }

  handleSubmit = () => {
    const { models, project } = this.props;
    const { targetCounts } = project
    const { TP, FN, FP, TN } = this.costOption;
    const [v0, v1] = Object.values(targetCounts)
    const percent0 = parseFloat(formatNumber(v1 / (v0 + v1), 4))
    const percentNew = typeof this.distribution === 'number' ? this.distribution / 100 : percent0
    models.forEach(m => {
      const benefit = m.getBenefit(TP, FN, FP, TN, percentNew, percent0)
      if (benefit.index !== m.fitIndex) m.updateModel({ fitIndex: benefit.index })
    })
    project.updateProject({ costOption: { ...this.costOption }, selectId: '', distribution: this.distribution })
  }

  reset = () => {
    const { models, project } = this.props;
    const { targetCounts } = project
    const [v0, v1] = Object.values(targetCounts)
    const percent = parseInt(v1 / (v0 + v1) * 10000, 0)
    this.distribution = percent / 100
    this.costOption = { TP: 0, FN: 0, FP: 0, TN: 0 }
    models.forEach(m => {
      if (!m.initialFitIndex) return
      m.updateModel({ fitIndex: m.initialFitIndex })
    })
    project.updateProject({ costOption: this.costOption, selectId: '', distribution: percent / 100 })
  }

  render() {
    const { models, project = {}, exportReport, sort, handleSort } = this.props;
    const { train2Finished, trainModel, abortTrain, selectModel: current, recommendModel, criteria, costOption: { TP, FN, FP, TN }, targetColMap, targetArrayTemp, renameVariable, isAbort, distribution, mapHeader, newVariable } = project;
    if (!current) return null;
    const { selectModel = {}, targetCounts = {} } = project;

    const { fitIndex = 1, chartData = {} } = selectModel;
    const { roc = {} } = chartData;

    const Threshold = roc.Threshold && roc.Threshold[fitIndex] || -1;

    const tc = Object.values(targetCounts);
    // const event = (tc[1] / (tc[0] + tc[1]) * 100).toFixed(3);
    const event = parseInt(tc[1] / (tc[0] + tc[1]) * 10000, 0)
    const target = project.targetArray.length ? project.targetArray : Object.keys(project.targetColMap);

    let events = target[1];

    let _target = project.renameVariable[events];
    if (_target) {
      events = _target;
    }

    const currentPerformance = current ? (current.score.validateScore.auc > 0.8 && EN.GOOD) || (current.score.validateScore.auc > 0.6 && EN.OK) || EN.NotSatisfied : '';
    const [v0, v1] = !targetArrayTemp.length ? Object.keys(targetColMap) : targetArrayTemp;
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];
    const text = (criteria === 'cost' && (TP | FN || FP || TN)) ? EN.BenefitCost : EN.Recommended;
    const curBenefit = current.getBenefit(TP, FN, FP, TN, typeof distribution === 'number' ? (distribution / 100) : (event / 10000), event / 10000)
    const newMapHeader = { ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}), ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}) }
    return <div>
      <div className={styles.result}>
        <div className={styles.box}>
          <div className={styles.title}>
            <span>{EN.RecommendedAModel}</span>
          </div>
          <div className={styles.row}>
            <span>{EN.ModelingResult} :{' '}</span>
            <div className={styles.status}>&nbsp;&nbsp;{currentPerformance}</div>
          </div>
          <div className={styles.row}>
            <span>{EN.SelectedModel} :<a className={styles.nohover}>&nbsp;{current.modelName}</a></span>
          </div>
          <div className={styles.row}>
            <span>{EN.Target} :<a className={styles.nohover}>&nbsp;{mapHeader[project.target]}</a></span>
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
            <input type="radio" name="criteria" value='default' id='criteria_default' readOnly onClick={this.onChange} checked={criteria === 'default'} />
            <label htmlFor='criteria_default'>{EN.R2LearnsDefaultSelection}</label>
          </div>
          <div className={styles.radio}>
            <input type="radio" name="criteria" value='cost' id='criteria_cost' readOnly onClick={this.onChange} checked={criteria === 'cost'} />
            <label htmlFor='criteria_cost'>{EN.BenefitCost}<Hint content={EN.Ifyoucanestimatethebusiness} /></label>
          </div>
          {this.showCost && <div className={styles.costBlock}>
            <div className={styles.costClose} onClick={this.onHide}><span>+</span></div>
            <section className={styles.newTitle}>
              <label>{EN.Input}</label>
              <dl>
                <dt>
                  <span>{EN.Basedonyourbizscenario}
                  <b>{EN.A}</b>{EN.Pleaseenterbenefitandcostin}
                  <b>{EN.B}</b>{EN.Noteifacorrectpredictionbringsyouprofit}
                  </span>
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
                    <span style={{ marginRight: '0.5em' }}>{EN.EventDistribution}</span>
                    <NumberInput value={typeof this.distribution === 'number' ? this.distribution : (event / 100)} onBlur={this.handleChangeEvent} min={0.00} max={100.00} isInt={false} digits={2} cut={true} />
                    <span style={{ marginLeft: '0.5em' }}>%</span>
                    <span style={{ marginLeft: '10px' }}><a className={styles.reset} onClick={this.reset}>{EN.Reset}</a></span>
                  </div>
                </dt>
                <div className={styles.eventButton}>
                  <a
                    className={styles.myButton}
                    href="javascript:;" onClick={() => {
                      this.showTip = true;
                    }
                    }>{EN.Tips}</a>
                </div>
              </dl>
            </section>
            <div className={styles.costBox}>
              <div className={styles.costTable}>
                <div className={styles.costRow}>
                  <div className={styles.costName}>
                    <div className={classnames(styles.costColor, styles.cost1)} />
                    <span>{EN.Benefit}</span>
                  </div>
                  <div className={styles.costCell}>{this.costInput(1, 1)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 0)}</div>
                </div>
                <div className={styles.costRow}>
                  <div className={styles.costName}>
                    <div className={classnames(styles.costColor, styles.cost2)} />
                    <span>{EN.Cost}</span>
                  </div>
                  <div className={styles.costCell}>{this.costInput(1, 0)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 1)}</div>
                </div>
              </div>
            </div>
            {!!(TP || FN || FP || TN) && <div className={styles.costTextBox}>
              <div><span className={styles.newStext}><b>{EN.Resultbasedonthedataset}{`<${typeof distribution === 'number' ? distribution : (event / 100)}%>`}{EN.Events}</b></span></div>
              <div style={{ display: (Threshold !== -1 ? '' : 'none') }}><span className={styles.newStext}>{EN.Theoptimalthreshold}{`<${formatNumber(Threshold, 3)}>`}</span></div>
              <div style={{ display: (Threshold !== -1 ? '' : 'none') }}><span className={styles.newStext}>{EN.Theoverallbenefit}{`<${curBenefit.benefit > Math.pow(10, 7) ? curBenefit.benefit.toPrecision(3) : formatNumber(curBenefit.benefit, 2)}>`}</span></div>
              {/* <div className={styles.costText}><span>{curBenefit.text}</span></div> */}
            </div>}
            <div className={styles.costButton}>
              <button onClick={this.handleSubmit}><span>{EN.Submit}</span></button>
            </div>
          </div>}
          {this.showTip && <div className={styles.costBlock}>
            <a href="javascript:;"
              style={{
                marginBottom: 5,
              }}
              onClick={() => {
                this.showTip = false;
              }}
              className={styles.myButton}
            >{EN.Return}</a>
            <section className={styles.newTitle}>
              <label>{EN.Input}</label>
              <dl>
                <dt>
                  <span><span style={{ display: 'block' }}><b>{EN.A}</b>{EN.Boththebenefitandcost}</span></span>
                  <span><span style={{ display: 'block' }}><b>{EN.B}</b>{EN.Eventdistributioninputranges}</span></span>
                  <span style={{ color: '#f5a623', fontStyle: 'italic' }}>{EN.NoteAllinputsentered}</span>
                </dt>
              </dl>
              <label>{EN.BenefitCost}</label>
              <dl>
                <dt>
                  <span>{EN.Benefitcostiscalculated}</span>
                  <span><span style={{ display: 'block' }}>(r<sub>modified</sub>/r<sub>0</sub>)*({EN.Benefits}*TP–{EN.Costs}*FN)+(1-r<sub>modified</sub>) /(1-r<sub>0</sub>)*({EN.Benefits}*TN–{EN.Costs}*FP);</span></span>
                  <span>{EN.TPTruePositiveTNTrueNegative}</span>
                </dt>
              </dl>
              <label>{EN.EventDistribution}</label>
              <dl>
                <dt>
                  <span>{EN.Eventdistributionistheproportion}r<sub>0</sub>{EN.Isthedefaulteventdistribution}r<sub>modified</sub>{EN.Istheuserprovideddistribution}</span>
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
                    <span style={{ marginRight: '0.5em' }}>{EN.EventDistribution}</span>
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
                    <div className={classnames(styles.costColor, styles.cost1)} />
                    <span>{EN.Benefit}</span>
                  </div>
                  <div className={styles.costCell}>{this.costInput(1, 1, 200)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 0, 100)}</div>
                </div>
                <div className={styles.costRow}>
                  <div className={styles.costName}>
                    <div className={classnames(styles.costColor, styles.cost2)} />
                    <span>{EN.Cost}</span>
                  </div>
                  <div className={styles.costCell}>{this.costInput(1, 0, 200)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 1, 100)}</div>
                </div>
              </div>
            </div>
            <p>{EN.R2Learnthenautomaticallyfinds}{EN.Thatmaximizethebenefit}</p>
            <p>{EN.Currentbenefitcostequals}</p>
            <p>(0.2/0.1)*(200*2000(TP) – 200*100(FN))+(0.8/0.9)*(100*10000(TN)-100*200(FP)) = 11631111.11</p>
            {/*{!!(TP || FN || FP || TN) && <div className={styles.costTextBox}>*/}
            {/*<div><span className={styles.newStext}>Result based on the data set of {`<${this.totalLines}>`} records with a distribution of {`<${event.toFixed(3)}%>`} events.: </span></div>*/}
            {/*<div><span className={styles.newStext}>The optimal threshold:{`<${current.accValidation.toFixed(3)}>`}</span></div>*/}
            {/*<div className={styles.costText}><span>{current.getBenefit(TP, FN, FP, TN).text}</span></div>*/}
            {/*</div>}*/}
          </div>}
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
      />
    </div>
  }
}

@observer
class Predicted extends Component {
  render() {
    const { model, yes, no } = this.props;
    return (
      <div className={styles.progressBox}>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[0]}
            width={3.5}
            label={no}
            type={'success'}
            failType={'fail'}
          />
        </div>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[1]}
            width={3.5}
            label={yes}
            type={'predicted'}
            failType={'failPredicted'}
          />
        </div>
        <div className={styles.progressMeans}>
          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.success)} />
            <div className={styles.progressMeanText} title={`${EN.Actual}: ${no} ${EN.Predicted}: ${no}`}><span>{EN.Actual}: {no}</span><span>{EN.Predicted}: {no}</span></div>
          </div>
          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.predicted)} />
            <div className={styles.progressMeanText} title={`${EN.Actual}: ${yes} ${EN.Predicted}: ${yes}`}><span>{EN.Actual}: {yes}</span><span>{EN.Predicted}: {yes}</span></div>
          </div>

          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.fail)} />
            <div className={styles.progressMeanText} title={`${EN.Actual}: ${no} ${EN.Predicted}: ${yes}`}><span>{EN.Actual}: {no}</span><span>{EN.Predicted}: {yes}</span></div>
          </div>


          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.failPredicted)} />
            <div className={styles.progressMeanText} title={`${EN.Actual}: ${yes} ${EN.Predicted}: ${no}`}><span>{EN.Actual}: {yes}</span><span>{EN.Predicted}: {no}</span></div>
          </div>



          {/*<div className={styles.progressMean}>*/}
          {/*  <div className={classnames(styles.progressSquare, styles.different)} />*/}
          {/*  <div className={styles.progressMeanText} title={`${EN.Actual} & ${EN.Predicted} ${EN.Different}`}><span>{EN.Actual} &</span><span>{EN.Predicted}</span><span>{EN.Different}</span></div>*/}
          {/*</div>*/}
        </div>
      </div>
    );
  }
}

@observer
class PredictedProgress extends Component {
  render() {
    const { predicted, width, label, type,failType, height } = this.props;
    const title = label === undefined ? (
      ''
    ) : (
        <div className={styles.progressTitle}>
          <span title={label}>{label}</span>
        </div>
      );
    const predictedPercent = Math.round(predicted * 100);
    const failedPercent = 100 - predictedPercent
    const isSmaller = (!!predictedPercent && predictedPercent < 10) || (!!failedPercent && failedPercent < 10)

    return (
      <div className={styles.progressLine}>
        {title}
        {!!predictedPercent && <div
          className={classnames(styles.progress, styles[type], {
            [styles.progressLarge]: !failedPercent,
            [styles.progressSmall]: isSmaller
          })}
          style={{
            width: width * predicted + 'em',
            height: (height || 0.27) + 'em',
          }}
        >
          <span>{predictedPercent + '%'}</span>
        </div>}
        {!!failedPercent && <div
          className={classnames(styles.progress, styles[failType], {
            [styles.progressLarge]: !predictedPercent,
            [styles.progressSmall]: isSmaller
          })}
          style={{
            width: width * (1 - predicted) + 'em',
            height: (height || 0.27) + 'em'
          }}
        >
          <span>{failedPercent + '%'}</span>
        </div>}
      </div>
    );
  }
}

@observer
class Performance extends Component {
  render() {
    const { current, yes, no } = this.props;
    return <div className={styles.performanceBox}>
      <div className={styles.performance}>
        <Progress
          width={84}
          type="circle"
          percent={current.score.validateScore.auc * 100}
          format={percent => <span className={styles.performanceScore}>{formatNumber(percent / 100, 2)}</span>}
          strokeColor={'#f5a623'}
        />
        <div className={styles.performanceText}>
          <span><Hint content={EN.Areaunderthecurve} /> {EN.PerformanceAUC}</span>
        </div>
      </div>
      <Predicted model={current} yes={yes} no={no} />
    </div>
  }
}

@observer
class ModelTable extends Component {
  abortTrain = stopId => {
    this.props.abortTrain(stopId)
  }

  // handleSort = key => {
  //   const { sortKey, sort } = this
  //   if (key === sortKey) return this.sort = -sort
  //   this.sortKey = key
  //   this.sort = 1
  // }

  @computed
  get sortModels() {
    const { props: { models, sort: { key, value } } } = this
    const fn = (a, b) => {
      switch (key) {
        case "acc":
          return (a.accValidation - b.accValidation) * value
        case "auc":
          return (a.score.validateScore.auc - b.score.validateScore.auc) * value
        case 'speed':
          return (a.executeSpeed - b.executeSpeed) * value
        case 'time':
          return ((a.createTime || 0) - (b.createTime || 0)) * value
        case "name":
        default:
          // const aArr = a.name.split('.')
          // const bArr = b.name.split('.')
          // const aModelTime = aArr.slice(1).join('.');
          // const aModelUnix = moment(aModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
          // const bModelTime = bArr.slice(1).join('.');
          // const bModelUnix = moment(bModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
          // if (aModelUnix === bModelUnix) {
          //   const aName = aArr.slice(0, 1)
          //   const bName = bArr.slice(0, 1)
          //   return aName > bName ? sort : -sort
          // }
          // return (aModelUnix - bModelUnix) * sort
          return a.modelName > b.modelName ? value : -value
      }
    }
    return models.sort(fn)
  }

  render() {
    const { onSelect, train2Finished, current, trainModel, isAbort, recommendId, text, exportReport, sort, handleSort, mapHeader,project } = this.props;
    // const { sortKey, sort } = this
    return (
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div className={styles.rowData}>
            <div className={classnames(styles.cell, styles.name, styles.cellHeader)} onClick={handleSort.bind(null, 'name')} >
              <span>
                {EN.ModelName}
                {sort.key !== 'name' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div
              className={classnames(
                styles.cell,
                styles.predict,
                styles.cellHeader
              )}
            />
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={handleSort.bind(null, 'acc')}>
              <span>
                {EN.Accuracys}
                <Hint content={AccuracyHint} placement="right" />
                {sort.key !== 'acc' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={handleSort.bind(null, 'auc')}>
              <span>{EN.PerformanceAUC}
                {sort.key !== 'auc' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={handleSort.bind(null, 'speed')}>
              <span>{EN.ExecutionSpeed}
                {sort.key !== 'speed' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={handleSort.bind(null, 'time')}>
              <span>{EN.Time}
                {sort.key !== 'time' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>{EN.VariableImpact}</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>{EN.ModelProcessFlow}</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>{EN.Report}</span>
            </div>
            {/* <div className={classnames(styles.cell, styles.cellHeader)}><span>Process Flow</span></div> */}
          </div>
        </div>
        <div className={styles.data}>
          {this.sortModels.map((model, key) => {
            return (
              <ModelDetail
                key={key}
                model={model}
                isSelect={model.id === current.id}
                onSelect={onSelect}
                exportReport={exportReport(model.id)}
                isRecommend={model.id === recommendId}
                text={text}
                mapHeader={mapHeader}
                project={project}
              />
            );
          })}
          {!train2Finished && Object.values(trainModel).map((tm, k) => {
            return <div className={styles.rowData} key={k}>
              <div className={styles.trainingModel}><Tooltip title={EN.TrainingNewModel}>{EN.TrainingNewModel}</Tooltip></div>
              <ProgressBar progress={((tm || {}).value || 0)} allowRollBack={true} />
              <div className={styles.abortButton} onClick={!isAbort ? this.abortTrain.bind(null, tm.requestId) : null}>
                {isAbort ? <Icon type='loading' /> : <span>{EN.AbortTraining}</span>}
              </div>
            </div>
          })}
        </div>
      </div>
    );
  }
}

@observer
class ModelDetail extends Component {
  @observable type = '';
  @observable visible = false;

  toggleImpact(type) {
    if (!this.visible) {//本来是关着的
      this.type = type
      this.visible = true
      return
    }
    if (this.type === type) {
      this.visible = false
    } else {
      this.type = type
    }
  }

  render() {
    const { model, onSelect, isSelect, isRecommend, text, exportReport, mapHeader,project } = this.props;
    return (
      <div className={styles.rowBox}>
        <Tooltip
          placement="left"
          title={isRecommend ? text : EN.Selected}
          visible={isSelect || isRecommend}
          overlayClassName={styles.recommendLabel}
          autoAdjustOverflow={false}
          arrowPointAtCenter={true}
          getPopupContainer={el => el.parentElement}>
          <div className={styles.rowData}>
            <div className={styles.modelSelect}>
              <input
                type="radio"
                name="modelSelect"
                checked={isSelect}
                onChange={onSelect.bind(null, model)}
              />
            </div>
            <div className={classnames(styles.cell, styles.name)}>
              <Tooltip title={model.modelName}>{model.modelName}</Tooltip>
            </div>
            <div className={classnames(styles.cell, styles.predict)}>
              <PredictedProgress
                predicted={model.predicted[0]}
                width={1.5}
                height={0.2}
                type={'success'}
                failType={'fail'}
              />
              <div className={styles.space} />
              <PredictedProgress
                predicted={model.predicted[1]}
                width={1.5}
                height={0.2}
                type={'predicted'}
                failType={'failPredicted'}
              />
            </div>
            <div className={styles.cell}>
              <span>
                {formatNumber(model.accValidation)}
              </span>
            </div>
            <div className={styles.cell}>
              <span>
                {formatNumber(model.score.validateScore.auc)}
              </span>
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.executeSpeed) + EN.Rowss}</span>
            </div>
            <div className={styles.cell}>
              <span>{model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''}</span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <img src={Variable} alt="" />
              <span onClick={this.toggleImpact.bind(this, 'impact')}>{EN.Compute}</span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <img src={Process} alt="" />
              <span onClick={this.toggleImpact.bind(this, 'process')}>{EN.Compute}</span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <span onClick={exportReport}>{EN.Export}</span>
            </div>
          </div>
        </Tooltip>
        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
        {this.visible && this.type === 'impact' && <VariableImpact model={model} mapHeader={mapHeader}/>}
        {this.visible && this.type === 'process'&& <MPF modelId ={model.id}  project={project} model={model} />}
      </div >
    );
  }
}
