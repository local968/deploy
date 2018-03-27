import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import styles from './styles.module.css';
import { BlackButton } from 'components/Common';

export default () => (
  <div className={styles.replace}>
    <Link className={styles.back} to="/create">
      <Icon className={styles.icon} type="arrow-left" />
    </Link>
    <h2 className={styles.title}>Replace an Existing Project</h2>
    <div className={styles.selected}>
      <span className={styles.selectedText}>Selected Model:</span>
      <span className={styles.modelName}>RandomForect.auto23</span>
    </div>
    <div className={styles.gap} />
    <BlackButton>Modify the Project</BlackButton>
  </div>
);
