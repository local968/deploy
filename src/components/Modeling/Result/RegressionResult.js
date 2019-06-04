import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
import moment from 'moment';
import VariableImpact from "./VariableImpact"
import { Tooltip, Icon } from 'antd'
import ModelProcessFlow from "./ModelProcessFlow";
import Process from "./Process.svg";
import Variable from "./Variable.svg";
import { ProgressBar, Hint } from 'components/Common';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import PredictedVsActualPlot from "../../Charts/PredictedVsActualPlot";
import config from 'config'
const isEN = config.isEN;

@observer
export default class RegressionView extends Component {
  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };
  

  render() {
    const { models, project = {}, exportReport, sort, handleSort } = this.props;
    const { train2Finished, trainModel, abortTrain, selectModel: current, isAbort, recommendModel } = project;
    if (!current) return null
    const currentPerformance = current ? (current.score.validateScore.r2 > 0.5 && EN.Acceptable) || EN.NotAcceptable : '';
  
    return <div>
      <div className={styles.result}>
        <div className={styles.box}>
          <div className={styles.title}>
            <span>{EN.RecommendedAModel}</span>
          </div>
          <div className={styles.row}>
            <span>{EN.ModelingResult}:{' '}</span>
            <div className={styles.status}>&nbsp;&nbsp;{currentPerformance}</div>
          </div>
          <div className={styles.row}>
            <span>{EN.SelectedModel} :<a className={styles.nohover}>&nbsp;{current.modelName}</a></span>
          </div>
          <div className={styles.row}>
            <span>{EN.Target} :<a className={styles.nohover}>&nbsp;{project.target}</a></span>
          </div>
          <Performance current={current} />
        </div>
        
        {/*<PredictVActual model={current} project={project} />*/}
        <PredictedVsActualPlot
            x_name = {EN.PointNumber}
            y_name = {isEN?`${EN.Groupaverage} ${project.target}`:`${project.target} ${EN.Groupaverage}`}
            url={project.selectModel.pointToShowData}
        />
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
        exportReport={exportReport}
        recommendId={recommendModel.id}
        sort={sort}
        handleSort={handleSort}
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
          <span>{formatNumber(current.score.validateScore.nrmse)}</span>
        </div>
        <div className={styles.performanceText}>
          <span><Hint content={EN.RootMeanSquareError} /> {EN.NormalizedRMSE}</span>
        </div>
      </div>
      <div className={styles.space} />
      <div className={styles.performance}>
        <div className={styles.r2Performance}>
          <span>{formatNumber(current.score.validateScore.r2)}</span>
        </div>
        <div className={styles.performanceText}>
          <span>
            {EN.GoodnessofFit} (R<sup>2</sup>)
            </span>
        </div>
      </div>
    </div>
  }
}

@observer
class ModelTable extends Component {
  // @observable sortKey = 'name'
  // @observable sort = 1

  abortTrain = () => {
    this.props.abortTrain()
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
        case "rmse":
          return (a.score.validateScore.rmse - b.score.validateScore.rmse) * value
        case "r2":
          return (a.score.validateScore.r2 - b.score.validateScore.r2) * value
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
    // const { sortKey, sort } = this
    const { onSelect, train2Finished, current, trainModel, isAbort, recommendId, exportReport, sort, handleSort } = this.props;
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
              onClick={handleSort.bind(null, 'name')}
            >
              <span>{EN.ModelName}
              {sort.key !== 'name' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={handleSort.bind(null, 'rmse')}>
              <span><Hint content={EN.RootMeanSquareErrorRMSEmeasures} /><i style={{ width: 4 }} />RMSE
              {sort.key !== 'rmse' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)} onClick={handleSort.bind(null, 'r2')}>
              <span>
                <Hint content={EN.R2isastatisticalmeasure} /><i style={{ width: 4 }} />R<sup>2</sup>
                {sort.key !== 'r2' ? <Icon type='minus' /> : <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />}
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
              />
            );
          })}
          {!train2Finished && <div className={styles.rowData}>
            {trainModel ? <div className={styles.trainingModel}><Tooltip title={EN.TrainingNewModel}>{EN.TrainingNewModel}</Tooltip></div> : null}
            {trainModel ? <ProgressBar progress={((trainModel || {}).value || 0)} /> : null}
            <div className={styles.abortButton} onClick={!isAbort ? this.abortTrain : null}>
              {isAbort ? <Icon type='loading' /> : <span>{EN.AbortTraining}</span>}
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
    const { model, onSelect, isRecommend, exportReport, isSelect } = this.props;
    return (
      <div className={styles.rowBox}>
        <Tooltip
          placement="left"
          title={isRecommend ? EN.Recommended : EN.Selected}
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
            <div className={styles.cell}>
              <span>
                {formatNumber(model.score.validateScore.rmse)}
              </span>
            </div>
            <div className={styles.cell}>
              <span>
                {formatNumber(model.score.validateScore.r2)}
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
        {/*{this.visible && <VariableImpact model={model} />}*/}
        {this.visible && this.type === 'impact' && <VariableImpact model={model} />}
        {this.visible && this.type === 'process' && <ModelProcessFlow model={model} />}
      </div >
    );
  }
}
