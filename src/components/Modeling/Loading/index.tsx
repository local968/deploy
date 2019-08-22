import React, { useContext } from 'react';
import styles from './styles.module.css';
import { MobXProviderContext, observer } from 'mobx-react';
import { Icon } from 'antd';
import { ProgressBar } from 'components/Common';
import EN from '../../../constant/en';

const Loading = observer(()=>{
  const {projectStore} = useContext(MobXProviderContext);
  const { trainModel, isAbort, abortTrainByEtl } = projectStore.project;
  const curModel:any = Object.values(trainModel).sort((a:any, b:any) => (b.value || 0) - (a.value || 0))[0]
  return (
    <div className={styles.loading}>
      <div className={styles.training}>
        <ProgressBar progress={((curModel || {}).value || 0)} />
      </div>
      <div className={styles.trainingText}>
        <span>{EN.TrainingS}</span>
      </div>
      {<div className={styles.trainingAbort}>
        <div className={styles.abortButton} onClick={() => abortTrainByEtl()}>
          {isAbort ? <span><Icon type='loading' /></span> : <span>{EN.AbortTraining}</span>}
        </div>
      </div>}
    </div>
  );
});
export default Loading;
