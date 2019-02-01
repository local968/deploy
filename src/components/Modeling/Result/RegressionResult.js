import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import VariableImpact from "./VariableImpact"
import PredictVActual from './PredictVActual';
import { Tooltip, Icon } from 'antd'
import ModelProcessFlow from "./ModelProcessFlow";
import Process from "./Process.svg";
import Variable from "./Variable.svg";
import { ProgressBar } from 'components/Common';


@observer
export default class RegressionView extends Component {
  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };

  render() {
    const { models, project } = this.props;
    const { train2Finished, trainModel, abortTrain, selectModel: current, isAbort } = project;
    const currentPerformance = current ? (current.score.validateScore.r2 > 0.5 && "Acceptable") || "Not Acceptable" : ''
    return <div>
      <div className={styles.result}>
        <div className={styles.box}>
          <div className={styles.title}>
            <span>We have recommended a model by default.</span>
          </div>
          <div className={styles.text}>
            <span>You can also tell us your business needs to get a more precise recommendation.</span>
          </div>
          <div className={styles.row}>
            <span>Modeling Results :{' '}</span>
            <div className={styles.status}>&nbsp;&nbsp;{currentPerformance}</div>
          </div>
          <div className={styles.row}>
            <span>Selected Model :<a>&nbsp;{current.name}</a></span>
          </div>
          <div className={styles.row}>
            <span>Target :<a>&nbsp;{project.target}</a></span>
          </div>
          <Performance current={current} />
        </div>
        <PredictVActual model={current} project={project} />
      </div>
      <div className={styles.line} />
      {/* <div className={styles.selectBlock}>
            <div className={styles.selectText}>
                <span> Select your model based on your own criteria:</span>
            </div>
            <div className={styles.radioGroup}>
                <div className={styles.radio}><input type="radio" name="criteria" value={Criteria.defualt} id={Criteria.defualt} onChange={this.onChange} defaultChecked={criteria === Criteria.defualt} /><label htmlFor={Criteria.defualt}>Mr. One's Defult Selection</label></div>
                <div className={styles.radio}><input type="radio" name="criteria" value={Criteria.costBased} id={Criteria.costBased} onChange={this.onChange} defaultChecked={criteria === Criteria.costBased} /><label htmlFor={Criteria.costBased}>Cost Based</label></div>
            </div>
        </div> */}
      <ModelTable
        models={models}
        current={current}
        onSelect={this.onSelect}
        train2Finished={train2Finished}
        trainModel={trainModel}
        abortTrain={abortTrain}
        isAbort={isAbort}
        project={project}
      />
    </div>
  }
}

@observer
class Performance extends Component {
  render() {
    const { current } = this.props;
    return <div className={styles.performanceBox}>
      <div className={styles.performance}>
        <div className={styles.rmsePerformance}>
          <span>{current.score.validateScore.nrmse.toFixed(4)}</span>
        </div>
        <div className={styles.performanceText}>
          <span>Normalized RMSE</span>
        </div>
      </div>
      <div className={styles.space} />
      <div className={styles.performance}>
        <div className={styles.r2Performance}>
          <span>{current.score.validateScore.r2.toFixed(4)}</span>
        </div>
        <div className={styles.performanceText}>
          <span>
            Goodness of Fit (R<sup>2</sup>)
            </span>
        </div>
      </div>
    </div>
  }
}

@observer
class ModelTable extends Component {
  abortTrain = () => {
    this.props.abortTrain()
  }
  exportReport = (modelId) => () => this.props.project.generateReport(modelId)

  render() {
    const { models, onSelect, train2Finished, current, trainModel, isAbort } = this.props;
    return (
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div className={styles.rowData}>
            <div
              className={classnames(
                styles.cell,
                styles.name,
                styles.cellHeader
              )}
            >
              <span>Model Name</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>RMSE</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>
                R<sup>2</sup>
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Execution Speed</span>
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
          </div>
        </div>
        <div className={styles.data}>
          {models.map((model, key) => {
            return (
              <ModelDetail
                key={key}
                model={model}
                current={current}
                onSelect={onSelect}
                exportReport={this.exportReport(model.id)}
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
    const { model, onSelect, current, exportReport } = this.props;
    return (
      <div className={styles.rowBox}>
        <div className={styles.rowData}>
          <div className={styles.modelSelect}>
            <input
              type="radio"
              name="modelSelect"
              defaultChecked={model.id === current.id}
              onChange={onSelect.bind(null, model)}
            />
          </div>
          <div className={classnames(styles.cell, styles.name)}>
            <Tooltip title={model.name}>{model.name}</Tooltip>
          </div>
          <div className={styles.cell}>
            <span>
              {model.score.validateScore.rmse.toFixed(4)}
            </span>
          </div>
          <div className={styles.cell}>
            <span>
              {model.score.validateScore.r2.toFixed(4)}
            </span>
          </div>
          <div className={styles.cell}>
            <span>{model.executeSpeed + ' rows/s'}</span>
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
        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
        {/*{this.visible && <VariableImpact model={model} />}*/}
        {this.visible && this.type === 'impact' && <VariableImpact model={model} />}
        {this.visible && this.type === 'process' && <ModelProcessFlow model={model} />}
      </div>
    );
  }
}
