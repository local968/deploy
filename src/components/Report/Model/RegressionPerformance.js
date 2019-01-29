import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import PredictVActual from './PredictVActual';


@observer
export default class RegressionView extends Component {
  onSelect = model => {
    this.props.project.setSelectModel(model.id)
  };

  render() {
    const { project } = this.props;
    const { selectModel: current } = project;
    return <div>
      <div className={styles.result}>
        <Performance current={current} />
        <PredictVActual model={current} project={project} />
      </div>
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
