import React, { useContext, useState } from 'react';
import styles from '../styles.module.css'
import {MobXProviderContext, observer } from 'mobx-react';

import EN from '../../../constant/en';

const ForgetPassword = observer(()=>{
  const {userStore} = useContext(MobXProviderContext);
  const [isSend,upIsSend] = useState(false);
  const [isResend,upIsResend] = useState(false);
  const [email,upEmail] = useState('');

  function send(resend=false) {
    if (isSend && isResend) return;
    upIsSend(true);
    upIsResend(resend);
    return userStore.forgetPassword(email);
  }

  function change(e){
    upEmail(e.target.value);
  }

  const resultTab = <div className={styles.block}>
    <h3 className={styles.title}>{EN.ResetYourPassword}</h3>
    <p className={styles.description}>{EN.Wehavesent} {email}. {EN.Pleaseclickthereset} <br /><br /><br />
    {EN.Didnreceivetheemail}
    <a onClick={send.bind(this,true)}>{EN.Resend}
    </a>
      {EN.Theemail}.
    </p>
  </div>;

  const inputTab = <div className={styles.block}>
    <h3 className={styles.title}>{EN.ForgetPassword}</h3>
    <p className={styles.description}>{EN.Pleaseenteryouremail}</p>
    <input className={styles.input} type='text' value={email} onChange={change.bind(this)} placeholder={EN.EmailAddress} />
    <a className={styles.submit} onClick={send.bind(this,false)}>{EN.Send}</a>
  </div>;
  return isSend ? resultTab : inputTab
});

export default ForgetPassword
