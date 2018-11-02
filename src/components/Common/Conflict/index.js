import React, { Component } from 'react';
import styles from './styles.module.css';

export default class Conflict extends Component {
  render() {
    const { onConfirm, onClose } = this.props
    return <div className={styles.conflict}>
      <div className={styles.mask}></div>
      <div className={styles.block}>
        <div className={styles.content}>
          <div className={styles.text}>You have been kicked out of the project by another user.</div>
        </div>
        <div className={styles.bottom}>
          <button className={styles.save} onClick={onConfirm} ><span>Go Back to the Project</span></button>
          <button className={styles.cancel} onClick={onClose}><span>Go to Home Page</span></button>
        </div>
      </div>
    </div>
  }
}
