import React, { Component } from 'react';
import styles from '../styles.module.css'
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react'
import { message } from 'antd'

@inject('userStore')
@observer
class ChangePassword extends Component {

  @observable current = ''
  @observable newPassword = ''
  @observable repeat = ''

  onChange = (type) => action((event) => {
    this[type] = event.target.value
  })

  submit = () => {
    if (this.newPassword !== this.repeat) return message.error('The two new passwords you entered were inconsistent')
    this.props.userStore.changePassword(this.current, this.newPassword).then(resp => {
      if(resp.data.status === 200) {
        this.props.userStore.status = 'unlogin'
        message.info('change password successed. please use your new password to log in.')
      }else {
        message.error(resp.data.message)
        console.error(resp.data.error)
      }
    },error => message.error('change password failed, please try later.'))
  }

  render() {
    return <div className={styles.block}>
      <h3 className={styles.title}>Change Your Password</h3>
      <p className={styles.description}>Please enter your current password and your new password below.</p>
      <input className={styles.input} value={this.current} onChange={this.onChange('current')} type='password' placeholder='Current Password' />
      <input className={styles.input} value={this.newPassword} onChange={this.onChange('newPassword')} type='password' placeholder='New Password' />
      <input className={styles.input} value={this.repeat} onChange={this.onChange('repeat')} type='password' placeholder='confirm Your New Password' />
      <a className={styles.submit} onClick={this.submit}>Submit</a>
    </div>
  }
}

export default ChangePassword
