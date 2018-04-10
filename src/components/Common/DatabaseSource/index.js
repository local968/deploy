import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction, action } from 'mobx';
import styles from './styles.module.css';
import { Modal, Select, Checkbox } from 'antd';
import classnames from 'classnames';
import databaseIcon from './icon-database.svg';

const Option = Select.Option;

@observer
export default class OneTime extends Component {
  @observable
  localState = {
    hostname: '',
    port: '',
    databaseType: 'mysql',
    databaseName: '',
    tableName: '',
    databaseEncoding: 'utf8',
    username: '',
    password: '',
    rememberMyPassword: false,
    rememberMyConnectionProfile: false,

    period: '',
    start: '',
    finish: ''
  };

  @action
  changeState = (key, value) => {
    this.localState[key] = value;
  };

  @action
  toggleState = (key, value) => {
    this.localState[key] = this.localState[key] === value ? '' : value;
  };

  @action
  inputChange = key => event => this.changeState(key, event.target.value);

  @action
  checkboxChange = key => event => this.changeState(key, event.target.checked);

  componentWillReceiveProps(props) {
    runInAction(() => {
      this.localState = { ...this.localState, ...props.options };
    });
  }

  render() {
    const { visible, onClose, onSubmit, title, validation } = this.props;
    const state = this.localState;
    return (
      <Modal
        className={styles.modal}
        closable={false}
        visible={visible}
        footer={null}
        width={'37.5rem'}
      >
        <div className={styles.title}>
          <img
            className={styles.databaseIcon}
            alt="database"
            src={databaseIcon}
          />
          {title}
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Hostname:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={styles.input}
              placeholder="eg., db.abc.com"
              value={state['hostname']}
              onChange={this.inputChange('hostname')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Port:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={styles.input}
              placeholder="eg., 12345"
              value={state['port']}
              onChange={this.inputChange('port')}
            />
          </div>
        </div>
        <div className={styles.separate} />
        <div className={styles.line}>
          <div className={styles.label}>Database Type:</div>
          <div className={styles.options}>
            <Select
              value={state.databaseType}
              onChange={this.changeState.bind(this, 'databaseType')}
            >
              <Option value="mysql">mysql</Option>
              <Option value="oracle">oracle</Option>
            </Select>
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Database Name:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={styles.input}
              placeholder="Your database name"
              value={state['databaseName']}
              onChange={this.inputChange('databaseName')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Table Name:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={styles.input}
              placeholder="Your table name"
              value={state['tableName']}
              onChange={this.inputChange('tableName')}
            />
          </div>
        </div>
        {validation && (
          <div className={styles.line}>
            <div className={styles.label} />
            <div className={styles.options}>
              <i
                className={classnames([styles.pot], {
                  [styles.active]: state.period === 'id'
                })}
                onClick={this.toggleState.bind(this, 'period', 'id')}
              />
              <span
                className={styles.text}
                onClick={this.toggleState.bind(this, 'period', 'id')}
              >
                Record ID
              </span>
              <i
                className={classnames([styles.pot], {
                  [styles.active]: state.period === 'time'
                })}
                onClick={this.toggleState.bind(this, 'period', 'time')}
              />
              <span
                className={styles.text}
                onClick={this.toggleState.bind(this, 'period', 'time')}
              >
                Timestamp
              </span>
            </div>
          </div>
        )}
        {validation && (
          <div className={styles.line}>
            <div className={styles.label} />
            <div className={styles.options}>
              <div className={styles.periodInputs}>
                <div className={styles.start}>
                  Start {state.period.toLocaleUpperCase()}:<input
                    className={styles.input}
                    type="text"
                    value={state['start']}
                    onChange={this.inputChange('start')}
                  />
                </div>
                <div className={styles.finish}>
                  Finish {state.period.toLocaleUpperCase()}:<input
                    className={styles.input}
                    type="text"
                    value={state['finish']}
                    onChange={this.inputChange('finish')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={styles.line}>
          <div className={styles.label}>
            Database Encoding:<br />(optional)
          </div>
          <div className={styles.options}>
            <Select
              value={state.databaseEncoding}
              onChange={this.changeState.bind(this, 'databaseEncoding')}
            >
              <Option value="utf8">utf8</Option>
              <Option value="gb2312">gb2312</Option>
            </Select>
          </div>
        </div>
        <div className={styles.separate} />
        <div className={styles.line}>
          <div className={styles.label}>Username:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={styles.input}
              placeholder="Your database username"
              value={state['username']}
              onChange={this.inputChange('username')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Password:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={styles.input}
              placeholder="Your database password"
              value={state['password']}
              onChange={this.inputChange('password')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label} />
          <div className={classnames(styles.options, styles.checkbox)}>
            <Checkbox
              checked={state.rememberMyPassword}
              onChange={this.checkboxChange('rememberMyPassword')}
            >
              <span className={styles.checkboxText}>Remember My Password</span>
            </Checkbox>
          </div>
        </div>
        <div className={styles.separate} />
        <div className={styles.line}>
          <div className={styles.label} />
          <div className={classnames(styles.options, styles.checkbox)}>
            <Checkbox
              checked={state.rememberMyConnectionProfile}
              onChange={this.checkboxChange('rememberMyConnectionProfile')}
            >
              <span className={styles.checkboxText}>
                Remember My Connection Profile
              </span>
            </Checkbox>
          </div>
        </div>
        <div className={styles.btns}>
          <a className={styles.cancel} onClick={onClose}>
            CANCEL
          </a>
          <a className={styles.done} onClick={() => onSubmit(this.localState)}>
            CONNECT
          </a>
        </div>
      </Modal>
    );
  }
}
