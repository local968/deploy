import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './styles.module.css';
import logo from './mr-one-logo-blue.svg';
import home from './icon-home.svg';
import help from './icon-help.svg';
import switchIcon from './switch.svg';

export default ({ history }) => (
  <aside className={styles.sider}>
    <div className={styles.logo}>
      <img src={logo} alt="logo" />
      <h2 className={styles.mrone}>Mr.one</h2>
    </div>
    <div className={styles.menus}>
      <a className={styles.home} onClick={() => history.push('/')}>
        <img alt="home" src={home} />
        <h4 className={styles.nav}>Home</h4>
      </a>
      <a className={styles.support}>
        <img alt="support" src={help} />
        <h4 className={styles.nav}>Support</h4>
      </a>
    </div>
    <a className={styles.bottom}>
      <img alt="switch" src={switchIcon} />
      <h4 className={styles.nav}>
        Model<br />Training
      </h4>
    </a>
  </aside>
);
