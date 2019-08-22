import React from 'react';
import styles from './styles.module.css';
import EN from '../../../constant/en';

export default function ModelError() {
  return <div className={styles.error}>
      <span>{EN.TrainingFailed}</span>
  </div>
}
