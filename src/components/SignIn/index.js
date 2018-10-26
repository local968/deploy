import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";
import warnIcon from "./fail.svg";
import { observable, action, runInAction } from 'mobx';

@inject('userStore')
@observer
export default class SignIn extends Component {
  @observable email = window.localStorage.getItem('deploy2-email') || ''
  @observable password = ''
  @observable warning = {
    email: '',
    password: ''
  }

  onChangeEmail = action((e) => {
    this.email = e.target.value.toLowerCase()
  })

  onChangePassword = action((e) => {
    this.password = e.target.value
  })

  login = () => {
    const { email, password, warning } = this
    if (!email) {
      warning.email = "Enter your email";
    } else if (!new RegExp(/^[a-zA-Z0-9_-]+(\.([a-zA-Z0-9_-])+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).test(email)) {
      warning.email = "Enter a vaild emial address";
    } else {
      warning.email = '';
    }

    if (!password) {
      warning.password = "Enter your password";
    } else {
      warning.password = '';
    }

    if (warning.email || warning.password) {
      return runInAction(() => {
        this.warning = warning
      })
    }

    this.props.userStore.login({ email, password })
  }

  onKeyUp = (event) => {
    if (event.keyCode === 13) this.login()
  }

  register = () => {
    this.props.history.push("/signup")
  }

  render() {
    return <div className={styles.signin}>
      <div className={styles.title}><span>Sign In</span></div>
      <div className={styles.row}>
        <div className={styles.warning}>{this.warning.email && <span><img src={warnIcon} alt='warning' />{this.warning.email}</span>}</div>
        <input type="text" placeholder="Email Address" value={this.email} onChange={this.onChangeEmail} />
      </div>
      <div className={styles.row}>
        <div className={styles.warning}>{this.warning.password && <span><img src={warnIcon} alt='warning' />{this.warning.password}</span>}</div>
        <input type="password" placeholder="Set a Password" value={this.password} onChange={this.onChangePassword} onKeyUp={this.onKeyUp} />
      </div>
      <div className={styles.buttonRow}>
        <button className={styles.button} onClick={this.login}>
          <span>Sign In</span>
        </button>
        <div className={styles.signup} onClick={this.register}><span>Sign Up</span></div>
      </div>
    </div>
  }
}
