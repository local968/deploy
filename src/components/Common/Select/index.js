import React from 'react';
import styles from './styles.module.css';
import { Select } from 'antd';
import classnames from 'classnames';
const Option = Select.Option;

export default ({ title, width, options, onChange, value, dropdownClassName, disabled, selectOption }) => {
  if (options) {
    return (
      <div className={classnames(styles.selector,{
        [styles.notAuto] : width!=="auto"
      })}>
        <span className={styles.selectTitle}>{title}</span>
        <div
          style={{ width }}
          className={styles.selectWrapper}
        >
          <Select
            className={classnames(styles.selectSelect,{
              [styles[dropdownClassName]]:!!dropdownClassName
            })}
            onChange={onChange}
            value={value}
            disabled={disabled}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            optionFilterProp="children"
            {...selectOption}
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
          style={width ? { width: 'auto' } : {}}
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
