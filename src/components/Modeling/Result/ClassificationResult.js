import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Progress, Tooltip, Icon } from 'antd';
import { observable, computed } from 'mobx';
import moment from 'moment';
import { Hint, NumberInput, ProgressBar, HeaderInfo } from 'components/Common';
import VariableImpact from "./VariableImpact"
import ModelProcessFlow from "./ModelProcessFlow"
import Variable from './Variable.svg'
import Process from './Process.svg'

const AccuracyHint = "Given a particular population, the accuracy measures the percentage of the correct predictions; For example, for a population of 100 that has 70 yes and 30 no, if the model predicts 60 yes correctly and 20 no correctly, then its accuracy is (60+20)/100 = 80%."

@observer
export default class ClassificationView extends Component {
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

  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };

  onHide = () => {
    this.showCost = false
  }

  costInput = (row, col) => {
    const isCost = row !== col
    const field = (row === col ? "T" : "F") + (col === 1 ? "P" : "N")
    return <div className={styles.costTd}>
      <div className={classnames(styles.costColor, styles[`cost${row}${col}`])}></div>
      <div className={styles.costName}><span>{isCost ? 'Cost:' : 'Benefit:'}</span></div>
      <div className={styles.costInput}><NumberInput value={this.costOption[field]} onBlur={this.handleChange.bind(null, field)} min={0} max={100} isInt={true} /></div>
      <div className={styles.costUnits}><span>units</span></div>
    </div>
  }

  handleChange = (field, value) => {
    this.costOption[field] = value
  }

  handleSubmit = () => {
    const { models, project } = this.props
    const { TP, FN, FP, TN } = this.costOption
    models.forEach(m => {
      const benefit = m.getBenefit(TP, FN, FP, TN)
      if (benefit.index !== m.fitIndex) m.updateModel({ fitIndex: benefit.index })
    })
    project.updateProject({ costOption: { ...this.costOption }, selectId: '' })
  }

  render() {
    const { models, project, exportReport } = this.props;
    const { train2Finished, trainModel, abortTrain, selectModel: current, recommendModel, criteria, costOption: { TP, FN, FP, TN }, targetColMap, targetArrayTemp, renameVariable, isAbort } = project;
    if (!current) return null
    const currentPerformance = current ? (current.score.validateScore.auc > 0.8 && "GOOD") || (current.score.validateScore.auc > 0.6 && "OK") || "NotSatisfied" : ''
    const [v0, v1] = !targetArrayTemp.length ? Object.keys(targetColMap) : targetArrayTemp
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1]
    const text = (criteria === 'cost' && (TP | FN || FP || TN)) ? 'Cost Based' : 'Recommended'
    return <div>
      <div className={styles.result}>
        <div className={styles.box}>
          <div className={styles.title}>
            <span>We have recommended a model by default.</span>
          </div>
          {/* <div className={styles.text}>
            <span>You can also tell us your business needs to get a more precise recommendation.</span>
          </div> */}
          <div className={styles.row}>
            <span>Modeling Results :{' '}</span>
            <div className={styles.status}>&nbsp;&nbsp;{currentPerformance}</div>
          </div>
          <div className={styles.row}>
            <span>Selected Model :<a className={styles.nohover}>&nbsp;{current.name}</a></span>
          </div>
          <div className={styles.row}>
            <span>Target :<a className={styles.nohover}>&nbsp;{project.target}</a></span>
          </div>
        </div>
        <Performance current={current} yes={yes} no={no} />
      </div>
      <div className={styles.line} />
      <div className={styles.selectBlock}>
        <div className={styles.selectText}>
          <span> Select your model based on your own criteria:</span>
        </div>
        <div className={styles.radioGroup}>
          <div className={styles.radio}>
            <input type="radio" name="criteria" value='default' id='criteria_default' readOnly onClick={this.onChange} checked={criteria === 'default'} />
            <label htmlFor='criteria_default'>R2 Learn's Default Selection</label>
          </div>
          <div className={styles.radio}>
            <input type="radio" name="criteria" value='cost' id='criteria_cost' readOnly onClick={this.onChange} checked={criteria === 'cost'} />
            <label htmlFor='criteria_cost'>Cost Based<Hint content='If you can estimate the business benefit of a correct prediction and the business cost of an incorrect prediction, we can help you optimize the model parameter or select a more appropriate model.' /></label>
          </div>
          {this.showCost && <div className={styles.costBlock}>
            <div className={styles.costClose} onClick={this.onHide}><span>+</span></div>
            <div className={styles.costTitle}>
              <span>Input your cost or benefit of every prediction result: (0 ~ 100)</span>
            </div>
            <div className={styles.costContent}>
              <span>Note: If a prediction brings you loss, it is a cost; If a prediction result brings you profit, it is a benefit. All inputs should be measured at the same unit.</span>
            </div>
            <div className={styles.costBox}>
              <div className={styles.costTable}>
                <div className={styles.costRow}>
                  <HeaderInfo row='Predicted' col='Actual' />
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
            {!!(TP || FN || FP || TN) && <div className={styles.costTextBox}>
              {/* <div className={styles.costText}><span>The best benefit score based on 3616 row samples size:</span></div> */}
              <div className={styles.costText}><span>{current.getBenefit(TP, FN, FP, TN).text}</span></div>
            </div>}
            <div className={styles.costButton}>
              <button onClick={this.handleSubmit}><span>Submit</span></button>
            </div>
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
          />
        </div>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[1]}
            width={3.5}
            label={yes}
            type={'predicted'}
          />
        </div>
        <div className={styles.progressMeans}>
          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.success)} />
            <div className={styles.progressMeanText} title={`Actual: ${no} Predicted: ${no}`}><span>Actual: {no}</span><span>Predicted: {no}</span></div>
          </div>
          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.predicted)} />
            <div className={styles.progressMeanText} title={`Actual: ${yes} Predicted: ${yes}`}><span>Actual: {yes}</span><span>Predicted: {yes}</span></div>
          </div>
          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.different)} />
            <div className={styles.progressMeanText} title={`Actual & Predicted Different`}><span>Actual &</span><span>Predicted</span><span>Different</span></div>
          </div>
        </div>
      </div>
    );
  }
}

