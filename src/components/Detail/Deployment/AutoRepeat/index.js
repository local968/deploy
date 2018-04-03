import React, { Component } from 'react';
import styles from './styles.module.css';
import { Modal, DatePicker, Select } from 'antd';
import classnames from 'classnames';

const Option = Select.Option;

export default class AutoRepeat extends Component {
  render() {
    const { visible } = this.props;
    return (
      <Modal
        className={styles.modal}
        closable={false}
        visible={visible}
        footer={null}
      >
        <div className={styles.title}>Auto Repeat Settings</div>
        <div className={styles.line}>
          <span className={styles.label}>Repeat every</span>
          <div className={styles.options}>
            <Select value="2">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
              <Option value="6">6</Option>
              <Option value="7">7</Option>
            </Select>
            <div className={styles.vgap} />
            <Select value="day">
              <Option value="day">day</Option>
              <Option value="week">week</Option>
            </Select>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label}>Repeat On</span>
          <div className={styles.options}>
            <div className={classnames(styles.day, { [styles.active]: true })}>
              S
            </div>
            <div className={styles.day}>M</div>
            <div className={styles.day}>T</div>
            <div className={styles.day}>W</div>
            <div className={styles.day}>T</div>
            <div className={styles.day}>F</div>
            <div className={styles.day}>S</div>
          </div>
        </div>

        <div className={styles.line}>
          <span className={styles.label}>Starts</span>
          <div className={styles.options}>
            <i className={styles.pot} />
            <DatePicker
              showTime={{
                use12Hours: true,
                format: 'h:mma'
              }}
              format="MM/DD/YYYY HH:mma"
              placeholder="Select Time"
            />
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div className={styles.options}>
            <i
              className={classnames([styles.pot], { [styles.active]: true })}
            />
            <span className={styles.text}>Start after settings completed</span>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label}>Ends</span>
          <div className={styles.options}>
            <i className={styles.pot} />
            <span className={styles.text}>Never</span>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div className={styles.options}>
            <i
              className={classnames([styles.pot], { [styles.active]: true })}
            />
            <span className={styles.text}>On</span>
            <div className={styles.vgap} />
            <DatePicker
              showTime={{
                use12Hours: true,
                format: 'h:mma'
              }}
              format="MM/DD/YYYY HH:mma"
              placeholder="Select Time"
            />
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div className={styles.options}>
            <i
              className={classnames([styles.pot], { [styles.active]: true })}
            />
            <span className={styles.text}>After</span>
            <div className={styles.vgap} />
            <Select value="12">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
              <Option value="6">6</Option>
              <Option value="7">7</Option>
              <Option value="8">8</Option>
              <Option value="9">9</Option>
              <Option value="10">10</Option>
              <Option value="11">11</Option>
              <Option value="12">12</Option>
              <Option value="13">13</Option>
              <Option value="14">14</Option>
              <Option value="15">15</Option>
            </Select>
            <div className={styles.vgap} />
            <span className={styles.text}>occurrences</span>
          </div>
        </div>
        <div className={styles.btns}>
          <a className={styles.cancel}>CANCEL</a>
          <a className={styles.done}>DONE</a>
        </div>
      </Modal>
    );
  }
}
