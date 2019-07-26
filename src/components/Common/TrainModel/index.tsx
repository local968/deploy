import React, { useState } from 'react'
import styles from './styles.module.css'
import { observer } from 'mobx-react';
import { Tooltip, Icon } from 'antd';
import { ProgressBar, Show } from '..';
import EN from '../../../constant/en'

const TrainModel = (props: any) => {
  const { trainingModel, isAbort, abortTrain, show } = props
  const [abort, setAbort] = useState(false)

  const handleTrain = () => {
    setAbort(true)
    abortTrain(trainingModel.requestId).then(() => setAbort(false))
  }

  return <div className={styles.rowData}>
    <div className={styles.trainingModel}>
      <Tooltip title={trainingModel.actionKey || EN.TrainingNewModel}>
        <span id={styles.trainingModelSpan}>{trainingModel.actionKey || EN.TrainingNewModel}</span>
      </Tooltip>
    </div>
    <ProgressBar progress={trainingModel.value || 0} />
    <Show
      name={show}
    >
      <div
        className={styles.abortButton}
        onClick={
          (!isAbort && !abort)
            ? handleTrain
            : null
        }
      >
        {(isAbort || abort) ? (
          <Icon type="loading" />
        ) : (
            <span id={styles.abortButtonSpan}>{EN.AbortTraining}</span>
          )}
      </div>
    </Show>
  </div>
}

export default observer(TrainModel)