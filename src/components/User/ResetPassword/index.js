import React, { Component } from 'react';
import styles from '../styles.module.css'

export default () => <div className={styles.block}>
  <h3 className={styles.title}>Reset Your Password</h3>
  <p className={styles.description}>Please enter your new password below to reset.</p>
  <input className={styles.input} type='password' placeholder='Enter a New Password' />
  <input className={styles.input} type='password' placeholder='Confirm Password' />
  <a className={styles.submit}>Reset Password</a>
</div>
