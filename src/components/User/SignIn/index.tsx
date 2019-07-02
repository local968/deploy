import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";
import warnIcon from "./fail.svg";
import { observable, action, runInAction } from 'mobx';
import EN from '../../../constant/en';
import { Modal, Checkbox } from 'antd';
import copyIcon from './icon-test copy.svg'
import deleteIcon from './delete.png'
import config from 'config'

const {confirm} = Modal;

const header = (props) => {
  return (
    <div>
      <div className={styles.content_head}>
        <img onClick={() => { Modal.destroyAll(); props.userStore.change('isCheck')(false) }} src={deleteIcon}  alt=''/>
      </div>
      <div className={styles.content_icon}>
        <img src={copyIcon}  alt=''/>
        <p>{EN.watchtheinstructionalvideos}</p>
      </div>
      <Checkbox onChange={(e) => props.userStore.change('isCheck')(e.target.checked)}>{EN.Dontpromptforthismessage}</Checkbox>
    </div>
  )
};

function showConfirm(props, email, password) {
  confirm({
    width: 400,
    icon: '',
    content: header(props),
    okText: EN.YES,
    cancelText: EN.NO,
    onOk() {
      props.userStore.isCheck ? localStorage.setItem('checked', String(true)) : null;
      props.userStore.change('isWatchVideo')(true);
      props.userStore.login({ email, password }, props);
      props.userStore.change('tabKey')('2');
    },
    onCancel() {
      props.userStore.isCheck ? localStorage.setItem('checked', String(true)) : null;
      props.userStore.change('isWatchVideo')(false);
      props.userStore.login({ email, password });
    },
  });
}

@inject('userStore')
@observer
export default class SignIn extends Component {
  @observable email = window.localStorage.getItem('deploy2-email') || '';
  @observable password = '';
  @observable warning = {
    email: '',
    password: ''
  };

  onChangeEmail = action(({target}) => {
    this.email = target.value.toLowerCase()
  });

  onChangePassword = action(({target}) => {
    this.password = target.value
  });

  login = () => {
    const { email, password, warning } = this;
    if (!email) {
      warning.email = EN.Enteryouremail;
    } else if (!new RegExp(/^[a-zA-Z0-9_-]+(\.([a-zA-Z0-9_-])+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).test(email)) {
      warning.email = EN.Enteravaildemial;
    } else {
      warning.email = '';
    }

    if (!password) {
      warning.password = EN.EnterNewPassword;
    } else {
      warning.password = '';
    }

    if (warning.email || warning.password) {
      return runInAction(() => {
        this.warning = warning
      })
    }
    const isShowModal = localStorage.getItem('checked');
    const {userStore} = this.props as any;
    if (!isShowModal) {
      showConfirm(this.props, email, password)
    } else {
      userStore.login({ email, password })
    }
  };

  onKeyUp = (event) => {
    if (event.keyCode === 13) this.login()
  };

  register = () => {
    if(!config.register) return;
    const {history} = this.props as any;
    history.push("/signup")
  };

  forget(){
    const {history} = this.props as any;
    history.push("/forgetpassword")
  }

  render() {
    return <div className={styles.signin}>
      <div className={styles.title}><span>{EN.SignIn}</span></div>
      <div className={styles.row}>
        <div className={styles.warning}>{this.warning.email && <span><img src={warnIcon} alt='warning' />{this.warning.email}</span>}</div>
        <input type="text" placeholder={EN.EmailAddress} value={this.email} onChange={this.onChangeEmail.bind(this)} />
      </div>
      <div className={styles.row}>
        <div className={styles.warning}>{this.warning.password && <span><img src={warnIcon} alt='warning' />{this.warning.password}</span>}</div>
        <input type="password" placeholder={EN.SetPassword} value={this.password} onChange={this.onChangePassword.bind(this)} onKeyUp={this.onKeyUp} />
      </div>
      <div className={styles.row}>
        <a
          className={styles.forgetPassword}
          href="javascript:;"
          onClick={this.forget.bind(this)}
        >
          {EN.ForgetPassword}?
        </a>
      </div>
      <div className={styles.buttonRow}>
        <button className={styles.button} onClick={this.login}>
          <span>{EN.SignIn}</span>
        </button>
        {config.register && <div className={styles.signup} onClick={this.register}><span>{EN.SignUp}</span></div>}
      </div>
    </div>
  }
}
