import React, { Component } from 'react';
import styles from '../styles.module.css'

export default () => <div className={styles.block}>
  <h3 className={styles.title}>Change Your Password</h3>
  <p className={styles.description}>Please enter your current password and your new password below.</p>
  <input className={styles.input} type='password' placeholder='Current Password' />
  <input className={styles.input} type='password' placeholder='New Password' />
  <input className={styles.input} type='password' placeholder='Repeat Your New Password' />
  <a className={styles.submit}>Submit</a>
</div>
