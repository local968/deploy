import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames'
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router'
import { observable, action } from 'mobx';
import AdvancedView from '../AdvancedView/AdvancedView';
import ClassificationResult from './ClassificationResult';
import RegressionResult from './RegressionResult';
import { ProgressBar, ProcessLoading } from 'components/Common';
import { Modal, message, Button } from 'antd'
import EN from '../../../constant/en';
const Classification = 'Classification';

@inject('deploymentStore', 'routing', 'projectStore')
@observer
export default class ModelResult extends Component {
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
  @observable metric = this.props.projectStore.project.measurement
  @observable isHoldout = false

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

  handleHoldout = value => {
    this.isHoldout = value
  }

  deploy = () => {
    const { project } = this.props.projectStore;
    const { selectModel: current } = project
    // const { newVariable, trainHeader } = project
    // const newVariableLabel = newVariable.filter(v => !trainHeader.includes(v))
    // const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
    // const exps = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")

    this.props.deploymentStore
      .addDeployment(project.id, project.name, current.modelName, current.problemType)
      .then(id => this.props.routing.push('/deploy/project/' + id));
  };

  // showInsights = () => {
  //   this.show = true
  // }

  // hideInsights = () => {
  //   this.show = false
  // }

  componentDidMount() {
    this.props.resetSide()
  }

  componentDidUpdate() {
    this.props.resetSide()
  }

  exportReport = (modelId) => () => {
    try {
      this.cancel = this.props.projectStore.project.generateReport(modelId)
    } catch (e) {
      message.destroy();
      message.error('导出报告错误。')
      this.props.projectStore.project.reportProgress = 0
      this.props.projectStore.project.reportProgressText = 'init'
    }
  }

  render() {
    const { view, changeView } = this.props
    const { project } = this.props.projectStore;
    const { models } = project
    const { id, etlIndex, fileName, selectModel, target, loadModel } = project
    if (loadModel) return <ProcessLoading style={{ position: 'fixed' }} />
    if (!models.length) return null;
    // const { view } = this;

    const modelName = selectModel.modelName
    const cannotDownload = !this.isHoldout && selectModel.isCV && (modelName.startsWith('Ensemble') || modelName.startsWith('r2-solution-DNN'))

    const type = this.isHoldout ? 'holdout' : 'validate'
    const realName = fileName.endsWith('.csv') ? fileName.slice(0, -4) : fileName
    return (
      <div className={styles.modelResult}>
        <div className={styles.tabBox}>
          <div className={classnames(styles.tab, {
            [styles.active]: view === 'simple'
          })} onClick={changeView.bind(null, 'simple')}><span>{EN.SimplifiedView}</span></div>
          <div className={classnames(styles.tab, {
            [styles.active]: view === 'advanced'
          })} onClick={changeView.bind(null, 'advanced')}><span>{EN.AdvancedView}</span></div>
        </div>
        {/* <div className={styles.buttonBlock} >
          <button className={styles.button} onClick={this.changeView.bind(this, 'simple')}>
            <span>Simple View</span>
          </button>
          <button className={styles.button} onClick={this.changeView.bind(this, 'advanced')}>
            <span>Advanced View</span>
          </button>
        </div> */}
        {view === 'simple' ?
          <SimpleView models={models} project={project} exportReport={this.exportReport} sort={this.sort.simple} handleSort={this.handleSort.bind(null, 'simple')} /> :
          <AdvancedView models={models} project={project} exportReport={this.exportReport} sort={this.sort.advanced} handleSort={this.handleSort.bind(null, 'advanced')} metric={this.metric} handleChange={this.handleChange} isHoldout={this.isHoldout} handleHoldout={this.handleHoldout} />}
        <div className={styles.buttonBlock}>
          {/* <button className={styles.button} onClick={this.showInsights}>
            <span>Check Model Insights</span>
          </button>
          <div className={styles.or}>
            <span>or</span>
          </div> */}
          <button className={styles.button} onClick={this.deploy}>
            <span>{EN.DeployTheModel}</span>
          </button>
          {view === 'advanced' && (cannotDownload ? <button className={classnames(styles.button, styles.disabled)}>
            <span>{`${EN.Exportmodelresults}(${this.isHoldout ? EN.Holdout : EN.Validation})`}</span>
          </button> : <a href={`/upload/download/result?projectId=${id}&filename=${encodeURIComponent(`${realName}-${selectModel.modelName}-${type}.csv`)}&mid=${selectModel.modelName}&etlIndex=${etlIndex}&type=${type}&target=${target}`} target='_blank'>
              <button className={styles.button}>
                <span>{`${EN.Exportmodelresults}(${this.isHoldout ? EN.Holdout : EN.Validation})`}</span>
              </button>
            </a>)}
        </div>
        {/* <Modal title='Model Insights'
          visible={current && this.show}
          onClose={this.hideInsights}
          content={<ModelInsights model={current} project={project} />} /> */}
        <Modal title={EN.ExportingReport} visible={project.reportProgressText !== 'init'} closable={true} footer={null} onCancel={this.cancel} maskClosable={false}>
          <div className={styles.reportProgress}>
            <ProgressBar progress={project.reportProgress} allowRollBack={true} />
            <span className={styles.reportProgressText}>{project.reportProgressText}</span>
            <Button onClick={this.cancel} className={styles.reportCancel} >{EN.CANCEL}</Button>
          </div>
        </Modal>
      </div>
    );
  }
}

