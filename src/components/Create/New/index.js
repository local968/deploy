import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import styles from './styles.module.css';
import { BlackButton } from 'components/Common';

export default () => (
  <div className={styles.new}>
    <Link className={styles.back} to="/create">
      <Icon className={styles.icon} type="arrow-left" />
    </Link>
    <h2 className={styles.title}>Create a Deployment Project</h2>
    <div className={styles.selected}>
      <span className={styles.selectedText}>Selected Model:</span>
      <span className={styles.modelName}>RandomForect.auto23</span>
    </div>
    <input className={styles.name} type="text" placeholder="Project Name" />
    <div className={styles.gap} />
    <BlackButton>Create the Project</BlackButton>
  </div>
);
