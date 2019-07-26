import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import styles from '../styles.module.css';
import EN from '../../../../../constant/en';
import { Icon, Tooltip } from 'antd';
import ModelDetail from './ModelDetail';
import classnames from 'classnames'
import { ProgressBar, Hint, Show } from 'components/Common';
import Model from 'stores/Model';
import Project from 'stores/Project';

interface Interface {
  onSelect: (s: string) => void
  train2Finished: boolean
  current: Model
  trainModel: unknown
  isAbort: boolean
  recommendId: string
  exportReport: (s: string) => () => void
  sort: {
    key: string,
    value: number
  }
  handleSort: (s: string) => void
  mapHeader: StringObject
  project: Project
  stopIds: string[]
  abortTrain: (s: string) => void
  models: Model[]
}
@observer
export default class ModelTable extends Component<Interface> {
  abortTrain = stopId => {
    this.props.abortTrain(stopId);
  };

  @computed
  get sortModels() {
    const {
      props: {
        models,
        sort: { key, value },
      },
    } = this;
    const fn = (a, b) => {
      switch (key) {
        case 'rmse':
          return (
            (a.score.validateScore.rmse - b.score.validateScore.rmse) * value
          );
        case 'r2':
          return (a.score.validateScore.r2 - b.score.validateScore.r2) * value;
        case 'speed':
          return (a.executeSpeed - b.executeSpeed) * value;
        case 'time':
          return ((a.createTime || 0) - (b.createTime || 0)) * value;
        case 'name':
        default:
          // const aArr = a.name.split('.')
          // const bArr = b.name.split('.')
          // const aModelTime = aArr.slice(1).join('.');
          // const aModelUnix = moment(aModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
          // const bModelTime = bArr.slice(1).join('.');
          // const bModelUnix = moment(bModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
          // if (aModelUnix === bModelUnix) {
          //   const aName = aArr.slice(0, 1)
          //   const bName = bArr.slice(0, 1)
          //   return aName > bName ? sort : -sort
          // }
          // return (aModelUnix - bModelUnix) * sort
          return a.modelName > b.modelName ? value : -value;
      }
    };
    return models.sort(fn);
  }

  render() {
    // const { sortKey, sort } = this
    const {
      onSelect,
      train2Finished,
      current,
      trainModel,
      isAbort,
      recommendId,
      exportReport,
      sort,
      handleSort,
      mapHeader,
      project,
      stopIds,
    } = this.props;
    return (
      <div className={styles.table}>
        <div className={styles.rowHeader}>
          <div className={styles.rowData}>
            <div
              className={classnames(
                styles.cell,
                styles.name,
                styles.cellHeader,
              )}
              onClick={handleSort.bind(null, 'name')}
            >
              <span>
                {EN.ModelName}
                {sort.key !== 'name' ? (
                  <Icon type="minus" />
                ) : (
                    <Icon
                      type="up"
                      style={
                        sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                      }
                    />
                  )}
              </span>
            </div>
            <div
              className={classnames(styles.cell, styles.cellHeader)}
              onClick={handleSort.bind(null, 'rmse')}
            >
              <span>
                <Hint content={EN.RootMeanSquareErrorprediction} />
                <i style={{ width: 4 }} />
                RMSE
                {sort.key !== 'rmse' ? (
                  <Icon type="minus" />
                ) : (
                    <Icon
                      type="up"
                      style={
                        sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                      }
                    />
                  )}
              </span>
            </div>
            <div
              className={classnames(styles.cell, styles.cellHeader)}
              onClick={handleSort.bind(null, 'r2')}
            >
              <span>
                <Hint content={EN.R2isastatisticalmeasure} />
                <i style={{ width: 4 }} />R<sup>2</sup>
                {sort.key !== 'r2' ? (
                  <Icon type="minus" />
                ) : (
                    <Icon
                      type="up"
                      style={
                        sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                      }
                    />
                  )}
              </span>
            </div>
            <div
              className={classnames(styles.cell, styles.cellHeader)}
              onClick={handleSort.bind(null, 'speed')}
            >
              <span>
                {EN.ExecutionSpeed}
                {sort.key !== 'speed' ? (
                  <Icon type="minus" />
                ) : (
                    <Icon
                      type="up"
                      style={
                        sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                      }
                    />
                  )}
              </span>
            </div>
            <div
              className={classnames(styles.cell, styles.cellHeader)}
              onClick={handleSort.bind(null, 'time')}
            >
              <span>
                {EN.Time}
                {sort.key !== 'time' ? (
                  <Icon type="minus" />
                ) : (
                    <Icon
                      type="up"
                      style={
                        sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                      }
                    />
                  )}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>{EN.VariableImpact}</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>{EN.ModelProcessFlow}</span>
            </div>
            <div className={classnames(styles.cell, styles.cellHeader)}>
              <span>{EN.Report}</span>
            </div>
          </div>
        </div>
        <div className={styles.data}>
          {this.sortModels.map((model, key) => {
            return (
              <ModelDetail
                key={key}
                model={model}
                isSelect={model.id === current.id}
                onSelect={onSelect}
                exportReport={exportReport(model.id)}
                isRecommend={model.id === recommendId}
                mapHeader={mapHeader}
                project={project}
              />
            );
          })}
          {!train2Finished && <div className={styles.rowData}>
            <div className={styles.trainingModel}>
              <Tooltip title={EN.ModelProcessing}>
                {EN.ModelProcessing}
              </Tooltip>
            </div>
            <Show
              name='result_abortButton_REGRESSION'
            >
              <div
                className={`${styles.abortButton} ${styles.abortButtonAll}`}
                onClick={
                  !isAbort
                    ? () => project.abortTrainByEtl()
                    : null
                }
              >
                {isAbort ? (
                  <Icon type="loading" />
                ) : (
                    <span>{EN.AbortTrainingAll}</span>
                  )}
              </div>
            </Show>
          </div>}
          {!train2Finished &&
            stopIds.map((stopId, k) => {
              const trainingModel = trainModel[stopId];
              if (!trainingModel) return null;
              return (
                <div className={styles.rowData} key={k}>
                  <div className={styles.trainingModel}>
                    <Tooltip title={trainingModel.actionKey || EN.TrainingNewModel}>
                      {trainingModel.actionKey || EN.TrainingNewModel}
                    </Tooltip>
                  </div>
                  <ProgressBar progress={trainingModel.value || 0} />
                  <Show
                    name='result_abortButton_REGRESSION'
                  >
                    <div
                      className={styles.abortButton}
                      onClick={
                        !isAbort
                          ? this.abortTrain.bind(null, trainingModel.requestId)
                          : null
                      }
                    >
                      {isAbort ? (
                        <Icon type="loading" />
                      ) : (
                          <span>{EN.AbortTraining}</span>
                        )}
                    </div>
                  </Show>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