@withRouter
@observer
class SimpleView extends Component {
  render() {
    const { models, project, exportReport, sort, handleSort } = this.props;
    const { problemType } = project;
    return problemType === Classification ?
      <ClassificationResult models={models} project={project} exportReport={exportReport} sort={sort} handleSort={handleSort} /> :
      <RegressionResult models={models} project={project} exportReport={exportReport} sort={sort} handleSort={handleSort} />
  }
}

// @observer
// class ModelInsights extends Component {
//   @observable active = 0

//   componentDidMount() {
//     when(
//       () => !this.props.model.modelInsightsData,
//       () => this.props.project.modelInsights()
//     )
//   }

//   setActive = i => {
//     const { active } = this;
//     if (active === i) return;
//     this.active = i
//   }

//   render() {
//     const { project, model } = this.props;
//     const { featureImportanceDetail, modelInsightsData, name } = model;
//     const { active } = this;
//     const arr = Object.entries(featureImportanceDetail).sort(
//       (a, b) => b[1] - a[1]
//     );
//     return <div className={styles.modelInsights}>
//       <div className={styles.modelInsightsBlock}><span>Click each predictors to see its value effect.</span></div>
//       <div className={styles.modelInsightsBlock}><span>Selected Model:  {name}</span><span>Target Variable: {project.target}</span></div>
//       <div className={styles.modelInsightsTable}>
//         <div className={styles.modelInsightsCol}>
//           <div className={styles.modelInsightsHeader}><span>Based on Variable Impact</span></div>
//           <div className={styles.modelInsightsList}>
//             {arr.map((row, i) => {
//               return <div key={i} className={classnames(styles.modelInsightsRow, {
//                 [styles.modelInsightsActive]: i === active
//               })} onClick={this.setActive.bind(null, i)}>
//                 <div className={styles.modelInsightsText} title={row[0]}><span>{row[0]}</span></div>
//                 <div className={styles.modelInsightsProgressBg}>
//                   <div className={styles.modelInsightsProgress} style={{ width: (row[1] * 100) + "%" }}></div>
//                 </div>
//               </div>
//             })}
//           </div>
//         </div>
//         {modelInsightsData ? <div className={styles.modelInsightsImage}>
//           <div className={styles.modelInsightsImageTitle}><span>How do I interpret the graph?</span></div>
//           <ModelInsightsChart charts={modelInsightsData} field={arr[active][0]} />
//         </div> : <div className={styles.modelInsightsLoading}>
//             <Spin size="large" />
//           </div>}
//       </div>
//     </div>
//   }
// }

