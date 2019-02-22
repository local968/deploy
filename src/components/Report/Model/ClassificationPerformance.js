import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Progress } from 'antd';

@observer
class Predicted extends Component {
  render() {
    const { model, yes, no } = this.props;
    return (
      <div className={styles.progressBox}>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[0]}
            width={7}
            label={no}
            type={'success'}
          />
        </div>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[1]}
            width={7}
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
    const { project } = this.props;
    const { selectModel: current, targetColMap, targetArrayTemp, renameVariable } = project;
    const [v0, v1] = !targetArrayTemp.length ? Object.keys(targetColMap) : targetArrayTemp
    const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1]
    return <div className={styles.performanceBox}>
      <div className={styles.performance}>
        <Progress
          width={100}
          type="circle"
          percent={current.score.validateScore.auc * 100}
          format={percent => <span className={styles.performanceScore}>{(percent / 100).toFixed(2)}</span>}
          strokeColor={'#f5a623'}
        />
        <div className={styles.performanceText}>
          <span>Performance (AUC)</span>
        </div>
      </div>
      <Predicted model={current} yes={yes} no={no} />
    </div>
  }
}

export default Performance
