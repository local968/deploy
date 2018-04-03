import React, { Component } from 'react';
import styles from './styles.module.css';
import { Modal, DatePicker } from 'antd';
import classnames from 'classnames';

export default class OneTime extends Component {
  render() {
    const { visible } = this.props;
    return (
      <Modal
        className={styles.modal}
        closable={false}
        visible={visible}
        footer={null}
      >
        <div className={styles.title}>One Time Settings</div>
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
        <div className={styles.btns}>
          <a className={styles.cancel}>CANCEL</a>
          <a className={styles.done}>DONE</a>
        </div>
      </Modal>
    );
  }
}
