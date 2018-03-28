import React from 'react';
import styles from './styles.module.css';
import { Select } from 'antd';
const Option = Select.Option;

export default ({ title, autoWidth }) => (
  <div className={styles.selector}>
    <span className={styles.selectTitle}>{title}</span>
    <div
      style={autoWidth ? { width: 'auto' } : {}}
      className={styles.selectWrapper}
    >
      <Select className={styles.selectSelect} defaultValue="lucy">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="disabled" disabled>
          Disabled
        </Option>
        <Option value="Yiminghe">yiminghe</Option>
      </Select>
    </div>
  </div>
);
