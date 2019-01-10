import React, { Component } from 'react';
import styles from '../styles.module.css'
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react'
import { message } from 'antd'


@inject('userStore', 'routing')
@observer
class ResetPassword extends Component {

  @observable newPassword = ''
  @observable repeat = ''
  code = ''

  constructor(props) {
    super(props)
    this.code = getQueryString('code')
    if (!this.code || this.code === '') {
      message.error('Wrong code.')
      props.routing.push('/')
      return
    }
  }

  onChange = (type) => action((event) => {
    this[type] = event.target.value
  })

  submit = () => {
    if (this.newPassword !== this.repeat) return message.error('The two new passwords you entered were inconsistent')
    this.props.userStore.resetPassword(this.current, this.newPassword)
  }

  render() {
    return <div className={styles.block}>
      <h3 className={styles.title}>Reset Your Password</h3>
      <p className={styles.description}>Please enter your new password below to reset.</p>
      <input className={styles.input} type='password' placeholder='Enter a New Password' />
      <input className={styles.input} type='password' placeholder='Confirm Password' />
      <a className={styles.submit}>Reset Password</a>
    </div>
  }
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

export default ResetPassword
