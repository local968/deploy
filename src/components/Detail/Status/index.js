import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import classnames from 'classnames';
import moment from 'moment';
import styles from './list.module.css';
import emptyIcon from './icon-no-report.svg';
import alertIcon from './fail.svg';
import { Popover } from 'antd';
import config from 'config'
// import config from 'config';

@inject('scheduleStore', 'deploymentStore', 'routing')
@observer
export default class List extends Component {
  @action
  selectionOption = (key, value) => () => {
    this.props.deploymentStore.currentDeployment.performanceOptions[key] = value;
    this.props.deploymentStore.currentDeployment.save();
  };
  render() {
    const { deploymentStore, scheduleStore, routing, match } = this.props;
    const cd = deploymentStore.currentDeployment;
    const cdpo = cd.performanceOptions;
    const selectionOption = this.selectionOption;
    return (
      <div className={styles.status}>
        <div className={styles.list}>
          <div className={styles.top}>
            <span className={styles.model}>
              <span className={styles.modelLabel}>Model:</span>
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
                <span className={styles.label}>Validation Data Source</span>
                <span className={styles.text}>{cdpo.source}</span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>Threshold</span>
                <span className={styles.text}>
                  {cdpo.measurementMetric} {cdpo.metricThreshold}
                </span>
              </div>
              <div className={styles.item}>
                <span className={styles.label}>Validation Data Definition</span>
                <span className={classnames(styles.text, styles.download)}>
                  download
                </span>
              </div>
            </div>
            <a
              className={styles.edit}
              onClick={() => {
                selectionOption('enable', false)();
                routing.push(`/deploy/project/${match.params.id}/performance`);
              }}
            >
              Edit
            </a>
          </div>
          {scheduleStore.sortedPerformanceSchedules.length === 0 && <Empty />}
          {scheduleStore.sortedPerformanceSchedules.length > 0 && (
            <div className={styles.table}>
              <div className={styles.head}>
                <span className={styles.modelName}>Model Name</span>
                <span className={styles.modelInvokeTime}>
                  Model Invoke Time
                </span>
                <span className={styles.performance}>Performance</span>
                <span className={styles.threshold}>Threshold</span>
                <span className={styles.status}>Status</span>
                <span className={styles.results}>Results</span>
              </div>
              <div className={styles.list}>
                {scheduleStore.sortedPerformanceSchedules.map(s => (
                  <div className={styles.project} key={s.schedule.id}>
                    <span className={styles.modelName} title={s.schedule.modelName}>{s.schedule.modelName}</span>
                    <span className={styles.modelInvokeTime}>
                      {isNaN(s.schedule.actualTime || s.schedule.estimatedTime)
                        ? s.schedule.actualTime || s.schedule.estimatedTime
                        : moment
                          .unix(
                            s.schedule.actualTime || s.schedule.estimatedTime
                          )
                          .format('DD/MM/YYYY-hh:mma')}
                    </span>
                    <span
                      className={classnames(styles.performance, {
                        [styles.issue]: isExcessThreshold(s.schedule)
                      })}
                    >
                      {s.schedule.result &&
                        s.schedule.status === 'finished' &&
                        (s.schedule.result.problemType === 'Classification'
                          ? `Accuracy:${s.schedule.result.score &&
                          s.schedule.result.score.acc.toFixed(2)} AUC:${s
                            .schedule.result.score &&
                          s.schedule.result.score.auc.toFixed(2)}`
                          : `RMSE:${s.schedule.result.score &&
                          s.schedule.result.score.nrmse.toFixed(2)} R2:${s
                            .schedule.result.score &&
                          s.schedule.result.score.r2.toFixed(2)}`)}
                    </span>
                    <span className={styles.threshold}>
                      {s.schedule.threshold &&
                        `${s.schedule.threshold.type} ${
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
                          <Alert text={s.schedule.result['process error']} />
                        } >
                        <span className={classnames(styles.status, styles.issue)} >
                          Issue
                        </span>
                      </Popover>
                    )}
                    {s.schedule.status === 'finished' && s.schedule.result ? (
                      <a
                        className={styles.results}
                        target="_blank"
                        href={`http://${config.host}:${config.port}/redirect/download/${s.schedule.result.resultPath}?projectId=${cd.projectId}`}
                      >
                        Download
                      </a>
                    ) : (
                        <span className={styles.results}> - </span>
                      )}
                  </div>
                ))}
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
    <img src={emptyIcon} className={styles.emptyIcon} alt="empty" />
    <span className={styles.emptyText}>No deployment report yet</span>
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
  const nameMap = { R2: 'r2', RMSE: 'nrmse', AUC: 'auc', Accurancy: 'acc' };
  console.log(schedule);
  return {
    R2: (threshold, real) => threshold > real,
    RMSE: (threshold, real) => threshold < real,
    Accurancy: (threshold, real) => threshold > real,
    AUC: (threshold, real) => threshold > real
  }[schedule.threshold.type](
    schedule.threshold.value,
    schedule.result.score[nameMap[schedule.threshold.type]]
  );
};
