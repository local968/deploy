import React from 'react'
import styles from './Association.module.css'
import EN from '../../../../constant/en'

interface AssociationProps {

}

const Association = (props: AssociationProps) => {
  return <div className={styles.association}>
    <div className={styles.main}>
      <div className={styles.title}><span>{EN.AssociateRules}</span></div>
      <div className={styles.buttons}>
        <div className={styles.button}><span>{EN.AssociateExport}</span></div>
        <div className={styles.button}><span>{EN.AssociatePlots}</span></div>
        <div className={styles.button}><span>{EN.AssociateReModel}</span></div>
      </div>
      <div className={styles.content}>
        <div className={styles.result}></div>
        <div className={styles.views}></div>
        <div className={styles.empty}></div>
      </div>
    </div>
  </div>
}

export default Association