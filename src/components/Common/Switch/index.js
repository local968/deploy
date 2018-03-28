import React from 'react';
import styles from './styles.module.css';
import { Switch } from 'antd';

export default props => (
  <Switch className={styles.switch} defaultChecked {...props} />
);