@observer
class PredictedProgress extends Component {
  render() {
    const { predicted, width, label, type, height } = this.props;
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
          className={classnames(styles.progress, styles.different, {
            [styles.progressLarge]: !predictedPercent,
            [styles.progressSmall]: isSmaller
          })}
          style={{
            width: width * (1 - predicted) + 'em',
            height: (height || 0.27) + 'em'
          }}
        >
          <span>{((1 - predicted) * 100).toFixed(0) + '%'}</span>
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
          format={percent => <span className={styles.performanceScore}>{(percent / 100).toFixed(2)}</span>}
          strokeColor={'#f5a623'}
        />
        <div className={styles.performanceText}>
          <span><Hint content='Area under the curve, a popular metric to measure the performance of a classification model. The AUC value typically lies between 0.5 to 1 where 0.5 denotes a bad classifier and 1 denotes an excellent classifier.' /> Performance (AUC)</span>
        </div>
      </div>
      <Predicted model={current} yes={yes} no={no} />
    </div>
  }
}

@observer
class ModelTable extends Component {
  @observable sortKey = 'name'
  @observable sort = 1

  abortTrain = () => {
    this.props.abortTrain()
  }

  handleSort = key => {
    const { sortKey, sort } = this
    if (key === sortKey) return this.sort = -sort
    this.sortKey = key
    this.sort = 1
  }

  @computed
  get sortModels() {
    const { sortKey, sort, props: { models } } = this
    const fn = (a, b) => {
      switch (sortKey) {
        case "acc":
          return (a.accValidation - b.accValidation) * sort
        case "auc":
          return (a.score.validateScore.auc - b.score.validateScore.auc) * sort
        case 'speed':
          return (a.executeSpeed - b.executeSpeed) * sort
        case 'time':
          return ((a.createTime || 0) - (b.createTime || 0)) * sort
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
          return a.name > b.name ? sort : -sort
      }
    }
    return models.sort(fn)
  }

