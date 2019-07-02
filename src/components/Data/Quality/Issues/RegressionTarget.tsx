import React, { Component } from 'react';
import styles from '../styles.module.css';
import { observer } from 'mobx-react';

import EN from '../../../../constant/en';

interface RegressionTargetProps {
  backToConnect: () => void,
  backToSchema: () => void,
  hasIssue: boolean,
  unique: number,
  recomm: number
}

class RegressionTarget extends Component<RegressionTargetProps> {
  render() {
    const { backToConnect, backToSchema, hasIssue, unique, recomm } = this.props;
    return !hasIssue ? null : <div className={styles.block}>
      <div className={styles.name}><span>{EN.TargetVariableUniqueValue}</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.infoBox}>
            <div className={styles.infoBlock}>
              <div className={styles.num}><span>{unique}</span></div>
              <div className={styles.text}><span>{EN.YourUniqueValue}</span></div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.num}><span>{recomm}+</span></div>
              <div className={styles.text}><span>{EN.Recommended}</span></div>
            </div>
          </div>
        </div>
        <div className={styles.methods}>
          <div className={styles.reasonTitle}><span>{EN.PossibleReasons}</span></div>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Itsthewrongtargetvariable}</span></div>
              <div className={styles.button} onClick={backToSchema}>
                <button><span>{EN.ReselectTargetVariable}</span></button>
              </div>
            </div>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Itsgeneraldataqualityissue}</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>{EN.LoadaNewDataset}</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default observer(RegressionTarget)