import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction, action } from 'mobx';
import styles from './styles.module.css';
import { Modal, Select, Checkbox, Message } from 'antd';
import classnames from 'classnames';
import databaseIcon from './icon-database.svg';
import db from 'stores/DBStore.js';

const Option = Select.Option;
const database = ['mysql', 'oracle'];

const rules = {};
const errorMessages = {};
const setRule = (key, errorMessage, neccessary, rule) => {
  rules[key] = value => {
    if (neccessary && (!value || value === '')) return false;
    if (rule) return rule(value);
    return true;
  };
  errorMessages[key] = errorMessage;
};

setRule('sqlHostName', 'place enter your host name', true);
setRule('sqlPort', 'invalid host port', true, value => !isNaN(value));
setRule(
  'databaseType',
  'invalid database type',
  true,
  value => database.indexOf(value) !== -1
);
setRule('sqlDatabase', 'place enter your database name', true);
setRule('sqlTable', 'place enter your table name', true);
setRule('sqlQueryStr', false);
setRule('sqlEncoding', false, value => ['utf8'].indexOf(value) !== -1);
setRule('sqlUserName', 'place enter your databse username', true);
setRule('sqlPassword', 'place enter your databse password', true);

@observer
export default class DatabaseConfig extends Component {
  @observable
  localState = {
    sqlHostName: '',
    sqlPort: '',
    databaseType: 'mysql',
    sqlDatabase: '',
    sqlTable: '',
    sqlQueryStr: '',
    sqlEncoding: 'utf8',
    sqlUserName: '',
    sqlPassword: '',
    rememberMyPassword: false,
    rememberMyConnectionProfile: false

    // tableType: 'new'
  };

  @observable errorField = '';

  @action
  changeState = (key, value) => {
    this.localState[key] = value;
  };

  checkForm = () => {
    let failed = false;
    Object.entries(rules).map(([key, fn]) => {
      if (failed) return false;
      if (!fn(this.localState[key])) {
        Message.error(errorMessages[key]);
        failed = true;
        runInAction(() => {
          this.errorField = key;
        });
      }
      return true;
    });
    return failed;
  };

  @action
  toggleState = (key, value) => {
    this.changeState(key, this.localState[key] === value ? '' : value);
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
    const { visible, onClose, onSubmit: submit, title, projectId } = this.props;
    const state = this.localState;
    const onSubmit = () => {
      if (this.checkForm()) return;
      db.checkDatabase({
        ...state,
        projectId
      }).then(resp => {
        if (resp.result.status === -1) {
          Message.error(resp.result.result['process error']);
        } else {
          submit(resp);
        }
      });
    };
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
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlHostName'
              })}
              placeholder="eg., db.abc.com"
              value={state['sqlHostName']}
              onChange={this.inputChange('sqlHostName')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Port:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlPort'
              })}
              placeholder="eg., 12345"
              value={state['sqlPort']}
              onChange={this.inputChange('sqlPort')}
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
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlHostName'
              })}
              placeholder="Your database name"
              value={state['sqlDatabase']}
              onChange={this.inputChange('sqlDatabase')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Table Name:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlTable'
              })}
              placeholder="Your table name"
              value={state['sqlTable']}
              onChange={this.inputChange('sqlTable')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>SQL(optional):</div>
          <div className={styles.options}>
            <input
              type="text"
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlQueryStr'
              })}
              placeholder="SQL for query"
              value={state['sqlQueryStr']}
              onChange={this.inputChange('sqlQueryStr')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>
            Database Encoding:<br />(optional)
          </div>
          <div className={styles.options}>
            <Select
              value={state.sqlEncoding}
              onChange={this.changeState.bind(this, 'sqlEncoding')}
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
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlUserName'
              })}
              placeholder="Your database username"
              value={state['sqlUserName']}
              onChange={this.inputChange('sqlUserName')}
            />
          </div>
        </div>
        <div className={styles.line}>
          <div className={styles.label}>Password:</div>
          <div className={styles.options}>
            <input
              type="text"
              className={classnames(styles.input, {
                [styles.error]: this.errorField === 'sqlPassword'
              })}
              placeholder="Your database password"
              value={state['sqlPassword']}
              onChange={this.inputChange('sqlPassword')}
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
          <a className={styles.done} onClick={onSubmit}>
            CONNECT
          </a>
        </div>
      </Modal>
    );
  }
}
