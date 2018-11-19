import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import moment from 'moment';
import styles from './list.module.css';
import emptyIcon from './icon-no-report.svg';
// import alertIcon from './fail.svg';

@inject('scheduleStore')
@observer
export default class List extends Component {
  render() {
    const { cd, cdpo, selectionOption, scheduleStore } = this.props;
    return (
      <div className={styles.list}>
        <div className={styles.top}>
          <span className={styles.model}>
            <span className={styles.modelLabel}>Model:</span>
            <span className={styles.topModelName} title={cd.modelName}>
              {cd.modelName}
            </span>
            {/* <img className={styles.infoIcon} src={infoIcon} alt="info" /> */}
          </span>
          <div className={styles.items}>
            <div className={styles.item}>
              <span className={styles.label}>Next Monitor Date</span>
              <span className={styles.text}>01/07/2018</span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Validation Data Source</span>
              <span className={styles.text}>{cdpo.source}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Threshold</span>
              <span className={styles.text}>
                {cdpo.measurementMetric}{' '}
                {cd.modelType === 'Classification' ? ' < ' : ' > '}
                {cdpo.metricThreshold}%
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>
                Validation Data Definition
                {/* <img
                  className={styles.helpIcon}
                  src={helpIcon}
                  alt="help"
                /> */}
              </span>
              <span className={classnames(styles.text, styles.download)}>
                download
              </span>
            </div>
          </div>
          <a className={styles.edit} onClick={selectionOption('enable', false)}>
            Edit
          </a>
        </div>
        {scheduleStore.sortedPerformanceSchedules.length === 0 && <Empty />}
        {scheduleStore.sortedPerformanceSchedules.length > 0 && (
          <div className={styles.table}>
            <div className={styles.head}>
              <span className={styles.modelName}>Model Name</span>
              <span className={styles.modelInvokeTime}>Model Invoke Time</span>
              <span className={styles.performance}>Performance</span>
              <span className={styles.threshold}>Threshold</span>
            </div>
            <div className={styles.list}>
              {scheduleStore.sortedPerformanceSchedules.map(s => (
                <div className={styles.project} key={s.schedule.id}>
                  <span
                    className={styles.modelName}
                    title={s.deployment.modelName}
                  >
                    {s.deployment.modelName}
                  </span>
                  <span className={styles.modelInvokeTime}>
                    {moment
                      .unix(s.schedule.actualTime || s.schedule.estimatedTime)
                      .format('MM/DD/YYYY-hh:mma')}
                  </span>
                  {/* <Popover
                  placement="left"
                  overlayClassName={styles.popover}
                  content={<Alert />}
                >
                  <span
                    className={classnames(styles.performance, styles.issue)}
                  >
                    Issue
                  </span>
                </Popover> */}
                  <span className={styles.performance}>
                    {s.schedule.status}
                  </span>
                  <span className={styles.threshold}>
                    {cdpo.measurementMetric}{' '}
                    {cd.modelType === 'Classification' ? ' < ' : ' > '}
                    {cdpo.metricThreshold}%
                  </span>
                </div>
              ))}
              {/* <div className={styles.project}>
              <span className={styles.modelName}>RandomForest.auto23</span>
              <span className={styles.modelInvokeTime}>12/15/2017-10:00am</span>
              <Popover
                placement="left"
                overlayClassName={styles.popover}
                content={<Alert />}
              >
                <span className={classnames(styles.performance, styles.issue)}>
                  AUC 60%
                </span>
              </Popover>
              <span className={styles.threshold}>AUC 80%</span>
            </div> */}
            </div>
          </div>
        )}
      </div>
    );
  }
}

// const Alert = () => (
//   <div className={styles.alert}>
//     <div className={styles.alertHead}>
//       <img className={styles.alertIcon} src={alertIcon} alt="alert" />Alert
//     </div>
//     <div className={styles.alertContent}>
//       Can not find the data source file from the path{' '}
//       <span className={styles.path}>D://user/deployment/results</span>
//       <br />Please check the file if it has been moved.
//     </div>
//   </div>
// );

const Empty = () => (
  <div className={styles.emptyTable}>
    <img src={emptyIcon} className={styles.emptyIcon} alt="empty" />
    <span className={styles.emptyText}>No deployment report yet</span>
  </div>
);
