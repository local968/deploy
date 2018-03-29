import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Select, Pagination } from 'components/Common';
import classnames from 'classnames';
import moment from 'moment';
import styles from './list.module.css';
import iconSearch from './icon-search.svg';
import iconDelete from './delete.svg';

@inject('approachStore', 'deployStore')
@observer
export default class ReplaceList extends Component {
  render() {
    const { deployStore } = this.props;
    return (
      <div className={styles.listWrapper}>
        <div className={styles.filter}>
          <div className={styles.searchName}>
            <img src={iconSearch} className={styles.iconSearch} alt="search" />
            <input type="text" placeholder="project" />
            <img src={iconDelete} className={styles.iconDelete} alt="delete" />
          </div>
          <Select title="Sort By" />
          <Pagination />
        </div>
        <div
          className={classnames(styles.head, {
            [styles.scroll]: deployStore.deployments.length > 5
          })}
        >
          <span className={styles.select} />
          <span className={styles.projectName}>Project Name</span>
          <span className={styles.modelName}>Model Name</span>
          <span className={styles.createdDate}>Created Date</span>
          <span className={styles.owner}>Owner</span>
        </div>
        <div className={styles.list}>
          {deployStore.deployments.map(deployment => (
            <div className={styles.project} key={deployment.id}>
              <span className={styles.select}>
                <i className={styles.pot} />
              </span>
              <span className={styles.projectName}>{deployment.name}</span>
              <span className={styles.modelName}>{deployment.modelName}</span>
              <span className={styles.createdDate}>
                {moment.unix(deployment.createdDate).format('DD/MM/YY')}
              </span>
              <span className={styles.owner}>{deployment.owner}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
