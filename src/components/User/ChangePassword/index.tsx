import React, { Component } from 'react';
import styles from '../styles.module.css'
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react'
import { message } from 'antd'
import EN from '../../../constant/en';

@inject('userStore')
@observer
class ChangePassword extends Component {

  @observable current = '';
  @observable newPassword = '';
  @observable repeat = '';

  onChange = (type) => action(({target}) => {
    this[type] = target.value
  });

  submit = () => {
    if (this.newPassword !== this.repeat) return message.error(EN.Thetwonewpasswords);
    const {userStore} = this.props as any;
    userStore.changePassword(this.current, this.newPassword).then(resp => {
      if (resp.data.status === 200) {
        userStore.status = 'unlogin';

        message.destroy();
        message.info(EN.Passwordchangesucceeded)
      } else {

        message.destroy();
        message.error(resp.data.message);
        console.error(resp.data.error)
      }
    }, () => {
      message.destroy();
      message.error(EN.Passwordchangefailed)
    })
  };

  render() {
    return <div className={styles.block}>
      <h3 className={styles.title}>{EN.ChangeYourPassword}</h3>
      <p className={styles.description}>{EN.Pleaseenteryourcurrent}</p>
      <input className={styles.input} value={this.current} onChange={this.onChange('current').bind(this)} type='password' placeholder={EN.CurrentPassword} />
      <input className={styles.input} value={this.newPassword} onChange={this.onChange('newPassword').bind(this)} type='password' placeholder={EN.NewPassword} />
      <input className={styles.input} value={this.repeat} onChange={this.onChange('repeat').bind(this)} type='password' placeholder={EN.ConfirmYour} />
      <a className={styles.submit} onClick={this.submit}>{EN.Submit}</a>
    </div>
  }
}

export default ChangePassword