import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";
import warnIcon from "./fail.svg";
import { Checkbox, Icon } from 'antd';
import { observable, action } from 'mobx';
import License from './License'

import EN from '../../../constant/en';

interface Interface {
  userStore:any
  history:any
}

@inject('userStore')
@observer
export default class SignUp extends Component<Interface> {
  @observable email = '';
  @observable password = '';
  @observable confirmPassword = '';
  @observable plan_id = '';
  @observable warning = {
    email: '',
    password: '',
    confirmPassword: '',
    level: ''
  };
  @observable showLicense = false;

  onChangeEmail = action(({target}) => {
    this.email = target.value.toLowerCase()
  });

  onChangePassword = action(({target}) => {
    this.password = target.value
  });

  onChangeConfirmPassword = action(({target}) => {
    this.confirmPassword = target.value
  });

  UNSAFE_componentWillMount() {
    const {userStore} = this.props;
    userStore.getPlanList()
  };
  register = () => {
    const { email, password, confirmPassword, warning, plan_id } = this;
    if (!email) {
      warning.email = EN.Enteryouremail;
    } else if (!new RegExp(/^[a-zA-Z0-9_-]+(\.([a-zA-Z0-9_-])+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).test(email)) {
      warning.email = EN.Enteravaildemial;
    } else {
      warning.email = "";
    }

    if (!password) {
      warning.password = EN.Enteryourpassword;
    } else {
      warning.password = "";
    }

    if (!confirmPassword || confirmPassword !== password) {
      warning.confirmPassword = EN.Passwordsnotmatch;
    } else {
      warning.confirmPassword = "";
    }

    if (warning.email || warning.password || warning.confirmPassword) {
      this.warning = warning;
      return
    }
    const {userStore} = this.props;

    userStore.register({ email, password, plan_id })
  };

  login = () => {
    const {history} = this.props;
    history.push("/")
  };

  show = action(() => (this.showLicense = true));
  hide = action(() => (this.showLicense = false));

  onChangePlan({target}){
    this.plan_id = target.value;
  }

  render() {
    const {userStore} = this.props;
    return (this.showLicense ? <License back={this.hide}/> :
      <div className={styles.signup}>
        <div className={styles.title}><span>{EN.SignUp}</span></div>
        <div className={styles.row}>
          <div className={styles.warning}>{this.warning.email && <span><img src={warnIcon} alt='warning' />{this.warning.email}</span>}</div>
          <input type="text" placeholder={EN.EmailAddress} value={this.email} onChange={this.onChangeEmail.bind(this)} />
        </div>
        <div className={styles.row}>
          <div className={styles.warning}>{this.warning.password && <span><img src={warnIcon} alt='warning' />{this.warning.password}</span>}</div>
          <input type="password" placeholder={EN.SetPassword} value={this.password} onChange={this.onChangePassword.bind(this)} />
        </div>
        <div className={styles.row}>
          <div className={styles.warning}>{this.warning.confirmPassword && <span><img src={warnIcon} alt='warning' />{this.warning.confirmPassword}</span>}</div>
          <input type="password" placeholder={EN.ConfirmPassword} value={this.confirmPassword} onChange={this.onChangeConfirmPassword.bind(this)} />
        </div>
        <div className={styles.row}>
          <div className={styles.warning}>{this.warning.level && <span><img src={warnIcon} alt='warning' />{this.warning.level}</span>}</div>
          <select value={this.plan_id} onChange={this.onChangePlan.bind(this)}>
              {
                  userStore.planList.map(itm=><option
                      key={itm.id}
                      value={itm.id}>{EN[itm.name]}</option>)
              }
          </select>
        </div>
        <div className={styles.text}><span>{EN.ByclickingSign}&nbsp;<span className={styles.bold} onClick={this.show}>{EN.EndUserLicense}</span></span></div>
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={this.register}>
            <span>{EN.SignUp}</span>
          </button>
          <div className={styles.hasAccount} onClick={this.login}><span>{EN.Alreadyhaveanaccount}</span></div>
        </div>
      </div>)
  }
}
