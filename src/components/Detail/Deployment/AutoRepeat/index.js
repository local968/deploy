import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action, runInAction } from 'mobx';
import moment from 'moment';
import styles from './styles.module.css';
import { Modal, DatePicker, Select, InputNumber } from 'antd';
import classnames from 'classnames';

const Option = Select.Option;

const bound = 10000;

@observer
export default class AutoRepeat extends Component {
  @observable
  localState = {
    repeatPeriod: 'week',
    repeatFrequency: 1,
    repeatOn: 1,
    starts: 'completed',
    ends: 'never'
  };
  @action
  changeState = (key, value) => {
    this.localState[key] = value;
  };
  w = k => v => this.changeState(k, v);
  c = (k, v) => () => this.changeState(k, v);
  t = k => event => this.changeState(k, event.target.value);
  numberChange = k => v => this.changeState(k, parseInt(v, 10) || 0);

  constructor(props) {
    super(props);
    runInAction(
      () => (this.localState = { ...props.options, ...this.localState })
    );
  }

  render() {
    const { visible, onClose, onSubmit } = this.props;
    const state = this.localState;
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
            <InputNumber
              min={1}
              max={99}
              formatter={v => (isNaN(parseInt(v, 10)) ? 1 : parseInt(v, 10))}
              value={state['repeatFrequency']}
              onChange={this.numberChange('repeatFrequency')}
            />
            <div className={styles.vgap} />
            <Select
              value={state['repeatPeriod']}
              onChange={this.w('repeatPeriod')}
            >
              <Option value="day">day</Option>
              <Option value="week">week</Option>
            </Select>
          </div>
        </div>
        {state.repeatPeriod === 'week' && (
          <div className={styles.line}>
            <span className={styles.label}>Repeat On</span>
            <div className={styles.options}>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 1
                })}
                onClick={this.c('repeatOn', 1)}
              >
                S
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 2
                })}
                onClick={this.c('repeatOn', 2)}
              >
                M
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 3
                })}
                onClick={this.c('repeatOn', 3)}
              >
                T
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 4
                })}
                onClick={this.c('repeatOn', 4)}
              >
                W
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 5
                })}
                onClick={this.c('repeatOn', 5)}
              >
                T
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 6
                })}
                onClick={this.c('repeatOn', 6)}
              >
                F
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 7
                })}
                onClick={this.c('repeatOn', 7)}
              >
                S
              </div>
            </div>
          </div>
        )}

        <div className={styles.line}>
          <span className={styles.label}>Starts</span>
          <div className={styles.options}>
            <i
              className={classnames(styles.pot, {
                [styles.active]: state.starts !== 'completed'
              })}
              onClick={this.c('starts', moment().unix())}
            />
            <DatePicker
              showTime={{
                use12Hours: true,
                format: 'h:mma'
              }}
              value={
                state.starts === 'completed' ? null : moment.unix(state.starts)
              }
              format="MM/DD/YYYY HH:mma"
              placeholder="Select Time"
              onChange={date => this.changeState('starts', date.unix())}
            />
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div
            className={styles.options}
            onClick={this.c('starts', 'completed')}
          >
            <i
              className={classnames([styles.pot], {
                [styles.active]: state.starts === 'completed'
              })}
            />
            <span className={styles.text}>Start after settings completed</span>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label}>Ends</span>
          <div className={styles.options} onClick={this.c('ends', 'never')}>
            <i
              className={classnames([styles.pot], {
                [styles.active]: state.ends === 'never'
              })}
            />
            <span className={styles.text}>Never</span>
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div className={styles.options}>
            <i
              className={classnames([styles.pot], {
                [styles.active]: state.ends !== 'never' && state.ends > bound
              })}
              onClick={this.c('ends', moment().unix())}
            />
            <span className={styles.text}>On</span>
            <div className={styles.vgap} />
            <DatePicker
              showTime={{
                use12Hours: true,
                format: 'h:mma'
              }}
              value={
                state.ends === 'never' || state.ends < bound
                  ? null
                  : moment.unix(state.ends)
              }
              format="MM/DD/YYYY HH:mma"
              placeholder="Select Time"
              onChange={date => this.changeState('ends', date.unix())}
            />
          </div>
        </div>
        <div className={styles.line}>
          <span className={styles.label} />
          <div
            className={styles.options}
            onClick={this.c('ends', state.ends < bound ? state.ends : 1)}
          >
            <i
              className={classnames([styles.pot], {
                [styles.active]: state.ends < bound
              })}
            />
            <span className={styles.text}>After</span>
            <div className={styles.vgap} />
            <InputNumber
              min={1}
              max={9999}
              value={state.ends < bound ? state.ends : 1}
              formatter={v => (isNaN(parseInt(v, 10)) ? 1 : parseInt(v, 10))}
              onChange={this.numberChange('ends')}
            />
            <div className={styles.vgap} />
            <span className={styles.text}>occurrences</span>
          </div>
        </div>
        <div className={styles.btns}>
          <a className={styles.cancel} onClick={onClose}>
            CANCEL
          </a>
          <a className={styles.done} onClick={() => onSubmit(this.localState)}>
            DONE
          </a>
        </div>
      </Modal>
    );
  }
}
