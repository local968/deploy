import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Progress, Icon } from 'antd';
import { ProgressBar } from 'components/Common';

@inject('projectStore')
@observer
export default class Loading extends Component {
  render() {
    const { abortTrain, trainModel, isAbort } = this.props.projectStore.project
    return (
      <div className={styles.loading}>
        <div className={styles.training}>
          <ProgressBar
            progress={((trainModel || {}).value || 0)}
          />
        </div>
        <div className={styles.trainingText}>
          <span>Training</span>
        </div>
        <div className={styles.trainingAbort}>
          <div className={styles.abortButton} onClick={abortTrain.bind(null, true)}>
            {isAbort ? <span><Icon type='loading' /></span> : <span>Abort Training</span>}
          </div>
        </div>
      </div>
    );
  }
}
