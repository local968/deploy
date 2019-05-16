import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import classnames from 'classnames';
import { Popover } from 'antd';
import emptyIcon from './icon-no-report.svg';
import alertIcon from './fail.svg';
import config from 'config'
import EN from '../../../constant/en';
import {formatNumber} from "util";
const transferR2 = (str) => str === 'R2' ? 'R²' : str
@inject('deploymentStore', 'scheduleStore')
@observer
export default class Operation extends Component {
  showScore = (score, type) => {
    console.log(formatNumber(score[type]))
    let s
    if (score && score[type]) s = formatNumber(score[type], 2)
    return s || ''
  }


  render() {
    const { deploymentStore, scheduleStore } = this.props;
    const cd = deploymentStore.currentDeployment || {};
    console.log(scheduleStore.sortedDeploymentSchedules , 'scheduleStore.sortedDeploymentSchedules')
    return (
      <div className={styles.operation}>
        <div className={styles.info}>
          <span className={styles.model}>{EN.Model}: {cd.modelName}</span>
        </div>
        {scheduleStore.sortedDeploymentSchedules.length === 0 && <Empty />}
        {scheduleStore.sortedDeploymentSchedules.length > 0 && (
          <div className={styles.table}>
            <div className={styles.head}>
              <span className={styles.modelName}>{EN.ModelName}</span>
              <span className={styles.deploymentTime}>{EN.DeploymentTime}</span>
              <span className={styles.deploymentStyle}>{EN.DeploymentStyle}</span>
              <span className={styles.executionSpeed}>{EN.ExecutionSpeed} <small>{EN.Rowss}</small></span>
              <span className={styles.dataSize}>{EN.TotalLines}</span>
              <span className={styles.performance}>{EN.Performance}</span>
              <span className={styles.threshold}>{EN.Threshold}</span>
              <span className={styles.status}>{EN.Status}</span>
              <span className={styles.results}>{EN.Results}</span>
            </div>
            <div className={styles.list}>
              {scheduleStore.sortedDeploymentSchedules.map(s => (
                <div className={styles.project} key={s.schedule.id}>
                  <span className={styles.modelName} title={s.schedule.modelName}>{s.schedule.modelName}</span>
                  <span className={styles.deploymentTime}>
                    {isNaN(s.schedule.actualTime || s.schedule.estimatedTime)
                      ? s.schedule.actualTime || s.schedule.estimatedTime
                      : moment
                        .unix(
                          s.schedule.actualTime || s.schedule.estimatedTime
                        )
                        .format('MM/DD/YYYY-hh:mma')}
                  </span>
                  <span className={styles.deploymentStyle}>
                    {EN.Predictwith}{' '}
                    {s.deployment.deploymentOptions.option === 'data'
                      ? EN.DataSource
                      : EN.APISource}
                  </span>
                  <span className={styles.executionSpeed}>
                    {s.schedule.status === 'finished'
                      ? s.schedule.result && s.schedule.result.executeSpeed
                      : ' - '}
                  </span>
                  <span className={styles.dataSize}>
                    {s.schedule.status === 'finished'
                      ? s.schedule.result && s.schedule.result.totalLines
                      : ' - '}
                  </span>

                  <span
                    className={classnames(styles.performance, {
                      [styles.issue]: isExcessThreshold(s.schedule)
                    })}
                  >
                      {s.schedule.result &&
                      s.schedule.status === 'finished' &&
                      (s.deployment.modelType === 'Outlier'
                        ? `Accuracy:${this.showScore(s.schedule.result.score, 'acc')}`
                        : `MSE:${this.showScore(s.schedule.result.score, 'mse')} RMSE:${this.showScore(s.schedule.result.score, 'rmse')} R²:${this.showScore(s.schedule.result.score, 'r2')}`)}
                    </span>
                  <span className={styles.threshold}>
                      {s.schedule.threshold &&
                      `${transferR2(s.schedule.threshold.type)}:${
                        s.schedule.threshold.value
                        }`}
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
                      <span className={classnames(styles.status, styles.issue)}>
                        {EN.Issue}
                      </span>
                    </Popover>
                  )}
                  {s.schedule.status === 'finished' && s.schedule.result ? (
                    <a
                      className={styles.results}
                      target="_blank"
                      href={`http://${config.host}:${config.port}/upload/download/${s.schedule.id}?filename=${cd.deploymentOptions.file}-${moment
                        .unix(
                          s.schedule.actualTime || s.schedule.estimatedTime
                        )
                        .format('MM-DD-YYYY_hh-mm')}-predict.csv`}
                    >{EN.Download}</a>) : (<span className={styles.results}> - </span>)}
                </div>
              ))}

              {/* <div className={styles.project}>
              <span className={styles.modelName}>RandomForest.auto23</span>
              <span className={styles.deploymentTime}>12/27/2017-11:23am</span>
              <span className={styles.deploymentStyle}>
                Predict with DataSource
              </span>
              <span className={styles.executionSpeed}>10,000</span>
              <span className={styles.dataSize}>100,000</span>
              <span className={styles.status}>Success</span>
              <span className={styles.results}>Download</span>
            </div>
            <div className={styles.project}>
              <span className={styles.modelName}>RandomForest.auto23</span>
              <span className={styles.deploymentTime}>12/27/2017-11:23am</span>
              <span className={styles.deploymentStyle}>
                Predict with DataSource
              </span>
              <span className={styles.executionSpeed}>10,000</span>
              <span className={styles.dataSize}>100,000</span>
              <Popover
                placement="left"
                overlayClassName={styles.popover}
                content={<Alert />}
              >
                <span className={classnames(styles.status, styles.issue)}>
                  Issue
                </span>
              </Popover>
              <span className={styles.results}>Download</span>
            </div> */}
            </div>
          </div>
        )}
      </div>
    );
  }
}

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

const Empty = () => (
  <div className={styles.emptyTable}>
    <img src={emptyIcon} className={styles.emptyIcon} alt={EN.Empty} />
    <span className={styles.emptyText}>{EN.NoDeploymentReportYet}</span>
  </div>
);

const isExcessThreshold = schedule => {
  if (!schedule.result || !schedule.result.score) return false;
  if (!schedule.threshold || !schedule.threshold.type || !schedule.threshold.value) return false
  const nameMap = { R2: 'r2', RMSE: 'rmse', MSE: 'mse', AUC: 'auc', Accuracy: 'acc', F1: 'f1', Precision: 'precision', Recall: 'recall' };
  return {
    R2: (threshold, real) => threshold > real,
    RMSE: (threshold, real) => threshold < real,
    MSE: (threshold, real) => threshold < real,
    Accuracy: (threshold, real) => threshold > real,
    AUC: (threshold, real) => threshold > real,
    F1: (threshold, real) => threshold > real,
    Precision: (threshold, real) => threshold > real,
    Recall: (threshold, real) => threshold > real
  }[schedule.threshold.type](
    schedule.threshold.value,
    schedule.result.score[nameMap[schedule.threshold.type]]
  );
};
