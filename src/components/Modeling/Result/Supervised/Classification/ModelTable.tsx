import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import styles from '../styles.module.css';
import EN from '../../../../../constant/en';
import { Icon, Tooltip } from 'antd';
import ModelDetail from './ModelDetail';
import classnames from 'classnames'
import { Hint } from 'components/Common'
import { ProgressBar, Show } from '../../../../Common';
import Model from 'stores/Model';
import Project from 'stores/Project';
interface Interface {
  abortTrain: (s: string) => void;
  models: Model[]
  sort: {
    key: string,
    value: number
  }
  onSelect: (m: Model) => void
  train2Finished: boolean
  current: Model
  trainModel: unknown
  isAbort: boolean
  recommendId: string
  text: string
  exportReport: (s: string) => () => void
  handleSort: (s: string) => void
  mapHeader: StringObject
  project: Project
  stopIds: string[]
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
        case 'acc':
          return (a.accValidation - b.accValidation) * value;
        case 'auc':
          return (
            (a.score.validateScore.auc - b.score.validateScore.auc) * value
          );
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
    const {
      onSelect,
      train2Finished,
      current,
      trainModel,
      isAbort,
      recommendId,
      text,
      exportReport,
      sort,
      handleSort,
      mapHeader,
      project,
      stopIds,
    } = this.props;
    // const { sortKey, sort } = this
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
              className={classnames(
                styles.cell,
                styles.predict,
                styles.cellHeader,
              )}
            />
            <div
              className={classnames(styles.cell, styles.cellHeader)}
              onClick={handleSort.bind(null, 'acc')}
            >
              <span>
                {EN.Accuracys}
                <Hint content={EN.Givenaparticularpopulation} placement="right" />
                {sort.key !== 'acc' ? (
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
              onClick={handleSort.bind(null, 'auc')}
            >
              <span>
                {EN.PerformanceAUC}
                {sort.key !== 'auc' ? (
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
            {/* <div className={classnames(styles.cell, styles.cellHeader)}><span>Process Flow</span></div> */}
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
                text={text}
                mapHeader={mapHeader}
                project={project}
              />
            );
          })}
          {!train2Finished &&
            stopIds.map((stopId, k) => {
              const trainingModel = trainModel[stopId];
              if (!trainingModel) return null;
              return (
                <div className={styles.rowData} key={k}>
                  <div className={styles.trainingModel}>
                    <Tooltip title={EN.TrainingNewModel}>
                      {EN.TrainingNewModel}
                    </Tooltip>
                  </div>
                  <ProgressBar progress={trainingModel.value || 0} />
                  <Show
                    name="result_abortButton_TWO"
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
