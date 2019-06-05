import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Icon } from 'antd';
import { ProgressBar } from 'components/Common';
import EN from '../../../constant/en';
@inject('projectStore')
@observer
export default class Loading extends Component {
  render() {
    const { abortTrain, trainModel, isAbort } = this.props.projectStore.project
    const curModel = Object.values(trainModel).sort((a, b) => (b.value || 0) - (a.value || 0))[0]
    return (
      <div className={styles.loading}>
        <div className={styles.training}>
          <ProgressBar
            progress={((curModel || {}).value || 0)}
          />
        </div>
        <div className={styles.trainingText}>
          <span>{EN.TrainingS}</span>
        </div>
        {curModel && <div className={styles.trainingAbort}>
          <div className={styles.abortButton} onClick={abortTrain.bind(null, curModel.requestId, true)}>
            {isAbort ? <span><Icon type='loading' /></span> : <span>{EN.AbortTraining}</span>}
          </div>
        </div>}
      </div>
    );
  }
}
