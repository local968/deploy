import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { Progress, Spin } from 'antd';

const Classification = 'Classification';

@inject('deployStore')
@observer
export default class ModelResult extends Component {
  // onChange = (e) => {
  //     this.props.project.updateProject({
  //         criteria: e.target.value
  //     })
  // }

  selectModel = model => {
    this.props.models.forEach(m => (m.recommend = false));
    model.recommend = true;
  };

  deploy = () => {
    const { models, project } = this.props;
    const current = models.find(model => model.recommend);
    this.props.deployStore
      .newDeploy(project.projectId, project.name, current.name, current.problemType)
      .then(id => this.props.history.push('/deploy/project/' + id));
  };

  render() {
    const { models, project } = this.props;
    const { problemType, train2Finished } = project;
    const current = models.find(model => model.recommend);
    return (
    <div className={styles.modelResult}>
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
          <Performance problemType={problemType} model={current} />
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
          selectModel={this.selectModel}
          problemType={problemType}
          train2Finished={train2Finished}
        />
        <div className={styles.buttonBlock}>
          <button className={styles.button}>
            <span>Check Model Insights</span>
          </button>
          <div className={styles.or}>
            <span>or</span>
          </div>
          <button className={styles.button} onClick={this.deploy}>
            <span>Deploy the Model</span>
          </button>
        </div>
      </div>
    );
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
    return (
      <div className={styles.progressLine}>
        {title}
        <div
          className={classnames(styles.progress, styles[type])}
          style={{
            width: width * predicted + 'em',
            height: (height || 0.27) + 'em'
          }}
        >
          <span>{(predicted * 100).toFixed(0) + '%'}</span>
        </div>
        <div
          className={classnames(styles.progress, styles.different)}
          style={{
            width: width * (1 - predicted) + 'em',
            height: (height || 0.27) + 'em'
          }}
        >
          <span>{((1 - predicted) * 100).toFixed(0) + '%'}</span>
        </div>
      </div>
    );
  }
}

@observer 
class Performance extends Component {
  render() {
    const { problemType, model } = this.props;
    return problemType === Classification ? (
      <div className={styles.performanceBox}>
        <div className={styles.performance}>
          <Progress
            width={84}
            type="circle"
            percent={model.score.holdoutScore.auc * 100}
            format={percent => (percent / 100).toFixed(2)}
          />
          <div className={styles.performanceText}>
            <span>Performance (AUC)</span>
          </div>
        </div>
        <Predicted model={model} />
      </div>
    ) : (
        <div className={styles.performanceBox}>
          <div className={styles.performance}>
            <div className={styles.rmsePerformance}>
              <span>{model.score.holdoutScore.nrmse.toFixed(4)}</span>
            </div>
            <div className={styles.performanceText}>
              <span>Normalized RMSE</span>
            </div>
          </div>
          <div className={styles.space} />
          <div className={styles.performance}>
            <div className={styles.r2Performance}>
              <span>{model.score.holdoutScore.r2.toFixed(4)}</span>
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
    const { models, selectModel, problemType, train2Finished } = this.props;
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
              <span>
                {problemType === Classification ? 'Performance(AUC)' : 'RMSE'}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              {problemType === Classification ? (
                <span>Holdout</span>
              ) : (
                  <span>
                    R<sup>2</sup>
                  </span>
                )}
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
                selectModel={selectModel}
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
class ModelDetail extends Component {
  state = {
    type: '',
    visible: false
  };

  toggleImpact = () => {
    this.setState({
      type: 'impact',
      visible: !this.state.visible
    });
  };

  detail = () => {
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
  };

  render() {
    const { model, selectModel, problemType } = this.props;
    return (
      <div className={styles.rowBox}>
        <div className={styles.rowData}>
          <div className={styles.modelSelect}>
            <input
              type="radio"
              name="modelSelect"
              defaultChecked={model.recommend}
              onChange={selectModel.bind(null, model)}
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
                ? model.score.validateScore.auc.toFixed(2)
                : model.score.holdoutScore.nrmse.toFixed(4)}
            </span>
          </div>
          <div className={styles.cell}>
            <span>
              {problemType === Classification
                ? model.score.holdoutScore.auc.toFixed(2)
                : model.score.holdoutScore.r2.toFixed(4)}
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
        {this.state.visible && this.detail()}
      </div>
    );
  }
}
