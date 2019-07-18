import React, { MouseEvent } from 'react';
import styles from './WarningBlock.module.css'
import { Icon } from 'antd';
import EN from '../../../../constant/en'

interface WarningBlockProps {
  backToConnect: () => void
  onClose: () => void,
}

const WarningBlock = (props: WarningBlockProps) => {
  const { backToConnect, onClose } = props

  const submit = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    backToConnect()
  }

  const closed = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    onClose()
  }

  return <div className={styles.main}>
    <div className={styles.title}>
      <span><Icon type="warning" theme='filled' style={{ marginRight: 10 }} />Alert</span>
    </div>
    <div className={styles.content}><span>{EN.WarningBlock}</span></div>
    <div className={styles.footer}>
      <div className={styles.button}><div className={styles.buttonP} onClick={submit}><span>{EN.UploadNewData}</span></div></div>
      <div className={styles.button}><div onClick={closed} className={`${styles.buttonP} ${styles.cancel}`}><span>{EN.Cancel}</span></div></div>
    </div>
  </div>
}

export default WarningBlock