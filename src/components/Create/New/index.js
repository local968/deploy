import React from 'react';
import styles from './styles.module.css';
import { Icon } from 'antd';
import { BlackButton } from 'components/Common';

export default () => (
  <div className={styles.new}>
    <a className={styles.back}>
      <Icon className={styles.icon} type="arrow-left" />
    </a>
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