  render() {
    const { onSelect, train2Finished, current, trainModel, isAbort, recommendId, text,exportReport } = this.props;
    const { sortKey, sort } = this
    return (
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div className={styles.rowData}>
            <div className={classnames(styles.cell, styles.name, styles.cellHeader)} onClick={this.handleSort.bind(null, 'name')} >
              <span>
                Model Name
                {sortKey !== 'name' ? <Icon type='minus' /> : <Icon type='up' style={sort === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div
              className={classnames(
                styles.cell,
                styles.predict,
                styles.cellHeader
              )}
            />
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={this.handleSort.bind(null, 'acc')}>
              <span>
                Accuracy
                <Hint content={AccuracyHint} placement="right" />
                {sortKey !== 'acc' ? <Icon type='minus' /> : <Icon type='up' style={sort === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={this.handleSort.bind(null, 'auc')}>
              <span>Performance(AUC)
              {sortKey !== 'auc' ? <Icon type='minus' /> : <Icon type='up' style={sort === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={this.handleSort.bind(null, 'speed')}>
              <span>Execution Speed
              {sortKey !== 'speed' ? <Icon type='minus' /> : <Icon type='up' style={sort === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={this.handleSort.bind(null, 'time')}>
              <span>Time
              {sortKey !== 'time' ? <Icon type='minus' /> : <Icon type='up' style={sort === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Variable Impact</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Model Process Flow</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Report</span>
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
              />
            );
          })}
          {!train2Finished && <div className={styles.rowData}>
            {trainModel ? <div className={styles.trainingModel}><Tooltip title={'New Model Being Trained'}>{'New Model Being Trained'}</Tooltip></div> : null}
            {trainModel ? <ProgressBar progress={((trainModel || {}).value || 0)} /> : null}
            {/* <div className={styles.trainingProcessBg}>
              <div className={styles.trainingProcessBlock}>
                <div className={styles.trainingProcess} style={{ width: `${((trainModel || {}).value || 0)}%` }}></div>
              </div>
              <div className={styles.trainingText}>{`${((trainModel || {}).value || 0).toFixed(2)}%`}</div>
            </div> */}
            <div className={styles.abortButton} onClick={!isAbort ? this.abortTrain : null}>
              {isAbort ? <Icon type='loading' /> : <span>Abort Training</span>}
            </div>
          </div>}
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
    const { model, onSelect, isSelect, isRecommend, text, exportReport } = this.props;
    return (
      <div className={styles.rowBox}>
        <Tooltip
          placement="left"
          title={isRecommend ? text : 'Selected'}
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
              <Tooltip title={model.name}>{model.name}</Tooltip>
            </div>
            <div className={classnames(styles.cell, styles.predict)}>
              <PredictedProgress
                predicted={model.predicted[0]}
                width={1.5}
                height={0.2}
                type={'success'}
              />
              <div className={styles.space} />
              <PredictedProgress
                predicted={model.predicted[1]}
                width={1.5}
                height={0.2}
                type={'predicted'}
              />
            </div>
            <div className={styles.cell}>
              <span>
                {model.accValidation.toFixed(2)}
              </span>
            </div>
            <div className={styles.cell}>
              <span>
                {model.score.validateScore.auc.toFixed(2)}
              </span>
            </div>
            <div className={styles.cell}>
              <span>{model.executeSpeed + ' rows/s'}</span>
            </div>
            <div className={styles.cell}>
              <span>{model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''}</span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <img src={Variable} alt="" />
              <span onClick={this.toggleImpact.bind(this, 'impact')}>Compute</span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <img src={Process} alt="" />
              <span onClick={this.toggleImpact.bind(this, 'process')}>Compute</span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <span onClick={exportReport}>Export</span>
            </div>
          </div>
        </Tooltip>
        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
        {this.visible && this.type === 'impact' && <VariableImpact model={model} />}
        {this.visible && this.type === 'process' && <ModelProcessFlow model={model} />}
      </div >
    );
  }
}
