import React from 'react';
import styles from './styles.module.css';
import loginIcon from './login.svg';
import EN from '../../../constant/en';
import { RouterStore } from 'mobx-react-router';

interface LoginHeaderProps {
  pathname: string,
  routing: RouterStore
}

const LoginHeader = (props: LoginHeaderProps) => (
  <div className={styles.header}>
    <div className={styles.wheader}>
      <span className={styles.welcome}>{EN.WelcometoR2ai}</span>
    </div>
    <div
      className={styles.auth}
      onClick={() =>
        props.pathname === '/'
          ? props.routing.push('/signup')
          : props.routing.push('/')
      }
    >
      <div className={styles.loginIcon}>
        <img src={loginIcon} alt="login" />
      </div>
      <span>{props.pathname === '/' ? EN.SignUp : EN.SignIn}</span>
    </div>
  </div>
);

export default LoginHeader