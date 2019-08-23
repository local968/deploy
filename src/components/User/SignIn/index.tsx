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
import { Link } from 'react-router-dom';

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

function showConfirm(props, email, password,userStore) {
  confirm({
    width: 400,
    icon: '',
    content: header(props),
    okText: EN.YES,
    cancelText: EN.NO,
    onOk() {
      props.userStore.isCheck ? localStorage.setItem('checked', String(true)) : null;
      props.userStore.change('isWatchVideo')(true);

      userStore.status = 'login';
      userStore.getStatus();

      props.userStore.login({ email, password }, props);
      props && props.history.push({
        pathname: '/support', state: {
          key
            : 'loginTo'
        }
      });
      props.userStore.change('tabKey')('2');
    },
    onCancel() {
      props.userStore.isCheck ? localStorage.setItem('checked', String(true)) : null;
      props.userStore.change('isWatchVideo')(false);

      userStore.status = 'login';
      userStore.getStatus();

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
    userStore.login({ email, password }).then((res: any) => {
      if (res.data.status === 200) {
        if (!isShowModal) {
          showConfirm(this.props, email, password,userStore)
        } else {
          userStore.status = 'login';
          userStore.getStatus();
        }
        userStore.info = res.data.info;
      } else {
        alert(res.data.message || 'Login failure')
      }
    })
  };

  onKeyUp = (event) => {
    if (event.keyCode === 13) this.login()
  };

  register = () => {
    if(!config.register) return;
    const {history} = this.props as any;
    history.push("/signup")
  };

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
        <Link
          className={styles.forgetPassword}
          to='/forgetpassword'>
          {EN.ForgetPassword}?
        </Link>
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
