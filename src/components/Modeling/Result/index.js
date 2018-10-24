import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router'
import { Progress, Spin } from 'antd';
import { Modal } from 'components/Common';
import { when, observable } from 'mobx';
import * as d3 from 'd3';
import AdvancedView from '../AdvancedView/AdvancedView';
import Hint from 'components/Common/Hint';

const Classification = 'Classification';
const AccuracyHint = "Given a particular population, the accuracy measures the percentage of the correct predictions; For example, for a population of 100 that has 70 yes and 30 no, if the model predicts 60 yes correctly and 20 no correctly, then its accuracy is (60+20)/100 = 80%."

@inject('deploymentStore', 'routing')
@observer
export default class ModelResult extends Component {
  @observable show = false
  @observable view = "simple"

  deploy = () => {
    const { project, models } = this.props;
    const current = project.selectModel;
    const modelList = models.map(m => {
      try {
        const score = m.score.validateScore
        const performance = Object.entries(score).map(([k, v]) => `${k}:${v}`).join(" ")
        return {
          name: m.name,
          performance
        }
      } catch (e) {
        return true
      }
    }).filter(v => !!v)
    this.props.deploymentStore
      .addDeployment(project.id, project.name, current.name, current.problemType, modelList)
      .then(id => this.props.routing.push('/deploy/project/' + id));
  };

  showInsights = () => {
    this.show = true
  }

  hideInsights = () => {
    this.show = false
  }

  changeView = view => {
    this.view = view
  }

  render() {
    const { models, project } = this.props;
    const current = project.selectModel
    if (!models.length) return null;
    const { view } = this;
    return (
      <div className={styles.modelResult}>
        <div className={styles.buttonBlock} >
          <button className={styles.button} onClick={this.changeView.bind(this, 'simple')}>
            <span>Simple View</span>
          </button>
          <button className={styles.button} onClick={this.changeView.bind(this, 'advanced')}>
            <span>Advanced View</span>
          </button>
        </div>
        {view === 'simple' ? <SimpleView models={models} project={project} /> : <AdvancedView models={models} project={project} />}
        <div className={styles.buttonBlock}>
          {/* <button className={styles.button} onClick={this.showInsights}>
            <span>Check Model Insights</span>
          </button>
          <div className={styles.or}>
            <span>or</span>
          </div> */}
          <button className={styles.button} onClick={this.deploy}>
            <span>Deploy the Model</span>
          </button>
        </div>
        <Modal title='Model Insights'
          visible={current && this.show}
          onClose={this.hideInsights}
          content={<ModelInsights model={current} project={project} />} />
      </div>
    );
  }
}

@withRouter
@observer
class SimpleView extends Component {
  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };

  render() {
    const { models, project } = this.props;
    const { problemType, train2Finished } = project;
    const current = project.selectModel
    return (
      <div>
        <div className={styles.result}>
          <div className={styles.box}>
            <div className={styles.title}>
              <span>We have recommended a model by default.</span>
            </div>
            <div className={styles.text}>
              <span>
                You can also tell us your business needs to get a more precise
                recommendation.
              </span>
            </div>
            <div className={styles.row}>
              <span>
                Modeling Results :{' '}
                <div className={styles.status}>&nbsp;&nbsp;OK</div>
              </span>
            </div>
            <div className={styles.row}>
              <span>
                Selected Model :<a>&nbsp;{current.name}</a>
              </span>
            </div>
            <div className={styles.row}>
              <span>
                Target :<a>&nbsp;{project.target}</a>
              </span>
            </div>
          </div>
          <Performance current={current} problemType={problemType} />
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
          problemType={problemType}
          train2Finished={train2Finished}
        />
      </div>
    )
  }
}

