import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import classnames from 'classnames';
import moment from 'moment';
import styles from './list.module.css';
import emptyIcon from './icon-no-report.svg';
import alertIcon from './fail.svg';
import { Popover } from 'antd';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import {
  Show, Modal,
} from 'components/Common';
import Summary from '../Summary';

const transferR2 = str => (str === 'R2' ? 'R²' : str);

interface Interface {
  deploymentStore: any
  scheduleStore: any
  routing: any
  match: any
}

@inject('scheduleStore', 'deploymentStore', 'routing')
@observer
export default class List extends Component<Interface> {
  @action
  selectionOption = (key, value) => () => {
    this.props.deploymentStore.currentDeployment.performanceOptions[
      key
    ] = value;
    return this.props.deploymentStore.currentDeployment.save();
  };

  render() {
    const { deploymentStore, scheduleStore, routing, match } = this.props;
    const cd = deploymentStore.currentDeployment;
    const cdpo = cd.performanceOptions;
    const selectionOption = this.selectionOption;
    console.log(
      scheduleStore.sortedPerformanceSchedules,
      'scheduleStore.sortedPerformanceSchedules',
    );
    return (
      <div className={styles.status}>
        <div className={styles.list}>
          <div className={styles.top}>
            <span className={styles.model}>
              <span className={styles.modelLabel}>{EN.Model}:</span>
              <span className={styles.topModelName} title={cd.modelName}>
                {cd.modelName}
              </span>
            </span>
            <div className={styles.items}>
              {/* <div className={styles.item}>
                <span className={styles.label}>Next Monitor Date</span>
                <span className={styles.text}>01/07/2018</span>
              </div> */}
              <div className={styles.item}>
                <span className={styles.label}>{EN.ValidationDataSource}</span>
                <span className={styles.text}>{cdpo.source}</span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>{EN.Threshold}</span>
                <span className={styles.text}>
                  {transferR2(cdpo.measurementMetric)}:{cdpo.metricThreshold}
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>
                  {EN.ValidationDataDefinition}
                </span>
                <a
                  href={`/upload/dataDefinition?projectId=${cd.projectId}&type=performance`}
                  className={classnames(styles.text, styles.download)}
                >
                  {EN.Download}
                </a>
              </div>
            </div>
            <Show
              name='status_operate'
            >
              <a
                className={styles.edit}
                onClick={() => {
                  selectionOption('enable', false)();
                  routing.push(`/deploy/project/${match.params.id}/performance`);
                }}
              >
                {EN.Edit}
              </a>
            </Show>

          </div>
          {scheduleStore.sortedPerformanceSchedules.length === 0 && <Empty />}
          {scheduleStore.sortedPerformanceSchedules.length > 0 && (
            <div className={styles.table}>
              <div className={styles.head}>
                <span className={styles.modelName}>{EN.ModelName}</span>
                <span className={styles.modelInvokeTime}>
                  {EN.ModelInvokeTime}
                </span>
                <span className={styles.deploymentStyle}>
                  {EN.DeploymentStyle}
                </span>
                <span className={styles.executionSpeed}>
                  {EN.ExecutionSpeed} <small>{EN.Rowss}</small>
                </span>
                <span className={styles.performance}>{EN.Performance}</span>
                <span className={styles.threshold}>{EN.Threshold}</span>
                <span className={styles.status}>{EN.Status}</span>
                <span className={styles.results}>{EN.Results}</span>
                <span className={styles.results}>{EN.DeploySummary}</span>
              </div>
              <div className={styles.list}>
                {scheduleStore.sortedPerformanceSchedules.map(s => <SchedulePerformance schedule={s} cdpo={cdpo} key={s.schedule.id} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const Empty = () => (
  <div className={styles.emptyTable}>
    <img src={emptyIcon} className={styles.emptyIcon} alt={EN.Empty} />
    <span className={styles.emptyText}>{EN.NoDeploymentReportYet}</span>
  </div>
);

const Alert = ({ text }) => (
  <div className={styles.alert}>
    <div className={styles.alertHead}>
      <img className={styles.alertIcon} src={alertIcon} alt="alert" />
    </div>
    <div className={styles.alertContent}>
      {text}
      {/* Can not find the data source file from the path{' '}
      <span className={styles.path}>D://user/deployment/results</span>
      <br />Please check the file if it has been moved. */}
    </div>
  </div>
);

const isExcessThreshold = schedule => {
  if (!schedule.result || !schedule.result.score) return false;
  if (
    !schedule.threshold ||
    !schedule.threshold.type ||
    !schedule.threshold.value
  )
    return false;
  const nameMap = {
    R2: 'r2',
    RMSE: 'rmse',
    MSE: 'mse',
    AUC: 'auc',
    Accuracy: 'acc',
    F1: 'f1',
    Precision: 'precision',
    Recall: 'recall',
    CVNN: 'CVNN',
    CH: 'CH',
    Silhouette_Score: 'silhouette_euclidean',
  };
  return {
    R2: (threshold, real) => threshold > real,
    RMSE: (threshold, real) => threshold < real,
    MSE: (threshold, real) => threshold < real,
    Accuracy: (threshold, real) => threshold > real,
    AUC: (threshold, real) => threshold > real,
    F1: (threshold, real) => threshold > real,
    Precision: (threshold, real) => threshold > real,
    Recall: (threshold, real) => threshold > real,
    CVNN: (threshold, real) => threshold > real,
    CH: (threshold, real) => threshold > real,
    silhouette_euclidean: (threshold, real) => threshold > real,
  }[schedule.threshold.type](
    schedule.threshold.value,
    schedule.result.score[nameMap[schedule.threshold.type]],
  );
};

interface SchedulePerformanceProps {
  socketStore?: any,
  schedule: any,
  cdpo: any
}

@inject('socketStore')
@observer
class SchedulePerformance extends Component<SchedulePerformanceProps> {
  @observable visible = false
  @observable loading = false
  @observable finished = false
  @observable summary = {}

  showSummary = () => {
    if (this.visible) return
    if (this.finished) return this.visible = true
    this.loading = true
    this.visible = true
    const { socketStore, schedule } = this.props
    socketStore.ready()
      .then(api => api.getScheduleSummary({ sid: schedule.schedule.id, pid: schedule.deployment.projectId }))
      .then(result => {
        this.summary = { ...result.result, mapHeader: schedule.deployment.mapHeader, problemType: schedule.deployment.modelType }
        this.loading = false
        this.finished = true
      })
  }

  onClose = () => {
    this.visible = false
  }

  showScore = (score, type) => {
    let s;
    if (score && score[type]) s = formatNumber(score[type], 2);
    return s || 0;
  };

  render() {
    const { cdpo, schedule: s } = this.props
    return (
      <div className={styles.project} >
        <span
          className={styles.modelName}
          title={s.schedule.modelName}
        >
          {s.schedule.modelName}
        </span>
        <span className={styles.modelInvokeTime}>
          {isNaN(s.schedule.actualTime || s.schedule.estimatedTime)
            ? s.schedule.actualTime || s.schedule.estimatedTime
            : moment
              .unix(
                s.schedule.actualTime || s.schedule.estimatedTime,
              )
              .format('MM/DD/YYYY-hh:mma')}
        </span>

        <span className={styles.deploymentStyle}>
          {EN.Predictwith} {EN.DataSource}
          {/* {s.deployment.performanceOptions.source === 'file' || s.deployment.performanceOptions.source === 'database'
            ? EN.DataSource
            : EN.APISource} */}
        </span>
        <span className={styles.executionSpeed}>
          {s.schedule.status === 'finished'
            ? s.schedule.result && s.schedule.result.executeSpeed
            : ' - '}
        </span>

        {s.deployment.modelType === 'Classification' && (
          <span
            className={classnames(styles.performance, {
              [styles.issue]: isExcessThreshold(s.schedule),
            })}
          >
            {s.schedule.result && s.schedule.status === 'finished'
              ? `Accuracy:${this.showScore(
                s.schedule.result.score,
                'acc',
              )} AUC:${this.showScore(
                s.schedule.result.score,
                'auc',
              )} F1:${this.showScore(
                s.schedule.result.score,
                'f1',
              )} Precision:${this.showScore(
                s.schedule.result.score,
                'precision',
              )} Recall:${this.showScore(
                s.schedule.result.score,
                'recall',
              )}`
              : ' - '}
          </span>
        )}

        {s.deployment.modelType === 'Regression' && (
          <span
            className={classnames(styles.performance, {
              [styles.issue]: isExcessThreshold(s.schedule),
            })}
          >
            {s.schedule.result && s.schedule.status === 'finished'
              ? `MSE:${this.showScore(
                s.schedule.result.score,
                'mse',
              )} RMSE:${this.showScore(
                s.schedule.result.score,
                'rmse',
              )} R²:${this.showScore(
                s.schedule.result.score,
                'r2',
              )}`
              : ' - '}
          </span>
        )}

        {s.deployment.modelType === 'Outlier' && (
          <span
            className={classnames(styles.performance, {
              [styles.issue]: isExcessThreshold(s.schedule),
            })}
          >
            {s.schedule.result && s.schedule.status === 'finished'
              ? `Accuracy:${this.showScore(
                s.schedule.result.score,
                'score',
              )}`
              : ' - '}
          </span>
        )}

        {s.deployment.modelType === 'Clustering' && (
          <span
            className={classnames(styles.performance, {
              [styles.issue]: isExcessThreshold(s.schedule),
            })}
          >
            {s.schedule.result && s.schedule.status === 'finished'
              ? `CVNN:${this.showScore(
                s.schedule.result.score,
                'CVNN',
              )} CH:${this.showScore(
                s.schedule.result.score,
                'CH',
              )} Silhouette Score:${this.showScore(
                s.schedule.result.score,
                'silhouette_euclidean',
              )}`
              : ' - '}
          </span>
        )}

        {/*<span*/}
        {/*  className={classnames(styles.performance, {*/}
        {/*    [styles.issue]: isExcessThreshold(s.schedule)*/}
        {/*  })}*/}
        {/*>*/}
        {/*  {*/}
        {/*    s.schedule.result &&*/}
        {/*    s.schedule.status === 'finished' &&*/}
        {/*    (s.schedule.result.problemType === 'Classification'*/}
        {/*      ? `Accuracy:${this.showScore(s.schedule.result.score, 'acc')} AUC:${this.showScore(s.schedule.result.score, 'auc')} F1:${this.showScore(s.schedule.result.score, 'f1')} Precision:${this.showScore(s.schedule.result.score, 'precision')} Recall:${this.showScore(s.schedule.result.score, 'recall')}`*/}
        {/*      : `MSE:${this.showScore(s.schedule.result.score, 'mse')} RMSE:${this.showScore(s.schedule.result.score, 'rmse')} R²:${this.showScore(s.schedule.result.score, 'r2')}`)*/}
        {/*  }*/}
        {/*  {*/}
        {/*    s.schedule.result &&*/}
        {/*    s.schedule.status === 'finished' &&*/}
        {/*    (s.schedule.result.problemType === 'Outlier'*/}
        {/*      ? `Accuracy:${this.showScore(s.schedule.result.score, 'acc')}`*/}
        {/*      : `CVNN:${this.showScore(s.schedule.result.score, 'cvnn')} CH:${this.showScore(s.schedule.result.score, 'ch')} Silhouette Score:${this.showScore(s.schedule.result.score, 'silhouette_score')}`)*/}
        {/*  }*/}
        {/*</span>*/}
        <span className={styles.threshold}>
          <span>
            {s.schedule.threshold &&
              `${transferR2(s.schedule.threshold.type)}:`}
            {/*</span>*/}
            {/*<br />*/}
            {/*<span>*/}
            {s.schedule.threshold &&
              `${s.schedule.threshold.value}`}
          </span>
        </span>
        {s.schedule.status !== 'issue' && (
          <span className={styles.status}>
            {s.schedule.status[0].toUpperCase() +
              s.schedule.status.substr(1, s.schedule.status.lenght)}
          </span>
        )}
        {s.schedule.status === 'issue' && (
          <Popover
            placement="left"
            overlayClassName={styles.popover}
            content={
              <Alert text={s.schedule.result['processError']} />
            }
          >
            <span
              className={classnames(styles.status, styles.issue)}
            >
              {EN.Issue}
            </span>
          </Popover>
        )}
        {s.schedule.status === 'finished' && s.schedule.result ? (
          <a
            className={styles.results}
            target="_blank"
            href={`/upload/download/${s.schedule.id}?filename=${
              typeof cdpo.file === 'string'
                ? cdpo.file
                : cdpo.sourceOptions.databaseType
              }-${moment
                .unix(
                  s.schedule.actualTime || s.schedule.estimatedTime,
                )
                .format('MM-DD-YYYY_hh-mm')}-predict.csv`}
          >
            {EN.Download}
          </a>
        ) : (
            <span className={styles.emptyResults}> - </span>
          )}
        {s.schedule.status === 'finished' ? <a
          onClick={this.showSummary}
          className={styles.results}><span className={styles.status}>{EN.DeploySummaryData}</span>
        </a> : <span className={styles.emptyResults}> - </span>}
        {<Modal
          content={<Summary summary={this.summary} onClose={this.onClose} loading={this.loading} hasTarget={!['Clustering', 'Outlier'].includes(s.deployment.modelType)} />}
          visible={this.visible}
          width="12em"
          title={EN.DeploySummary}
          onClose={this.onClose}
          closeByMask={true}
          showClose={true}
        />}
      </div>
    )
  }
}
