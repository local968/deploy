import React, { Component } from 'react'
import styles from './styles.module.css'
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import Summary from './Summary'
import CorrelationMatrix from 'components/Modeling/Start/CorrelationMatrix'
import VariableList from './VariableList'
import VariableImpact from './Model/VariableImpact'
import ModelProcessFlow from './Model/ModelProcessFlow'
import AdvancedView, { PredictTable } from './Score'
import { observable, action } from 'mobx';
import { Checkbox } from 'antd';
import { formatNumber } from 'util'
import EN from '../../constant/en';

const addComma = number => {
  if (Number.isNaN(number)) return number
  number = number.toString().split('')
  if (number.length <= 3) return number.join('')
  number.reverse()

  let start = number.length
  while (start % 3 !== 0) start++
  start -= 3
  for (let i = start; i > 2; i -= 3) {
    number.splice(i, 0, ',')
  }
  return number.reverse().join('')
}

@inject('projectStore')
@observer
class Report extends Component {

  @observable isEdit = false

  @observable config = {
    profile: true,
    dataSchema: true,
    dataQuality: true,
    dataAnalysis: true,
    correlationMatrix: true,
    modelResult: true,
    modelName: true,
    metrics: true,
    variableImpact: true,
    score: true,
    processFlow: true
  }



  constructor(props) {
    console.log(props , 'dsadasdasdasdas ' )
    super(props)
    props.projectStore.currentId = props.projectStore.list.id
    // if (window.localStorage && window.localStorage.getItem(`reportConfig:${props.projectStore.project.selectModel.id}`)) {
    //   const config = window.localStorage.getItem(`reportConfig:${props.projectStore.project.selectModel.id}`)
    //   if (config) this.config = JSON.parse(config)
    // }
    window.rr = this
    console.log(this , 'this')
  }


  @observable show = false
  @observable sort = {
    simple: {
      key: 'name',
      value: 1
    },
    advanced: {
      key: 'Model Name',
      value: 1
    }
  }
  @observable metric = this.props.projectStore.list[0].measurement

  handleSort = (view, key) => {
    const sort = this.sort[view]
    if (!sort) return
    if (sort.key === key) sort.value = -sort.value
    else {
      sort.key = key
      sort.value = 1
    }
    this.sort = { ...this.sort, [view]: sort }
  }

  handleChange = action(value => {
    this.metric = value;
    // if (window.localStorage)
    //   window.localStorage.setItem(`advancedViewMetric:${this.props.project.id}`, value)
  });

  reset = () => {
    const project = this.props.projectStore.list
    project.selectModel.resetFitIndex()
    project.costOption.FN = 0
    project.costOption.FP = 0
    project.costOption.TN = 0
    project.costOption.TP = 0
  }

  toggleEdit = action(() => {
   // this.isEdit = !this.isEdit
  //  if (window.localStorage) window.localStorage.setItem(`reportConfig:${this.props.projectStore.project.selectModel.id}`, JSON.stringify(this.config))
  })

  isShow = (name) => {
    return this.isEdit || this.config[name]
  }

  checkChange = (name) => action((e) => {
    if (name === 'modelResult') {
      if (this.config.modelResult) {
        this.config.modelResult = false;
        this.config.modelName = false;
        this.config.metrics = false;
        this.config.variableImpact = false;
        this.config.score = false;
        this.config.processFlow = false;
      } else {
        this.config.modelResult = true;
        this.config.modelName = true;
        this.config.metrics = true;
        this.config.variableImpact = true;
        this.config.score = true;
        this.config.processFlow = true;
      }
    }
    this.config[name] = e.target.checked
  })

  checkBox = (name) => this.isEdit && <Checkbox onChange={this.checkChange(name)} checked={this.config[name]} />

  render() {
    const { projectStore: { list } } = this.props
    const { selectModel: model } = list[0]
    const { score: { validateScore: vs, holdoutScore: hs }, fitIndex, chartData } = model
    const { roc, rocHoldout: roch } = chartData || {}
    const { targetArray, targetColMap, renameVariable } = list[0]
    const [v0, v1] = !targetArray.length ? Object.keys(targetColMap) : targetArray;
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];