@observer
class Predicted extends Component {
  render() {
    const { model } = this.props;
    return (
      <div className={styles.progressBox}>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[0]}
            width={3.5}
            label={0}
            type={'success'}
          />
        </div>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[1]}
            width={3.5}
            label={1}
            type={'predicted'}
          />
        </div>
        <div className={styles.progressMeans}>
          <div className={styles.progressBlock}>
            <div
              className={classnames(styles.progressSquare, styles.success)}
            />
            <div>
              <span>
                Actual: 0<br />Predicted: 0
              </span>
            </div>
          </div>
          <div className={styles.progressBlock}>
            <div
              className={classnames(styles.progressSquare, styles.predicted)}
            />
            <div>
              <span>
                Actual: 1<br />Predicted: 1
              </span>
            </div>
          </div>
          <div className={styles.progressBlock}>
            <div
              className={classnames(styles.progressSquare, styles.different)}
            />
            <div>
              <span>
                Actual: &<br />Predicted<br />Different
              </span>
            </div>
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
    const title =
      label === undefined ? (
        ''
      ) : (
          <div className={styles.progressTitle}>
            <span>{label}</span>
          </div>
        );
    const predictedPercent = Math.round(predicted * 100);
    const failedPercent = 100 - predictedPercent
    return (
      <div className={styles.progressLine}>
        {title}
        {!!predictedPercent && <div
          className={classnames(styles.progress, styles[type])}
          style={{
            width: width * predicted + 'em',
            height: (height || 0.27) + 'em'
          }}
        >
          <span>{predictedPercent + '%'}</span>
        </div>}
        {!!failedPercent && <div
          className={classnames(styles.progress, styles.different)}
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
    const { problemType, current } = this.props;
    return problemType === Classification ? (
      <div className={styles.performanceBox}>
        <div className={styles.performance}>
          <Progress
            width={84}
            type="circle"
            percent={current.score.holdoutScore.auc * 100}
            format={percent => (percent / 100).toFixed(2)}
          />
          <div className={styles.performanceText}>
            <span>Performance (AUC)</span>
          </div>
        </div>
        <Predicted model={current} />
      </div>
    ) : (
        <div className={styles.performanceBox}>
          <div className={styles.performance}>
            <div className={styles.rmsePerformance}>
              <span>{current.score.holdoutScore.nrmse.toFixed(4)}</span>
            </div>
            <div className={styles.performanceText}>
              <span>Normalized RMSE</span>
            </div>
          </div>
          <div className={styles.space} />
          <div className={styles.performance}>
            <div className={styles.r2Performance}>
              <span>{current.score.holdoutScore.r2.toFixed(4)}</span>
            </div>
            <div className={styles.performanceText}>
              <span>
                Goodness of Fit (R<sup>2</sup>)
            </span>
            </div>
          </div>
        </div>
      );
  }
}

@observer
class ModelTable extends Component {
  render() {
    const { models, onSelect, problemType, train2Finished, current } = this.props;
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
            {problemType === Classification && (
              <div
                className={classnames(
                  styles.cell,
                  styles.predict,
                  styles.cellHeader
                )}
              />
            )}
            <div className={classnames(styles.cell, styles.cellHeader)}>
              {problemType === Classification ? <span>
                Accuracy
                <Hint content={AccuracyHint} placement="right" />
              </span> : <span>
                  RMSE
              </span>}
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              {problemType === Classification ?
                <span>
                  Performance(AUC)
                </span> : <span>
                  R<sup>2</sup>
                </span>}
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Execution Speed</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Variable Impact</span>
            </div>
            {/* <div className={classnames(styles.cell, styles.cellHeader)}><span>Process Flow</span></div> */}
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
                problemType={problemType}
              />
            );
          })}
          {!train2Finished && (
            <div className={styles.center}>
              <Spin size="large" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

@observer
export class VariableImpact extends Component {
  render() {
    const { model } = this.props;
    const { featureImportanceDetail } = model;
    const arr = Object.entries(featureImportanceDetail).sort(
      (a, b) => b[1] - a[1]
    );
    return (
      <div className={styles.detail}>
        {arr.map((row, index) => {
          return (
            <div key={index} className={styles.detailRow}>
              <div className={styles.detailName}>
                <span title={row[0]}>{row[0]}</span>
              </div>
              <div
                className={styles.detailProcess}
                style={{ width: row[1] * 7 + 'em' }}
              />
              <div className={styles.detailNum}>
                <span title={row[1].toFixed(4)}>{row[1].toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

@observer
class ModelDetail extends Component {
  @observable type = ''
  @observable visible = false

  toggleImpact = () => {
    this.type = 'impact'
    this.visible = !this.visible
  };

  render() {
    const { model, onSelect, problemType, current } = this.props;
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
            <span>{model.name}</span>
          </div>
          {problemType === Classification && (
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
          )}
          <div className={styles.cell}>
            <span>
              {problemType === Classification
                ? model.score.validateScore.acc.toFixed(2)
                : model.score.validateScore.nrmse.toFixed(4)}
            </span>
          </div>
          <div className={styles.cell}>
            <span>
              {problemType === Classification
                ? model.score.validateScore.auc.toFixed(2)
                : model.score.validateScore.r2.toFixed(4)}
            </span>
          </div>
          <div className={styles.cell}>
            <span>{model.executeSpeed + 'ms/1000rows'}</span>
          </div>
          <div className={classnames(styles.cell, styles.compute)}>
            <span onClick={this.toggleImpact}>Compute</span>
          </div>
        </div>
        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
        {this.visible && <VariableImpact model={model} />}
      </div>
    );
  }
}

@observer
class ModelInsights extends Component {
  @observable active = 0

  componentDidMount() {
    when(
      () => !this.props.model.modelInsightsData,
      () => this.props.project.modelInsights()
    )
  }

  setActive = i => {
    const { active } = this;
    if (active === i) return;
    this.active = i
  }

  render() {
    const { project, model } = this.props;
    const { featureImportanceDetail, modelInsightsData, name } = model;
    const { active } = this;
    const arr = Object.entries(featureImportanceDetail).sort(
      (a, b) => b[1] - a[1]
    );
    return <div className={styles.modelInsights}>
      <div className={styles.modelInsightsBlock}><span>Click each predictors to see its value effect.</span></div>
      <div className={styles.modelInsightsBlock}><span>Selected Model:  {name}</span><span>Target Variable: {project.target}</span></div>
      <div className={styles.modelInsightsTable}>
        <div className={styles.modelInsightsCol}>
          <div className={styles.modelInsightsHeader}><span>Based on Variable Impact</span></div>
          <div className={styles.modelInsightsList}>
            {arr.map((row, i) => {
              return <div key={i} className={classnames(styles.modelInsightsRow, {
                [styles.modelInsightsActive]: i === active
              })} onClick={this.setActive.bind(null, i)}>
                <div className={styles.modelInsightsText} title={row[0]}><span>{row[0]}</span></div>
                <div className={styles.modelInsightsProgressBg}>
                  <div className={styles.modelInsightsProgress} style={{ width: (row[1] * 100) + "%" }}></div>
                </div>
              </div>
            })}
          </div>
        </div>
        {modelInsightsData ? <div className={styles.modelInsightsImage}>
          <div className={styles.modelInsightsImageTitle}><span>How do I interpret the graph?</span></div>
          <ModelInsightsChart charts={modelInsightsData} field={arr[active][0]} />
        </div> : <div className={styles.modelInsightsLoading}>
            <Spin size="large" />
          </div>}
      </div>
    </div>
  }
}

@observer
class ModelInsightsChart extends Component {
  componentDidMount() {
    this.renderD3()
  }

  componentDidUpdate() {
    this.renderD3()
  }

  renderD3 = () => {
    d3.select(`.${styles.modelInsightsChart} svg`).remove();

    const { charts, field } = this.props;
    if (!charts[field]) return;
    const { x, freq, partial } = charts[field];

    const padding = { left: 50, bottom: 30, right: 50, top: 10 };

    const height = 300;
    const width = 600;
    const realHeight = height - padding.bottom - padding.top;
    const realWidth = width - padding.left - padding.right;

    const data = x.map((v, k) => {
      return {
        x: v,
        y1: freq[k],
        y2: partial[k]
      }
    })
    //添加一个 SVG 画布
    const svg = d3.select(`.${styles.modelInsightsChart}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr('transform', `translate(${padding.left}, 0)`);

    //x轴的比例尺
    const xScale = d3.scaleBand()
      .rangeRound([0, realWidth])
      .domain(x)
      .padding(0.3);

    //y轴的比例尺
    const y1Scale = d3.scaleLinear()
      .range([realHeight, 0])
      .domain([0, d3.max(freq)])
      .clamp(true)
      .nice();

    //y轴的比例尺
    const y2Scale = d3.scaleLinear()
      .range([realHeight, 0])
      .domain([0, d3.max(partial)])
      .clamp(true)
      .nice();

    //定义x轴
    const xAxis = d3.axisBottom(xScale).tickValues(x);

    //定义y轴
    const y1Axis = d3.axisLeft(y1Scale);

    //定义y轴
    const y2Axis = d3.axisRight(y2Scale);

    //添加x轴
    svg.append("g")
      // .attr("class",`${styles.axis}`)
      .attr("transform", `translate(0, ${realHeight + padding.top})`)
      .call(xAxis);

    //添加y轴
    svg.append("g")
      // .attr("class",`${styles.axis}`)
      .attr("transform", `translate(0, ${padding.top})`)
      .call(y1Axis);

    //添加y轴
    svg.append("g")
      // .attr("class",`${styles.axis}`)
      .attr("transform", `translate(${realWidth}, ${padding.top})`)
      .call(y2Axis);

    const rects = svg.selectAll(`.${styles.rect}`);
    rects.remove();
    rects.data(data)
      .enter()
      .append('rect')
      .attr('class', styles.rect)
      .attr('x', d => xScale(d.x))
      .attr('y', d => y1Scale(d.y1) + padding.top)
      .attr('width', xScale.bandwidth())
      .attr('height', d => realHeight - y1Scale(d.y1));

    const circles = svg.selectAll(styles.circle);
    circles.remove();
    circles.data(data)
      .enter().append('circle')
      .attr('class', styles.circle)
      .attr('r', 6)
      .attr('cx', d => xScale(d.x) + xScale.bandwidth() / 2)
      .attr('cy', d => y2Scale(d.y2));

    const line = d3.line()
      .x(d => xScale(d.x) + xScale.bandwidth() / 2)
      .y(d => y2Scale(d.y2));

    svg.append('path')
      .datum(data)
      .attr('class', styles.line)
      .attr('d', line);
  }

  render() {
    return <div className={styles.modelInsightsChart}></div>
  }
}
