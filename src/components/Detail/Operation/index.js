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
import { observable } from 'mobx';
import Summary from '../Summary'
import { Modal } from '../../Common'

@inject('deploymentStore', 'scheduleStore')
@observer
export default class Operation extends Component {
  render() {
    const { deploymentStore, scheduleStore } = this.props;
    const cd = deploymentStore.currentDeployment || {};
    const cddo = deploymentStore.currentDeployment.deploymentOptions
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
              <span className={styles.results}>{EN.DeploySummary}</span>
            </div>
            <div className={styles.list}>
              {scheduleStore.sortedDeploymentSchedules.map(s => <ScheduleOperation cddo={cddo} schedule={s} key={s.schedule.id} />)}

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
@inject('socketStore')
@observer
class ScheduleOperation extends Component {
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
      .then(api => api.getScheduleSummary({ sid: schedule.schedule.id, pid: schedule.deployment.projectId, problemType: schedule.deployment.modelType }))
      .then(result => {
        this.summary = { ...result.result, mapHeader: schedule.deployment.mapHeader, target: [] }
        this.loading = false
        this.finished = true
      })
  }

  onClose = () => {
    this.visible = false
  }

  render() {
    const { cddo, schedule: s } = this.props
    return <div className={styles.project} key={s.schedule.id}>
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
        {EN.Predictwith}{' '}{EN.DataSource}
        <br /><span title={s.schedule.file}>{s.schedule.file}</span>
        {/* {s.deployment.deploymentOptions.option === 'data'
    ? EN.DataSource
    : EN.APISource} */}

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
          href={`/upload/download/${s.schedule.id}?filename=${typeof cddo.file === 'string' ? cddo.file : cddo.sourceOptions.databaseType}-${moment
            .unix(
              s.schedule.actualTime || s.schedule.estimatedTime
            )
            .format('MM-DD-YYYY_hh-mm')}-predict.csv`}
        >{EN.Download}</a>) : (<span className={styles.emptyResults}> - </span>)}
      {s.schedule.status === 'finished' ? <a
        onClick={this.showSummary}
        className={styles.results}><span className={styles.status}>{EN.DeploySummaryData}</span>
      </a> : <span className={styles.emptyResults}> - </span>}
      {<Modal
        content={<Summary summary={this.summary} onClose={this.onClose} loading={this.loading} hasTarget={false} />}
        visible={this.visible}
        width="12em"
        title={EN.DeploySummary}
        onClose={this.onClose}
        closeByMask={true}
        showClose={true}
      />}
    </div>
  }
}