    console.log(list[0] , 'listlistlistlistlistlist' ,list[0].name)
    return (

      <div className={styles.report}>
        <h1 className={styles.totalTitle}>{EN.ProjectReport}: {list[0].name}
        {/*<small onClick={this.toggleEdit}>{this.isEdit ? EN.Save : EN.Edit}</small>*/}
        </h1>
        {this.isShow('profile') && <div className={classnames(styles.block, styles.profile)}>
          {this.checkBox('profile')}
          <h3 className={styles.blockTitle}>{EN.Profile}</h3>
          <div className={styles.blockRow}>{EN.ProjectStatement}: {list[0].statement || '-'}</div>
          <div className={styles.blockRow}>{EN.BusinessValue}: {list[0].business || '-'}</div>
          <div className={styles.blockRow}>{EN.ProblemType}: {list[0].problemType}</div>
          <div className={styles.blockRow}>{EN.Dataset}: {list[0].fileName || '-'}</div>
        </div>}
        {this.isShow('dataSchema') && <div className={styles.block}>
          {this.checkBox('dataSchema')}
          <h3 className={styles.blockTitle}>{EN.DataSchemas}</h3>
          <div className={styles.schema}>
            <div className={classnames(styles.schemaRow, styles.schemaHeader)}>
              <span className={styles.schemaCell}>#row</span>
              <span className={styles.schemaCell}>#col</span>
              <span className={styles.schemaCell}>#cat</span>
              <span className={styles.schemaCell}>#num</span>
            </div>
            <div className={styles.schemaRow}>
              <span className={styles.schemaCell}>{addComma(list[0].totalRawLines)}</span>
              <span className={styles.schemaCell}>{addComma(Object.keys(list[0].colType).length)}</span>
              <span className={styles.schemaCell}>{addComma(Object.keys(list[0].colType).filter(([k, v]) => v === 'Categorical').length)}</span>
              <span className={styles.schemaCell}>{addComma(Object.keys(list[0].colType).filter(([k, v]) => v === 'Numerical').length)}</span>
            </div>
          </div>
        </div>}
        {!list[0].noCompute && this.isShow('dataQuality') && <div className={styles.block}>
          {this.checkBox('dataQuality')}
          <h3 className={styles.blockTitle}>{EN.DataQuality}</h3>
          <Summary project={list[0]} />
        </div>}
        {this.isShow('dataAnalysis') && <div className={styles.block}>
          {this.checkBox('dataAnalysis')}
          <h3 className={styles.blockTitle}>{EN.ExploratoryDataAnalysis}</h3>
          <div className={styles.blockRow}><VariableList project={list[0]} /></div>
        </div>}


        <div className={styles.modelResult}>
          {this.isShow('modelResult') && <h1 className={styles.title}>{EN.ModelResult}</h1>}
          {this.checkBox('modelResult')}
          {/*{this.isShow('modelName') && <div className={classnames(styles.block, styles.marginZero)}>*/}
          {/*  {this.checkBox('modelName')}*/}
          {/*  <h3 className={styles.blockTitle}>{EN.ModelName}: <span className={styles.modelName}>{list[0].selectModel.name}</span></h3>*/}
          {/*  /!* {project.problemType === 'Classification' && <div className={styles.blockRow}><ClassificationPerformance project={project} /></div>} *!/*/}
          {/*  /!* {project.problemType === 'Regression' && <div className={classnames(styles.blockRow, styles.performance)}><RegressionPerformance project={project} /></div>} *!/*/}
          {/*</div>}*/}
          {this.isShow('metrics') && <div className={classnames(styles.block, styles.VariableImpact)}>
            {this.checkBox('metrics')}
            {/*<h3 className={styles.blockTitle}>{EN.Metrics}</h3>*/}
            {list[0].problemType === 'Regression' && <div className={styles.metrics}>
              <div className={classnames(styles.metricsRow, styles.metricsHeader)}>
                <span className={styles.metricsCell}></span>
                <span className={styles.metricsCell}>R²</span>
                <span className={styles.metricsCell}>Adjusted R²</span>
                <span className={styles.metricsCell}>MSE</span>
                <span className={styles.metricsCell}>RMSE</span>
                <span className={styles.metricsCell}>NRMSE</span>
                <span className={styles.metricsCell}>MAE</span>
              </div>
              <div className={styles.metricsRow}>
                <span className={styles.metricsCell}>{EN.Validation}</span>
                <span className={styles.metricsCell} title={vs.r2}>{formatNumber(vs.r2)}</span>
                <span className={styles.metricsCell} title={vs.adjustR2}>{formatNumber(vs.adjustR2)}</span>
                <span className={styles.metricsCell} title={vs.mse}>{formatNumber(vs.mse)}</span>
                <span className={styles.metricsCell} title={vs.rmse}>{formatNumber(vs.rmse)}</span>
                <span className={styles.metricsCell} title={vs.nrmse}>{formatNumber(vs.nrmse)}</span>
                <span className={styles.metricsCell} title={vs.mae}>{formatNumber(vs.mae)}</span>
              </div>
              <div className={styles.metricsRow}>
                <span className={styles.metricsCell}>{EN.Holdout}</span>
                <span className={styles.metricsCell} title={hs.r2}>{formatNumber(hs.r2)}</span>
                <span className={styles.metricsCell} title={hs.adjustR2}>{formatNumber(hs.adjustR2)}</span>
                <span className={styles.metricsCell} title={hs.mse}>{formatNumber(hs.mse)}</span>
                <span className={styles.metricsCell} title={hs.rmse}>{formatNumber(hs.rmse)}</span>
                <span className={styles.metricsCell} title={hs.nrmse}>{formatNumber(hs.nrmse)}</span>
                <span className={styles.metricsCell} title={hs.mae}>{formatNumber(hs.mae)}</span>
              </div>
            </div>}
            {list[0].problemType === 'Classification' && <div className={styles.metrics}>
              <div className={classnames(styles.metricsRow, styles.metricsHeader)}>
                <span className={styles.metricsCell}></span>
                <span className={styles.metricsCell}>AUC</span>
                <span className={styles.metricsCell}>Cutoff</span>
                <span className={styles.metricsCell}>{EN.Accuracy}</span>
                <span className={styles.metricsCell}>{EN.Precision}</span>
                <span className={styles.metricsCell}>{EN.Recall}</span>
                <span className={styles.metricsCell}>F1 Score</span>
                <span className={styles.metricsCell}>KS</span>
                <span className={styles.metricsCell}>{EN.LogLoss}</span>
              </div>
              <div className={styles.metricsRow}>
                <span className={styles.metricsCell}>{EN.Validation}</span>
                <span className={styles.metricsCell} title={vs.auc}>{formatNumber(vs.auc)}</span>
                <span className={styles.metricsCell} title={roc.Threshold[fitIndex]}>{formatNumber(roc.Threshold[fitIndex])}</span>
                <span className={styles.metricsCell} title={model.accValidation}>{formatNumber(model.accValidation)}</span>
                <span className={styles.metricsCell} title={roc.Precision[fitIndex]}>{formatNumber(roc.Precision[fitIndex])}</span>
                <span className={styles.metricsCell} title={roc.Recall[fitIndex]}>{formatNumber(roc.Recall[fitIndex])}</span>
                <span className={styles.metricsCell} title={roc.F1[fitIndex]}>{formatNumber(roc.F1[fitIndex])}</span>
                <span className={styles.metricsCell} title={roc.KS[fitIndex]}>{formatNumber(roc.KS[fitIndex])}</span>
                <span className={styles.metricsCell} title={roc.LOGLOSS[fitIndex]}>{formatNumber(roc.LOGLOSS[fitIndex])}</span>
              </div>
              <div className={styles.metricsRow}>
                <span className={styles.metricsCell}>{EN.Holdout}</span>
                <span className={styles.metricsCell} title={hs.auc}>{formatNumber(hs.auc)}</span>
                <span className={styles.metricsCell} title={roch.Threshold[fitIndex]}>{formatNumber(roch.Threshold[fitIndex])}</span>
                <span className={styles.metricsCell} title={model.accHoldout}>{formatNumber(model.accHoldout)}</span>
                <span className={styles.metricsCell} title={roch.Precision[fitIndex]}>{formatNumber(roch.Precision[fitIndex])}</span>
                <span className={styles.metricsCell} title={roch.Recall[fitIndex]}>{formatNumber(roch.Recall[fitIndex])}</span>
                <span className={styles.metricsCell} title={roch.F1[fitIndex]}>{formatNumber(roch.F1[fitIndex])}</span>
                <span className={styles.metricsCell} title={roch.KS[fitIndex]}>{formatNumber(roch.KS[fitIndex])}</span>
                <span className={styles.metricsCell} title={roch.LOGLOSS[fitIndex]}>{formatNumber(roch.LOGLOSS[fitIndex])}</span>
              </div>
              <div className={styles.titles}>
                <div className={styles.metricsTitle}>{EN.ConfusionMatrix}</div>
                <div className={styles.metricsTitle}>{EN.CostBased}</div>
              </div>
              <PredictTable model={model} yes={yes} no={no} project={list[0]} />
            </div>}
          </div>}


          {/*{this.isShow('variableImpact') && <div className={classnames(styles.block, styles.VariableImpact)}>*/}
          {/*  {this.checkBox('variableImpact')}*/}
          {/*  <h3 className={styles.blockTitle}>{EN.VariableImpact}</h3>*/}
          {/*  <div className={styles.blockRow}><VariableImpact model={project.selectModel} /></div>*/}
          {/*</div>}*/}


          {this.isShow('score') && <div className={classnames(styles.block, styles.score)}>
            {this.checkBox('score')}
            {/*<h3 className={styles.blockTitle}>{EN.Charts} {list[0].problemType === 'Classification' && <small onClick={this.reset}> reset</small>}</h3>*/}
            <div className={styles.blockRow}>
              {/*<Score models={[list[0].selectModel]} project={list[0]} />*/}
              <AdvancedView models={list[0].models} project={list[0]}  sort={this.sort.advanced} handleSort={this.handleSort.bind(null, 'advanced')} metric={this.metric} handleChange={this.handleChange} />
            </div>
          </div>}

          {this.isShow('processFlow') && <div className={classnames(styles.block, styles.processFlow)}>
            {this.checkBox('processFlow')}
            <h3 className={styles.blockTitle}>{EN.ModelProcessFlow}</h3>
            <div className={styles.blockRow}><ModelProcessFlow model={list[0].selectModel} /></div>
          </div>}
        </div>
      </div>
    )
  }
}

export default Report
