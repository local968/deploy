import React, { Component } from 'react';
import styles from '../styles.module.css'

export default () => <div className={styles.block}>
  <h3 className={styles.title}>Forget Password</h3>
  <p className={styles.description}>Please enter your email address you registered with us, and we’ll send you instruction on how to reset your password</p>
  <input className={styles.input} type='text' placeholder='Email Address' />
  <a className={styles.submit}>Send</a>
</div>

// export default () => <div className={styles.block}>
//   <h3 className={styles.title}>Reset Your Password</h3>
//   <p className={styles.description}>We have sent a reset password email to yutong@gmail.com. Please click the resepassword link to set your new password. <br /><br /><br />Didn’t receive the email yet? Please check your spam folder, or <a>resend</a> the email.</p>
// </div>
