import React from 'react';
import { Select, Pagination } from 'antd';
import classnames from 'classnames';
import styles from './list.module.css';
import iconSearch from './icon-search.svg';
import iconDelete from './delete.svg';

const Option = Select.Option;

export default () => (
  <div className={styles.listWrapper}>
    <div className={styles.filter}>
      <div className={styles.searchName}>
        <img src={iconSearch} className={styles.iconSearch} alt="search" />
        <input type="text" placeholder="project" />
        <img src={iconDelete} className={styles.iconDelete} alt="delete" />
      </div>
      <div className={styles.sort}>
        <span className={styles.sortTitle}>Sorted by</span>
        <div className={styles.selectWrapper}>
          <Select className={styles.sortSelect} defaultValue="lucy">
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="disabled" disabled>
              Disabled
            </Option>
            <Option value="Yiminghe">yiminghe</Option>
          </Select>
        </div>
      </div>
      <Pagination
        className={styles.pagination}
        defaultCurrent={6}
        total={500}
        size="small"
      />
    </div>
    <div className={classnames([styles.head, styles.scroll])}>
      <span className={styles.select} />
      <span className={styles.projectName}>Project Name</span>
      <span className={styles.modelName}>Model Name</span>
      <span className={styles.createdDate}>Created Date</span>
      <span className={styles.owner}>Owner</span>
    </div>
    <div className={styles.list}>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
      <div className={styles.project}>
        <span className={styles.select}>
          <i className={styles.pot} />
        </span>
        <span className={styles.projectName}>
          Deployment-Customer Response Probability in Direct Mail Marketing
        </span>
        <span className={styles.modelName}>RandomForest.auto23</span>
        <span className={styles.createdDate}>01/11/2018</span>
        <span className={styles.owner}>Newton Barley</span>
      </div>
    </div>
  </div>
);
