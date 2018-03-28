import React from 'react';
import styles from './styles.module.css';
import { Bread, Select, Pagination, Switch } from 'components/Common';
import classnames from 'classnames';
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

export default () => (
  <div className={styles.home}>
    <Bread list={['Home']} />
    <div className={styles.filter}>
      <div className={styles.search}>
        <input type="text" className={styles.searchName} />
        <a className={styles.submit}>
          <img
            className={styles.searchButton}
            src={searchButton}
            alt="search"
          />
        </a>
      </div>
      <Select title="Sort by" autoWidth />
      <Select title="Projects per page" autoWidth />
      <Pagination />
    </div>
    <div className={styles.listWrapper}>
      <div className={styles.head}>
        <span className={styles.projectName}>Project Name</span>
        <span className={styles.modelName}>Model Name</span>
        <span className={styles.enable}>Enable</span>
        <span className={styles.deploymentStatus}>Deployment Status</span>
        <span className={styles.operationAlert}>Operation Alert</span>
        <span className={styles.performanceAlert}>Performance Alert</span>
        <span className={styles.createdDate}>Created Date</span>
        <span className={styles.owner}>Owner</span>
      </div>
      <div className={styles.list}>
        <div className={styles.project}>
          <span className={styles.projectName}>Test</span>
          <span className={styles.modelName}>Test.auto23</span>
          <span className={styles.enable}>
            <Switch defaultChecked />
          </span>
          <span className={styles.deploymentStatus}>
            {deploymentStatus['normal']}
          </span>
          <span className={styles.operationAlert}>0</span>
          <span className={styles.performanceAlert}>0</span>
          <span className={styles.createdDate}>03/05/2018</span>
          <span className={styles.owner}>Vcing</span>
        </div>
        <div className={styles.project}>
          <span className={styles.projectName}>
            Deployment-Customer Response Probability in Direct Mail Marketing
          </span>
          <span className={styles.modelName}>RandomForest.auto23</span>
          <span className={styles.enable}>
            <Switch defaultChecked />
          </span>
          <span className={styles.deploymentStatus}>
            {deploymentStatus['normal']}
          </span>
          <span className={styles.operationAlert}>0</span>
          <span
            className={classnames([styles.performanceAlert, styles.warning])}
          >
            1
          </span>
          <span className={styles.createdDate}>02/21/2018</span>
          <span className={styles.owner}>Newton Barley</span>
        </div>
        <div className={styles.project}>
          <span className={styles.projectName}>
            Deployment-Customer Response Probability in Direct Mail Marketing
          </span>
          <span className={styles.modelName}>RandomForest.auto23</span>
          <span className={styles.enable}>
            <Switch defaultChecked />
          </span>
          <span className={styles.deploymentStatus}>
            {deploymentStatus['issue']}
          </span>
          <span className={classnames([styles.operationAlert, styles.warning])}>
            2
          </span>
          <span
            className={classnames([styles.performanceAlert, styles.warning])}
          >
            3
          </span>
          <span className={styles.createdDate}>01/11/2018</span>
          <span className={styles.owner}>Newton Barley</span>
        </div>
        <div className={styles.project}>
          <span className={styles.projectName}>
            Deployment-Customer Response Probability in Direct Mail Marketing
          </span>
          <span className={styles.modelName}>RandomForest.auto23</span>
          <span className={styles.enable}>
            <Switch defaultChecked />
          </span>
          <span className={styles.deploymentStatus}>
            {deploymentStatus['na']}
          </span>
          <span className={classnames([styles.operationAlert, styles.na])}>
            N/A
          </span>
          <span className={classnames([styles.performanceAlert, styles.na])}>
            N/A
          </span>
          <span className={styles.createdDate}>01/10/2018</span>
          <span className={styles.owner}>Newton Barley</span>
        </div>
        <div className={styles.project}>
          <span className={styles.projectName}>
            Deployment-Customer Response Probability in Direct Mail Marketing
          </span>
          <span className={styles.modelName}>RandomForest.auto23</span>
          <span className={styles.enable}>
            <Switch defaultChecked />
          </span>
          <span className={styles.deploymentStatus}>
            {deploymentStatus['running']}
          </span>
          <span className={styles.operationAlert}>0</span>
          <span className={styles.performanceAlert}>0</span>
          <span className={styles.createdDate}>01/09/2018</span>
          <span className={styles.owner}>Newton Barley</span>
        </div>
      </div>
    </div>
  </div>
);
