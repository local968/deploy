import React, {useContext, useState } from 'react';
import styles from '../styles.module.css'
import { MobXProviderContext, observer } from 'mobx-react';
import { message } from 'antd'
import EN from '../../../constant/en';

const ChangePassword = observer(()=>{
  const {userStore} = useContext(MobXProviderContext);

  const [current,upCurrent] = useState('');
  const [newPassword,upNewPassword] = useState('');
  const [repeat,upRepeat] = useState('');

  function submit() {
    if (newPassword !== repeat) return message.error(EN.Thetwonewpasswords);
    userStore.changePassword(current, newPassword).then(resp => {
      if (resp.data.status === 200) {
        userStore.status = 'unlogin';

        message.destroy();
        message.info(EN.Passwordchangesucceeded)
      } else {

        message.destroy();
        message.error(resp.data.message);
        console.error(resp.data.error)
      }
    }, () => {
      message.destroy();
      message.error(EN.Passwordchangefailed)
    })
  }

  function change(fun,e){
    fun(e.target.value);
  }

  return <div className={styles.block}>
    <h3 className={styles.title}>{EN.ChangeYourPassword}</h3>
    <p className={styles.description}>{EN.Pleaseenteryourcurrent}</p>
    <input className={styles.input} value={current} onChange={change.bind(this,upCurrent)} type='password' placeholder={EN.CurrentPassword} />
    <input className={styles.input} value={newPassword} onChange={change.bind(this,upNewPassword)} type='password' placeholder={EN.NewPassword} />
    <input className={styles.input} value={repeat} onChange={change.bind(this,upRepeat)} type='password' placeholder={EN.ConfirmYour} />
    <a className={styles.submit} onClick={submit}>{EN.Submit}</a>
  </div>
});

export default ChangePassword
