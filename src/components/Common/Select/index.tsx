import React from 'react';
import styles from './styles.module.css';
import { Select } from 'antd';
import classnames from 'classnames';
const {Option} = Select;

export default function Selects(props){
  const {
    title,
    width,
    options,
    onChange,
    value,
    dropdownClassName,
    disabled,
    selectOption,
    getPopupContainer = () => document.body
  } = props;
  if (options) {
    return (
      <div
        className={classnames(styles.selector, {
          [styles.notAuto]: width !== 'auto'
        })}
      >
        <span className={styles.selectTitle}>{title}</span>
        <div style={{ width }} className={styles.selectWrapper}>
          <Select
            className={classnames(styles.selectSelect, {
              [styles[dropdownClassName]]: !!dropdownClassName
            })}
            onChange={onChange}
            value={value}
            disabled={disabled}
            getPopupContainer={getPopupContainer}
            filterOption={(input, option) =>
              typeof option.props.children === 'string' ? option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0 : false
            }
            optionFilterProp="children"
            {...selectOption}
          >
            {Object.entries(options).map(([value, label]) => (
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
      <div className={classnames(styles.selector)}>
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
}
