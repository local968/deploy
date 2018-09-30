import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Bread, Select, Pagination, Switch, Search } from 'components/Common';
import { Icon } from 'antd';
import issueIcon from './fail.svg';
import runningIcon from './running.svg';
import normalIcon from './success.svg';

const deploymentStatus = {
  normal: (
    <span className={styles.normal}>
      <img className={styles.statusIcon} src={normalIcon} alt="normal" />Normal
    </span>
  ),
  issue: (
    <span className={styles.issue}>
      <img className={styles.statusIcon} src={issueIcon} alt="issue" />Issue
    </span>
  ),
  processing: (
    <span className={styles.running}>
      <img className={styles.statusIcon} src={runningIcon} alt="running" />Running
    </span>
  ),
  na: <span className={styles.na}>N/A</span>
};

@inject('deploymentStore', 'scheduleStore')
@observer
export default class Home extends Component {
  toggle = (currentType, targetType) => () => {
    if (currentType === targetType) {
      this.props.deploymentStore.changeSort(
        'sortBy',
        targetType.startsWith('r')
          ? targetType.slice(1, targetType.length)
          : 'r' + targetType
      );
    } else {
      this.props.deploymentStore.changeSort('sortBy', targetType);
    }
  };
  render() {
    const { deploymentStore, history, scheduleStore } = this.props;
    return (
      <div className={styles.home}>
        <Bread list={['Home']} />
        <div className={styles.filter}>
          <Search
            value={deploymentStore.sortOptions.keywords}
            onChange={value => deploymentStore.changeSort('keywords', value)}
          />
          <Select
            className={styles.selector}
            title="Sort by"
            autoWidth
            options={deploymentStore.sortByOptions}
            value={deploymentStore.sortOptions.sortBy}
            onChange={deploymentStore.changeSort.bind(null, 'sortBy')}
          />
          <Select
            className={styles.selector}
            title="per page"
            autoWidth
            options={deploymentStore.perPageOptions}
            value={parseInt(deploymentStore.sortOptions.perPage, 10)}
            onChange={deploymentStore.changeSort.bind(null, 'perPage')}
          />
          <Pagination
            current={deploymentStore.sortOptions.currentPage}
            pageSize={parseInt(deploymentStore.sortOptions.perPage, 10)}
            total={deploymentStore.totalCount}
            onChange={deploymentStore.changeSort.bind(null, 'currentPage')}
          />
        </div>
        <div className={styles.listWrapper}>
          <div className={styles.head}>
            <span
              className={styles.projectName}
              onClick={this.toggle(
                deploymentStore.sortOptions.sortBy,
                'projectName'
              )}
            >
              Project Name
            </span>
            <span
              className={styles.modelName}
              onClick={this.toggle(deploymentStore.sortOptions.sortBy, 'modelName')}
            >
              Model Name
            </span>
            <span className={styles.enable}>Enable</span>
            <span className={styles.deploymentStatus}>Deployment Status</span>
            <span className={styles.performanceStatus}>Performance Status</span>
            {/* <span className={styles.operationAlert}>Operation Alert</span>
            <span className={styles.performanceAlert}>Performance Alert</span> */}
            <span
              className={styles.createdDate}
              onClick={this.toggle(
                deploymentStore.sortOptions.sortBy,
                'createdDate'
              )}
            >
              Created Date
            </span>
            <span className={styles.owner}>Owner</span>
            <span className={styles.delete} />
          </div>
          <div className={styles.list}>
            {deploymentStore.sortedDeployments.map(deployment => (
              <div
                key={deployment.id}
                data-id={deployment.id}
                className={styles.project}
              >
                <span
                  className={styles.projectName}
                  title={deployment.projectName}
                  onClick={() =>
                    history.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {deployment.projectName}
                </span>
                <span
                  className={styles.modelName}
                  title={deployment.modelName}
                  onClick={() =>
                    history.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {deployment.modelName}
                </span>
                <span className={styles.enable}>
                  <Switch
                    checked={deployment && deployment.enable}
                    onChange={() => {
                      deploymentStore.toggleEnable(deployment.id);
                    }}
                  />
                </span>
                <span
                  className={styles.deploymentStatus}
                  title={
                    scheduleStore.schedules &&
                    scheduleStore.getLastSchedule(deployment.id, 'deployment')
                      .status
                  }
                >
                  {deploymentStatus[
                    scheduleStore.schedules &&
                      scheduleStore.getLastSchedule(deployment.id, 'deployment')
                        .status
                  ] || deploymentStatus['normal']}
                </span>
                <span
                  className={styles.performanceStatus}
                  title={
                    scheduleStore.schedules &&
                    scheduleStore.getLastSchedule(deployment.id, 'performance')
                      .status
                  }
                >
                  {deploymentStatus[
                    scheduleStore.schedules &&
                      scheduleStore.getLastSchedule(
                        deployment.id,
                        'performance'
                      ).status
                  ] || deploymentStatus['normal']}
                </span>
                {/* <span
                  className={styles.operationAlert}
                  title={deployment.operationAlert || 0}
                  onClick={() =>
                    history.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {deployment.operationAlert || 0}
                </span>
                <span
                  className={styles.performanceAlert}
                  title={deployment.performanceAlert || 0}
                  onClick={() =>
                    history.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {deployment.performanceAlert || 0}
                </span> */}
                <span
                  className={styles.createdDate}
                  title={moment.unix(deployment.createdDate).format('M/D/YYYY')}
                  onClick={() =>
                    history.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {moment.unix(deployment.createdDate).format('M/D/YYYY')}
                </span>
                <span className={styles.owner} title={deployment.owner}>
                  {deployment.userId}
                </span>
                <span
                  className={styles.delete}
                  onClick={() => {
                    deploymentStore.delete(deployment.id);
                  }}
                >
                  <Icon type="delete" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
