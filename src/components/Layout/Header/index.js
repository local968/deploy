import React from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { Icon } from 'antd';
import mockAvatar from 'components/Layout/Sider/mr-one-copy.svg';
import more from './combined-shape-copy.svg';

export default () => (
  <div className={styles.header}>
    <div className={classnames(styles.block, styles.total)}>
      <span className={styles.number}>115</span>
      <span className={styles.text}>Total Project</span>
    </div>
    <div className={classnames(styles.block, styles.enabled)}>
      <span className={styles.number}>12</span>
      <span className={styles.text}>Enabled</span>
    </div>
    <div className={classnames(styles.block, styles.disabled)}>
      <span className={styles.number}>32</span>
      <span className={styles.text}>Disabled</span>
    </div>
    <div className={styles.gap} />
    <div className={classnames(styles.block, styles.normal)}>
      <span className={styles.number}>43</span>
      <span className={styles.text}>Normal</span>
    </div>
    <div className={classnames(styles.block, styles.issue)}>
      <span className={styles.number}>54</span>
      <span className={styles.text}>Issue</span>
    </div>
    <div className={styles.empty} />
    <div className={styles.user}>
      <img src={mockAvatar} alt="avatar" className={styles.avatar} />
      <div className={styles.userBottom}>
        <span className={styles.name}>Newton Barley</span>
        <img className={styles.down} src={more} alt={more} />
      </div>
    </div>
  </div>
);
