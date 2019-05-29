import React, { Component } from 'react';
import styles from '../styles.module.css'
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react'
import { message } from 'antd'

import EN from '../../../constant/en';

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
    if (this.newPassword !== this.repeat) return message.error(EN.Thetwonewpasswords)
    this.props.userStore.resetPassword(this.code, this.newPassword).then(resp => {
      if (resp.data.status === 200) {
        this.props.routing.push('/')
        message.success(EN.Passwordresetsuccessed)
      } else {
        message.error(resp.data.message)
      }
    })
  }

  render() {
    return <div className={styles.block}>
      <h3 className={styles.title}>{EN.ResetYourPassword}</h3>
      <p className={styles.description}>{EN.Pleaseenteryour}</p>
      <input className={styles.input} value={this.newPassword} type='password' onChange={this.onChange('newPassword')} placeholder={EN.EnterNewPassword} />
      <input className={styles.input} value={this.repeat} onChange={this.onChange('repeat')} type='password' placeholder={EN.ConfirmPassword} />
      <a className={styles.submit} onClick={this.submit}>{EN.ResetPassword}</a>
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
