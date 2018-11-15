import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Progress } from 'antd';
import { observable } from 'mobx';
// import Hint from 'components/Common/Hint';
import { Hint, NumberInput } from 'components/Common';
import VariableImpact from "./VariableImpact"

const AccuracyHint = "Given a particular population, the accuracy measures the percentage of the correct predictions; For example, for a population of 100 that has 70 yes and 30 no, if the model predicts 60 yes correctly and 20 no correctly, then its accuracy is (60+20)/100 = 80%."

@observer
export default class ClassificationView extends Component {
  @observable showCost = false

  onChange = e => {
    const criteria = e.target.value
    this.showCost = criteria === 'cost'
    this.props.project.updateProject({ criteria })
  }

  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };

  onHide = () => {
    this.showCost = false
  }

  costInput = (row, col) => {
    const isCost = row !== col
    const field = (row === col ? "T" : "F") + (col === 0 ? "P" : "N")
    return <div className={styles.costTd}>
      <div className={classnames(styles.costColor, styles[`cost${row}${col}`])}></div>
      <div className={styles.costName}><span>{isCost ? 'Cost:' : 'Benifit:'}</span></div>
      <div className={styles.costInput}><NumberInput value={this.props.project.costOption[field]} onBlur={this.handleChange.bind(null, field)} min={0} max={100} isInt={true}  /></div>
      <div className={styles.costUnits}><span>units</span></div>
    </div>
  }

  handleChange = (field, value) => {
    this.props.project.costOption[field] = value
  }

  render() {
    const { models, project } = this.props;
    const { train2Finished, train2ing, trainModel, abortTrain, selectModel: current, criteria } = project;
    const currentPerformance = current ? (current.score.validateScore.auc > 0.8 && "GOOD") || (current.score.validateScore.auc > 0.7 && "OK") || "NotSatisfied" : ''
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
            <span>Modeling Results :{' '}<div className={styles.status}>&nbsp;&nbsp;{currentPerformance}</div></span>
          </div>
          <div className={styles.row}>
            <span>Selected Model :<a>&nbsp;{current.name}</a></span>
          </div>
          <div className={styles.row}>
            <span>Target :<a>&nbsp;{project.target}</a></span>
          </div>
        </div>
        <Performance current={current} />
      </div>
      <div className={styles.line} />
      <div className={styles.selectBlock}>
        <div className={styles.selectText}>
          <span> Select your model based on your own criteria:</span>
        </div>
        <div className={styles.radioGroup}>
          <div className={styles.radio}>
            <input type="radio" name="criteria" value='default' id='criteria_default' readOnly onClick={train2ing ? null : this.onChange} checked={criteria === 'default'} disabled={train2ing} />
            <label htmlFor='criteria_default'>Mr. One's Defult Selection</label>
          </div>
          <div className={styles.radio}>
            <input type="radio" name="criteria" value='cost' id='criteria_cost' readOnly onClick={train2ing ? null : this.onChange} checked={criteria === 'cost'} disabled={train2ing} />
            <label htmlFor='criteria_cost'>Cost Based</label>
          </div>
          {this.showCost && <div className={styles.costBlock}>
            <div className={styles.costClose} onClick={this.onHide}><span>+</span></div>
            <div className={styles.costTitle}>
              <span>Input your cost or benifit of every prediction result: (0 ~ 100)</span>
            </div>
            <div className={styles.costContent}>
              <span>Note: If a prediction result will let you loose your resource or money. It should be a cost; If a prediction result will bring you revenue or income, it should be a benifit. All input should be measured at the same unit.</span>
            </div>
            <div className={styles.costBox}>
              <div className={styles.costTable}>
                <div className={styles.costRow}>
                  <div className={classnames(styles.costCell, styles.costCellSmall)}><span>Actual / Predicted</span></div>
                  <div className={classnames(styles.costCell, styles.costCellCenter)}><span>YES</span></div>
                  <div className={classnames(styles.costCell, styles.costCellCenter)}><span>NO</span></div>
                </div>
                <div className={styles.costRow}>
                  <div className={classnames(styles.costCell, styles.costCellSmall)}><span>YES</span></div>
                  <div className={styles.costCell}>{this.costInput(1, 1)}</div>
                  <div className={styles.costCell}>{this.costInput(1, 0)}</div>
                </div>
                <div className={styles.costRow}>
                  <div className={classnames(styles.costCell, styles.costCellSmall)}><span>NO</span></div>
                  <div className={styles.costCell}>{this.costInput(0, 1)}</div>
                  <div className={styles.costCell}>{this.costInput(0, 0)}</div>
                </div>
              </div>
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
      />
    </div>
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
            <div className={classnames(styles.progressSquare, styles.success)} />
            <div><span>Actual: 0<br />Predicted: 0</span></div>
          </div>
          <div className={styles.progressBlock}>
            <div className={classnames(styles.progressSquare, styles.predicted)} />
            <div><span>Actual: 1<br />Predicted: 1</span></div>
          </div>
          <div className={styles.progressBlock}>
            <div className={classnames(styles.progressSquare, styles.different)} />
            <div><span>Actual: &<br />Predicted<br />Different</span></div>
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
          <span>{label}</span>
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
    const { current } = this.props;
    return <div className={styles.performanceBox}>
      <div className={styles.performance}>
        <Progress
          width={84}
          type="circle"
          percent={current.score.validateScore.auc * 100}
          format={percent => (percent / 100).toFixed(2)}
        />
        <div className={styles.performanceText}>
          <span>Performance (AUC)</span>
        </div>
      </div>
      <Predicted model={current} />
    </div>
  }
}

@observer
class ModelTable extends Component {
  render() {
    const { models, onSelect, train2Finished, current, trainModel, abortTrain } = this.props;
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
            <div
              className={classnames(
                styles.cell,
                styles.predict,
                styles.cellHeader
              )}
            />
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>
                Accuracy
                <Hint content={AccuracyHint} placement="right" />
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>Performance(AUC)</span>
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
                isSelect={model.id === current.id}
                onSelect={onSelect}
              />
            );
          })}
          {(!train2Finished && trainModel) && <div className={styles.rowData}>
            <div className={styles.trainingModel}>
              <span>{trainModel.model}</span>
            </div>
            <div className={styles.trainingProcessBg}>
              <div className={styles.trainingProcessBlock}>
                <div className={styles.trainingProcess} style={{ width: `${trainModel.value}%` }}></div>
              </div>
              <div className={styles.trainingText}>{`${trainModel.value}%`}</div>
            </div>
          </div>}
          {!train2Finished && <div className={styles.trainingAbort}>
            <div className={styles.abortButton} onClick={abortTrain.bind(null, false)}>
              <span>Abort Training</span>
            </div>
          </div>}
        </div>
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
    const { model, onSelect, isSelect } = this.props;
    return (
      <div className={styles.rowBox}>
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
            <span title={model.name}>{model.name}</span>
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
              {model.score.validateScore.acc.toFixed(2)}
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
