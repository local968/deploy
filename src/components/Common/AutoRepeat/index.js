import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action, runInAction, autorun } from 'mobx';
import moment from 'moment';
import styles from './styles.module.css';
import { Modal, DatePicker, TimePicker, Select, InputNumber } from 'antd';
import classnames from 'classnames';
import EN from '../../../constant/en';
const Option = Select.Option;

const bound = 10000;

const ordinalNumberPostFix = number => {
  if ((number > 3 && number < 21) || number % 10 > 3) return 'th';
  return { 0: 'th', 1: 'st', 2: 'nd', 3: 'rd' }[number % 10];
};

@observer
export default class AutoRepeat extends Component {
  @observable
  localState = {
    repeatPeriod: 'week',
    repeatFrequency: 1,
    repeatOn: 1,
    starts: moment().unix(),
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

  fixRepeatOn = autorun(() => {
    switch (this.localState.repeatPeriod) {
      case 'day':
        if (this.localState.repeatOn > 28 || this.localState.repeatOn < 1)
          return this.changeState('repeatOn', 1);
        break;
      case 'week':
        if (this.localState.repeatOn > 7 || this.localState.repeatOn < 1)
          return this.changeState('repeatOn', 1);
        break;
      case 'month':
        if (this.localState.repeatOn > 28 || this.localState.repeatOn < 1)
          return this.changeState('repeatOn', 1);
        break;
      default:
        return this.changeState('repeatOn', 1);
    }
  });

  constructor(props) {
    super(props);
    runInAction(() => {
      this.localState = { ...this.localState, ...props.options };
    });
  }

  UNSAFE_componentWillReceiveProps(props) {
    runInAction(() => {
      this.localState = { ...this.localState, ...props.options };
    });
  }

  render() {
    const { visible, onClose, onSubmit } = this.props;
    const state = this.localState;
    const max = { day: 365, week: 52, month: 12 }[state['repeatPeriod']];
    return (
      <Modal
        className={styles.modal}
        closable={false}
        visible={visible}
        footer={null}
      >
        <div className={styles.title}>{EN.AutoRepeatSettings}</div>
        <div className={styles.line}>
          <span className={styles.label}>{EN.Repeatevery}</span>
          <div className={styles.options}>
            <InputNumber
              min={1}
              max={max}
              formatter={v => (isNaN(parseInt(v, 10)) ? 1 : parseInt(v, 10))}
              value={state['repeatFrequency']}
              onChange={this.numberChange('repeatFrequency')}
            />
            <div className={styles.vgap} />
            <Select
              value={state['repeatPeriod']}
              onChange={this.w('repeatPeriod')}
            >
              <Option value="day">{EN.Day}</Option>
              <Option value="week">{EN.Week}</Option>
              <Option value="month">{EN.Month}</Option>
            </Select>
          </div>
        </div>
        {state.repeatPeriod === 'week' && (
          <div className={styles.line}>
            <span className={styles.label}>{EN.RepeatOn}</span>
            <div className={styles.options}>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 1
                })}
                onClick={this.c('repeatOn', 1)}
              >
                {EN.S}
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 2
                })}
                onClick={this.c('repeatOn', 2)}
              >
                {EN.M}
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 3
                })}
                onClick={this.c('repeatOn', 3)}
              >
                {EN.T}
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 4
                })}
                onClick={this.c('repeatOn', 4)}
              >
                {EN.W}
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 5
                })}
                onClick={this.c('repeatOn', 5)}
              >
                {EN.TH}
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 6
                })}
                onClick={this.c('repeatOn', 6)}
              >
                {EN.F}
              </div>
              <div
                className={classnames(styles.day, {
                  [styles.active]: state.repeatOn === 7
                })}
                onClick={this.c('repeatOn', 7)}
              >
                {EN.SA}
              </div>
            </div>
          </div>
        )}

        {state.repeatPeriod === 'month' && (
          <div className={styles.line}>
            <span className={styles.label}>{EN.RepeatOn}</span>
            <div className={styles.options}>
              <InputNumber
                min={1}
                max={28}
                formatter={v => (isNaN(parseInt(v, 10)) ? 1 : parseInt(v, 10))}
                value={state['repeatOn']}
                onChange={this.numberChange('repeatOn')}
              />
              <span className={styles.text}>
                {ordinalNumberPostFix(state.repeatOn)}
              </span>
            </div>
          </div>
        )}

        <div className={styles.line}>
          <span className={styles.label}>{EN.Starts}</span>
          <div className={styles.options}>
            {/* <i
              className={classnames(styles.pot, {
                [styles.active]: state.starts !== 'completed'
              })}
              onClick={this.c('starts', moment().unix())}
            /> */}
            <TimePicker
              use12Hours
              format="h:mma"
              value={moment.unix(state.starts)}
              placeholder={EN.SelectTime}
              onChange={date => this.changeState('starts', date.unix())}
            />
          </div>
        </div>
        {/* <div className={styles.line}>
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
        </div> */}
        <div className={styles.line}>
          <span className={styles.label}>{EN.Ends}</span>
          <div className={styles.options} onClick={this.c('ends', 'never')}>
            <i
              className={classnames([styles.pot], {
                [styles.active]: state.ends === 'never'
              })}
            />
            <span className={styles.text}>{EN.Never}</span>
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
            <span className={styles.text}>{EN.On}</span>
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
              format="MM/DD/YYYY h:mma"
              placeholder={EN.SelectTime}
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
            <span className={styles.text}>{EN.After}</span>
            <div className={styles.vgap} />
            <InputNumber
              min={1}
              max={9999}
              value={state.ends < bound ? state.ends : 1}
              formatter={v => (isNaN(parseInt(v, 10)) ? 1 : parseInt(v, 10))}
              onChange={this.numberChange('ends')}
            />
            <div className={styles.vgap} />
            <span className={styles.text}>{EN.Occurrences}</span>
          </div>
        </div>
        <div className={styles.btns}>
          <a className={styles.cancel} onClick={onClose}>
            {EN.CANCEL}
          </a>
          <a className={styles.done} onClick={() => onSubmit(this.localState)}>
            {EN.DONE}
          </a>
        </div>
      </Modal>
    );
  }
}
