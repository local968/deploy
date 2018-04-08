import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Bread, Select, Pagination, Switch } from 'components/Common';
import searchButton from './search-icon.svg';
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
  running: (
    <span className={styles.running}>
      <img className={styles.statusIcon} src={runningIcon} alt="running" />Running
    </span>
  ),
  na: <span className={styles.na}>N/A</span>
};

@inject('deployStore')
@observer
export default class Home extends Component {
  toggle = (currentType, targetType) => () => {
    if (currentType === targetType) {
      this.props.deployStore.changeSort(
        'sortBy',
        targetType.startsWith('r')
          ? targetType.slice(1, targetType.length)
          : 'r' + targetType
      );
    } else {
      this.props.deployStore.changeSort('sortBy', targetType);
    }
  };
  render() {
    const { deployStore, history } = this.props;
    return (
      <div className={styles.home}>
        <Bread list={['Home']} />
        <div className={styles.filter}>
          <div className={styles.search}>
            <input
              type="text"
              className={styles.searchName}
              value={deployStore.sortOptions.keywords}
              onChange={event =>
                deployStore.changeSort('keywords', event.target.value)
              }
            />
            <a className={styles.submit}>
              <img
                className={styles.searchButton}
                src={searchButton}
                alt="search"
              />
            </a>
          </div>
          <Select
            title="Sort by"
            autoWidth
            options={deployStore.sortByOptions}
            value={deployStore.sortOptions.sortBy}
            onChange={deployStore.changeSort.bind(null, 'sortBy')}
          />
          <Select
            title="Projects per page"
            autoWidth
            options={deployStore.perPageOptions}
            value={parseInt(deployStore.sortOptions.perPage, 10)}
            onChange={deployStore.changeSort.bind(null, 'perPage')}
          />
          <Pagination
            current={deployStore.sortOptions.currentPage}
            pageSize={parseInt(deployStore.sortOptions.perPage, 10)}
            total={deployStore.totalCount}
            onChange={deployStore.changeSort.bind(null, 'currentPage')}
          />
        </div>
        <div className={styles.listWrapper}>
          <div className={styles.head}>
            <span
              className={styles.projectName}
              onClick={this.toggle(
                deployStore.sortOptions.sortBy,
                'projectName'
              )}
            >
              Project Name
            </span>
            <span
              className={styles.modelName}
              onClick={this.toggle(deployStore.sortOptions.sortBy, 'modelName')}
            >
              Model Name
            </span>
            <span className={styles.enable}>Enable</span>
            <span className={styles.deploymentStatus}>Deployment Status</span>
            <span className={styles.operationAlert}>Operation Alert</span>
            <span className={styles.performanceAlert}>Performance Alert</span>
            <span
              className={styles.createdDate}
              onClick={this.toggle(
                deployStore.sortOptions.sortBy,
                'createdDate'
              )}
            >
              Created Date
            </span>
            <span className={styles.owner}>Owner</span>
          </div>
          <div className={styles.list}>
            {deployStore.sortedDeployments.map(deployment => (
              <div key={deployment.id} className={styles.project}>
                <span
                  className={styles.projectName}
                  title={deployment.name}
                  onClick={() => history.push(`/project/${deployment.id}`)}
                >
                  {deployment.name}
                </span>
                <span
                  className={styles.modelName}
                  title={deployment.modelName}
                  onClick={() => history.push(`/project/${deployment.id}`)}
                >
                  {deployment.modelName}
                </span>
                <span className={styles.enable}>
                  <Switch
                    checked={deployment.enable}
                    onChange={deployStore.change.bind(
                      deployStore,
                      deployment.id,
                      'enable'
                    )}
                  />
                </span>
                <span
                  className={styles.deploymentStatus}
                  title={deploymentStatus[deployment.status || 'normal']}
                >
                  {deploymentStatus[deployment.status || 'normal']}
                </span>
                <span
                  className={styles.operationAlert}
                  title={deployment.operationAlert || 0}
                  onClick={() => history.push(`/project/${deployment.id}`)}
                >
                  {deployment.operationAlert || 0}
                </span>
                <span
                  className={styles.performanceAlert}
                  title={deployment.performanceAlert || 0}
                  onClick={() => history.push(`/project/${deployment.id}`)}
                >
                  {deployment.performanceAlert || 0}
                </span>
                <span
                  className={styles.createdDate}
                  title={moment.unix(deployment.createdDate).format('M/D/YYYY')}
                  onClick={() => history.push(`/project/${deployment.id}`)}
                >
                  {moment.unix(deployment.createdDate).format('M/D/YYYY')}
                </span>
                <span className={styles.owner} title={deployment.owner}>
                  {deployment.owner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
