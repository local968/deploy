import React from 'react';
import styles from './styles.module.css';
import { Select } from 'antd';
const Option = Select.Option;

export default ({ title, autoWidth, options, onChange, value }) => {
  if (options) {
    return (
      <div className={styles.selector}>
        <span className={styles.selectTitle}>{title}</span>
        <div
          style={autoWidth ? { width: 'auto' } : {}}
          className={styles.selectWrapper}
        >
          <Select
            className={styles.selectSelect}
            onChange={onChange}
            value={value}
          >
            {Object.entries(options).map(([value, label], index) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  } else {
    return (
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
  }
};