// @observer
// class ModelInsightsChart extends Component {
//   componentDidMount() {
//     this.renderD3()
//   }

//   componentDidUpdate() {
//     this.renderD3()
//   }

//   renderD3 = () => {
//     d3.select(`.${styles.modelInsightsChart} svg`).remove();

//     const { charts, field } = this.props;
//     if (!charts[field]) return;
//     const { x, freq, partial } = charts[field];

//     const padding = { left: 50, bottom: 30, right: 50, top: 10 };

//     const height = 300;
//     const width = 600;
//     const realHeight = height - padding.bottom - padding.top;
//     const realWidth = width - padding.left - padding.right;

//     const data = x.map((v, k) => {
//       return {
//         x: v,
//         y1: freq[k],
//         y2: partial[k]
//       }
//     })
//     //添加一个 SVG 画布
//     const svg = d3.select(`.${styles.modelInsightsChart}`)
//       .append("svg")
//       .attr("width", width)
//       .attr("height", height)
//       .append("g")
//       .attr('transform', `translate(${padding.left}, 0)`);

//     //x轴的比例尺
//     const xScale = d3.scaleBand()
//       .rangeRound([0, realWidth])
//       .domain(x)
//       .padding(0.3);

//     //y轴的比例尺
//     const y1Scale = d3.scaleLinear()
//       .range([realHeight, 0])
//       .domain([0, d3.max(freq)])
//       .clamp(true)
//       .nice();

//     //y轴的比例尺
//     const y2Scale = d3.scaleLinear()
//       .range([realHeight, 0])
//       .domain([0, d3.max(partial)])
//       .clamp(true)
//       .nice();

//     //定义x轴
//     const xAxis = d3.axisBottom(xScale).tickValues(x);

//     //定义y轴
//     const y1Axis = d3.axisLeft(y1Scale);

//     //定义y轴
//     const y2Axis = d3.axisRight(y2Scale);

//     //添加x轴
//     svg.append("g")
//       // .attr("class",`${styles.axis}`)
//       .attr("transform", `translate(0, ${realHeight + padding.top})`)
//       .call(xAxis);

//     //添加y轴
//     svg.append("g")
//       // .attr("class",`${styles.axis}`)
//       .attr("transform", `translate(0, ${padding.top})`)
//       .call(y1Axis);

//     //添加y轴
//     svg.append("g")
//       // .attr("class",`${styles.axis}`)
//       .attr("transform", `translate(${realWidth}, ${padding.top})`)
//       .call(y2Axis);

//     const rects = svg.selectAll(`.${styles.rect}`);
//     rects.remove();
//     rects.data(data)
//       .enter()
//       .append('rect')
//       .attr('class', styles.rect)
//       .attr('x', d => xScale(d.x))
//       .attr('y', d => y1Scale(d.y1) + padding.top)
//       .attr('width', xScale.bandwidth())
//       .attr('height', d => realHeight - y1Scale(d.y1));

//     const circles = svg.selectAll(styles.circle);
//     circles.remove();
//     circles.data(data)
//       .enter().append('circle')
//       .attr('class', styles.circle)
//       .attr('r', 6)
//       .attr('cx', d => xScale(d.x) + xScale.bandwidth() / 2)
//       .attr('cy', d => y2Scale(d.y2));

//     const line = d3.line()
//       .x(d => xScale(d.x) + xScale.bandwidth() / 2)
//       .y(d => y2Scale(d.y2));

//     svg.append('path')
//       .datum(data)
//       .attr('class', styles.line)
//       .attr('d', line);
//   }

//   render() {
//     return <div className={styles.modelInsightsChart}></div>
//   }
// }
