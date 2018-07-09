import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { observable, action, runInAction } from 'mobx';
import classnames from 'classnames';
import moment from 'moment';
import styles from './list.module.css';
import emptyIcon from './icon-no-report.svg';

@inject('scheduleStore', 'deployStore', 'routing')
@observer
export default class List extends Component {
  @action
  selectionOption = (key, value) => () => {
    this.props.deployStore.currentDeployment.performanceOptions[key] = value;
    this.props.deployStore.currentDeployment.save();
  };
  constructor(props) {
    super(props);
  }
  render() {
    const { deployStore, scheduleStore, routing, match } = this.props;
    const cd = deployStore.currentDeployment;
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
                        .format('DD/MM/YYYY-hh:mma')}
                    </span>
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
