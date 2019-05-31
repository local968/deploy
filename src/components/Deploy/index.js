import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Bread, Select, Pagination, Switch, Search } from 'components/Common';
import { Icon } from 'antd';
import issueIcon from './fail.svg';
import runningIcon from './running.svg';
import normalIcon from './success.svg';
import EN from '../../constant/en';

const deploymentStatus = {
  normal: (
    <span className={styles.normal}>
      <img className={styles.statusIcon} src={normalIcon} alt="normal" />{EN.Normal}
    </span>
  ),
  issue: (
    <span className={styles.issue}>
      <img className={styles.statusIcon} src={issueIcon} alt="issue" />{EN.Issue}
    </span>
  ),
  processing: (
    <span className={styles.running}>
      <img className={styles.statusIcon} src={runningIcon} alt="running" />{EN.Running}
    </span>
  ),
  na: <span className={styles.na}>{EN.NA}</span>
};

@inject('deploymentStore', 'scheduleStore', 'userStore', 'routing')
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
    const { deploymentStore, routing, scheduleStore, userStore } = this.props;
    return (
      <div className={styles.home}>
        <Bread list={[EN.Home]} />
        <div className={styles.filter}>
          <Search
            value={deploymentStore.sortOptions.keywords}
            onChange={value => deploymentStore.changeSort('keywords', value)}
          />
          <Select
            className={styles.selector}
            title={EN.SortBy}
            autoWidth
            options={deploymentStore.sortByOptions}
            value={deploymentStore.sortOptions.sortBy}
            onChange={deploymentStore.changeSort.bind(null, 'sortBy')}
          />
          <Select
            className={styles.selector}
            title={EN.ProPerPage}
            autoWidth
            options={deploymentStore.perPageOptions}
            value={parseInt(deploymentStore.sortOptions.perPage, 10)}
            onChange={(v) => {
              deploymentStore.changeSort('perPage', v)
              deploymentStore.changeSort('currentPage', 1)
            }}
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
              {EN.ProjectName}
            </span>
            <span
              className={styles.modelName}
              onClick={this.toggle(deploymentStore.sortOptions.sortBy, 'modelName')}
            >
              {EN.ModelName}
            </span>
            <span className={styles.enable}>{EN.Enable}</span>
            <span className={styles.deploymentStatus}>{EN.DeploymentStatus}</span>
            <span className={styles.performanceStatus}>{EN.PerformanceStatus}</span>
            <span
              className={styles.createdDate}
              onClick={this.toggle(
                deploymentStore.sortOptions.sortBy,
                'createdDate'
              )}
            >
              {EN.CreatedDate}
            </span>
            <span className={styles.owner}>{EN.Owner}</span>
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
                    routing.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {deployment.projectName}
                </span>
                <span
                  className={styles.modelName}
                  title={deployment.modelName}
                  onClick={() =>
                    routing.push(`/deploy/project/${deployment.id}`)
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
                    routing.push(`/deploy/project/${deployment.id}`)
                  }
                >
                  {moment.unix(deployment.createdDate).format('M/D/YYYY')}
                </span>
                <span className={styles.owner} title={deployment.owner}>
                  {userStore.info.email}
                </span>
                <span
                  className={styles.delete}
                  onClick={() => {
                    if (window.confirm('Are you sure to delete this model deployment? This action cannot be recovered.'))
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
