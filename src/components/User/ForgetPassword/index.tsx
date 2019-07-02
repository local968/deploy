import React, { Component } from 'react';
import styles from '../styles.module.css'
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react'

import EN from '../../../constant/en';

@inject('userStore')
@observer
class ForgetPassword extends Component {

  @observable isSend = false;
  @observable isResend = false;
  @observable email = '';

  send = (resend = false) => action(() => {
    if (this.isSend && this.isResend) return;
    const {userStore} = this.props as any;
    userStore.forgetPassword(this.email);
    this.isSend = true;
    this.isResend = resend
  });

  onChange = action(({target}) => {
    this.email = target.value
  });

  render() {
    const resultTab = <div className={styles.block}>
      <h3 className={styles.title}>{EN.ResetYourPassword}</h3>
      <p className={styles.description}>{EN.Wehavesent} {this.email}. {EN.Pleaseclickthereset} <br /><br /><br />{EN.Didnreceivetheemail} <a onClick={this.send(true)}>{EN.Resend}</a> {EN.Theemail}.</p>
    </div>;

    const inputTab = <div className={styles.block}>
      <h3 className={styles.title}>{EN.ForgetPassword}</h3>
      <p className={styles.description}>{EN.Pleaseenteryouremail}</p>
      <input className={styles.input} type='text' value={this.email} onChange={this.onChange.bind(this)} placeholder={EN.EmailAddress} />
      <a className={styles.submit} onClick={this.send()}>{EN.Send}</a>
    </div>;
    return this.isSend ? resultTab : inputTab
  }
}

export default ForgetPassword
