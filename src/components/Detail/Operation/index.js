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

@inject('deploymentStore', 'scheduleStore')
@observer
export default class Operation extends Component {
  render() {
    const { deploymentStore, scheduleStore } = this.props;
    const cd = deploymentStore.currentDeployment || {};
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
