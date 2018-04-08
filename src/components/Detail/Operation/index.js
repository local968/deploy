import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import emptyIcon from './icon-no-report.svg';

@inject('deployStore')
@observer
export default class Operation extends Component {
  render() {
    const { deployStore } = this.props;
    const cd = deployStore.currentDeployment || {};
    return (
      <div className={styles.operation}>
        <div className={styles.info}>
          <span className={styles.model}>
            Model:{cd.modelName}
            <i className={styles.mark}>!</i>
          </span>
        </div>
        <div className={styles.emptyTable}>
          <img src={emptyIcon} className={styles.emptyIcon} alt="empty" />
          <span className={styles.emptyText}>No deployment report yet</span>
        </div>
      </div>
    );
  }
}
