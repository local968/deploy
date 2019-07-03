
import React, { Component } from 'react';
import styles from '../styles.module.css';
import { observer } from 'mobx-react';
import EN from '../../../../constant/en';

interface RowIssueProps {
  backToConnect: () => void,
  totalRawLines: number
}

export class RowIssue extends Component<RowIssueProps> {
  render() {
    const { backToConnect, totalRawLines } = this.props;
    return <div className={styles.block}>
      <div className={styles.name}><span>{EN.Datasizeistoosmall}</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            <div className={styles.progressText}><span>{EN.AllDatatotalRawLinesrows} ({totalRawLines} {EN.Rows})</span><span>{EN.Rowsminimum}</span></div>
            <div className={styles.progress} style={{ width: totalRawLines / 10 + "%" }}></div>
          </div>
        </div>
        <div className={styles.methods}>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Datasize} > {EN.Rowsisrecommended}</span></div>
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

export default observer(RowIssue)