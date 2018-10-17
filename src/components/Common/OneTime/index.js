import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import moment from 'moment';
import styles from './styles.module.css';
import { Modal, DatePicker } from 'antd';
import classnames from 'classnames';

@observer
export default class OneTime extends Component {
  @observable time = 'completed';

  constructor(props) {
    super(props);
    runInAction(() => (this.time = props.options.time || 'completed'));
  }

  componentWillReceiveProps(props) {
    runInAction(() => (this.time = props.options.time || 'completed'));
  }

  render() {
    const { visible, onClose, onSubmit } = this.props;
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
          <div
            className={styles.options}
            onClick={() => {
              if (this.time === 'completed')
                runInAction(() => (this.time = moment().unix()));
            }}
          >
            <i
              className={classnames(styles.pot, {
                [styles.active]: this.time !== 'completed'
              })}
            />
            <DatePicker
              showTime={{
                use12Hours: true,
                format: 'h:mma'
              }}
              value={this.time === 'completed' ? null : moment.unix(this.time)}
              format="MM/DD/YYYY HH:mma"
              placeholder="Select Time"
              onChange={date => runInAction(() => (this.time = date.unix()))}
            />
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div
            className={styles.options}
            onClick={() => (this.time = 'completed')}
          >
            <i
              className={classnames([styles.pot], {
                [styles.active]: this.time === 'completed'
              })}
            />
            <span className={styles.text}>Start after settings completed</span>
          </div>
        </div>
        <div className={styles.btns}>
          <a className={styles.cancel} onClick={onClose}>
            CANCEL
          </a>
          <a
            className={styles.done}
            onClick={() => onSubmit({ time: this.time })}
          >
            DONE
          </a>
        </div>
      </Modal>
    );
  }
}
