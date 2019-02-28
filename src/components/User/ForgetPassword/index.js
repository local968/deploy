import React, { Component } from 'react';
import styles from '../styles.module.css'
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react'

@inject('userStore')
@observer
class ForgetPassword extends Component {

  @observable isSend = false
  @observable isResend = false
  @observable email = ''

  send = (resend = false) => action(() => {
    if (this.isSend && this.isResend) return
    this.props.userStore.forgetPassword(this.email)
    this.isSend = true
    this.isResend = resend
  })

  onChange = action(event => {
    this.email = event.target.value
  })

  render() {
    const resultTab = <div className={styles.block}>
      <h3 className={styles.title}>Reset Your Password</h3>
      <p className={styles.description}>We have sent a reset password email to {this.email}. Please click the reset password link to set your new password. <br /><br /><br />Didn't receive the email yet? Please check your spam folder, or <a onClick={this.send(true)}>resend</a> the email.</p>
    </div>

    const inputTab = <div className={styles.block}>
      <h3 className={styles.title}>Forget Password</h3>
      <p className={styles.description}>Please enter your email address you registered with us, and we'll send you instruction on how to reset your password</p>
      <input className={styles.input} type='text' value={this.email} onChange={this.onChange} placeholder='Email Address' />
      <a className={styles.submit} onClick={this.send()}>Send</a>
    </div>
    return this.isSend ? resultTab : inputTab
  }
}

export default ForgetPassword
