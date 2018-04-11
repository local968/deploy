import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import { Popover } from 'antd';
import emptyIcon from './icon-no-report.svg';
import classnames from 'classnames';
import alertIcon from './fail.svg';

@inject('deployStore')
@observer
export default class Operation extends Component {
  render() {
    const { deployStore } = this.props;
    const cd = deployStore.currentDeployment || {};
    return (
      <div className={styles.operation}>
        <div className={styles.info}>
          <span className={styles.model}>Model:{cd.modelName}</span>
        </div>

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
            <div className={styles.project}>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Alert = () => (
  <div className={styles.alert}>
    <div className={styles.alertHead}>
      <img className={styles.alertIcon} src={alertIcon} alt="alert" />Alert
    </div>
    <div className={styles.alertContent}>
      Can not find the data source file from the path{' '}
      <span className={styles.path}>D://user/deployment/results</span>
      <br />Please check the file if it has been moved.
    </div>
  </div>
);

const Empty = () => (
  <div className={styles.emptyTable}>
    <img src={emptyIcon} className={styles.emptyIcon} alt="empty" />
    <span className={styles.emptyText}>No deployment report yet</span>
  </div>
);
