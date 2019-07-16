import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Icon } from 'antd';
import { ProgressBar } from 'components/Common';
import EN from '../../../constant/en';
interface Interface {
  projectStore:any
}
@inject('projectStore')
@observer
export default class Loading extends Component<Interface> {
  render() {
    const {project={}} = this.props.projectStore;
    const { trainModel, isAbort, abortTrainByEtl } = project as any;
    const curModel = Object.values(trainModel).sort(
      (a:any, b:any) => (b.value || 0) - (a.value || 0),
    )[0];
    return (
      <div className={styles.loading}>
        <div className={styles.training}>
          <ProgressBar progress={(curModel || {} as any).value || 0} />
        </div>
        <div className={styles.trainingText}>
          <span>{EN.TrainingS}</span>
        </div>
        {
          <div className={styles.trainingAbort}>
            <div className={styles.abortButton} onClick={abortTrainByEtl}>
              {isAbort ? (
                <span>
                  <Icon type="loading" />
                </span>
              ) : (
                <span>{EN.AbortTraining}</span>
              )}
            </div>
          </div>
        }
      </div>
    );
  }
}
