import React from 'react';
import styles from './styles.module.css';
import logo from './mr-one-logo-blue.svg';

export default () => (
  <aside className={styles.sider}>
    <div className={styles.logo}>
      <img src={logo} />
      <h2 className={styles.mrone}>Mr.one</h2>
    </div>
    <div className={styles.menus}>
      <a className={styles.home} />
      <a className={styles.support} />
    </div>
    <div className={styles.bottom} />
  </aside>
);
