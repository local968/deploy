import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { Progress } from 'antd';

@observer
export default class Loading extends Component {
  render() {
    const { abortTrain, trainModel } = this.props.project
    return (
      <div className={styles.loading}>
        <div className={styles.training}>
          <Progress
            className={styles.trainingProgress}
            percent={trainModel ? (trainModel.value || 0).toFixed(2) : 0}
            status="active"
          />
        </div>
        <div className={styles.trainingText}>
          <span>Training</span>
        </div>
        <div className={styles.trainingAbort}>
          <div className={styles.abortButton} onClick={abortTrain.bind(null, true)}>
            <span>Abort Training</span>
          </div>
        </div>
      </div>
    );
  }
}