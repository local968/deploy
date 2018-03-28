import React from 'react';
import styles from './styles.module.css';
import { Pagination } from 'antd';

export default props => (
  <Pagination
    className={styles.pagination}
    defaultCurrent={6}
    total={500}
    size="small"
    {...props}
  />
);
