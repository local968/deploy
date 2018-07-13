import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import classnames from 'classnames';
import { Popover } from 'antd';
import emptyIcon from './icon-no-report.svg';
import alertIcon from './fail.svg';

@inject('deployStore', 'scheduleStore')
@observer
export default class Operation extends Component {
  render() {
    const { deployStore, scheduleStore } = this.props;
    const cd = deployStore.currentDeployment || {};

    return (
      <div className={styles.operation}>
        <div className={styles.info}>
          <span className={styles.model}>Model:{cd.modelName}</span>
        </div>
        {scheduleStore.sortedDeploymentSchedules.length === 0 && <Empty />}
        {scheduleStore.sortedDeploymentSchedules.length > 0 && (
          <div className={styles.table}>
            <div className={styles.head}>
              <span className={styles.modelName}>Model Name</span>
              <span className={styles.deploymentTime}>Deployment Time</span>
              <span className={styles.deploymentStyle}>Deployment Style</span>
              <span className={styles.exeuctionSpeed}>
                Exeuction Speed<small>(row/ms)</small>
              </span>
              <span className={styles.dataSize}>Data Size</span>
              <span className={styles.status}>Status</span>
              <span className={styles.results}>Results</span>
            </div>
            <div className={styles.list}>
              {scheduleStore.sortedDeploymentSchedules.map(s => (
                <div className={styles.project} key={s.schedule.id}>
                  <span
                    className={styles.modelName}
                    title={s.deployment.modelName}
                  >
                    {s.deployment.modelName}
                  </span>
                  <span className={styles.deploymentTime}>
                    {isNaN(s.schedule.actualTime || s.schedule.estimatedTime)
                      ? s.schedule.actualTime || s.schedule.estimatedTime
                      : moment
                          .unix(
                            s.schedule.actualTime || s.schedule.estimatedTime
                          )
                          .format('DD/MM/YYYY-hh:mma')}
                  </span>
                  <span className={styles.deploymentStyle}>
                    Predict with{' '}
                    {s.deployment.deploymentOptions.option === 'data'
                      ? 'DataSource'
                      : 'API Source'}
                  </span>
                  <span className={styles.exeuctionSpeed}>
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
                        <Alert text={s.schedule.result['process error']} />
                      }
                    >
                      <span className={classnames(styles.status, styles.issue)}>
                        Issue
                      </span>
                    </Popover>
                  )}
                  {s.schedule.status === 'finished' && s.schedule.result ? (
                    <a
                      className={styles.results}
                      target="_blank"
                      href={`/api/download?userId=${cd.userId}&projectId=${
                        cd.projectId
                      }&csvLocation=${s.schedule.result.resultPath}`}
                    >
                      Download
                    </a>
                  ) : (
                    <span className={styles.results}> - </span>
                  )}
                </div>
              ))}

              {/* <div className={styles.project}>
              <span className={styles.modelName}>RandomForest.auto23</span>
              <span className={styles.deploymentTime}>12/27/2017-11:23am</span>
              <span className={styles.deploymentStyle}>
                Predict with DataSource
              </span>
              <span className={styles.exeuctionSpeed}>10,000</span>
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
              <span className={styles.exeuctionSpeed}>10,000</span>
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
    <img src={emptyIcon} className={styles.emptyIcon} alt="empty" />
    <span className={styles.emptyText}>No deployment report yet</span>
  </div>
);
