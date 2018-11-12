import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';

@observer
export default class VariableImpact extends Component {
  render() {
    const { model } = this.props;
    const { featureImportanceDetail } = model;
    const arr = Object.entries(featureImportanceDetail).sort(
      (a, b) => b[1] - a[1]
    );
    return (
      <div className={styles.detail}>
        {arr.map((row, index) => {
          return (
            <div key={index} className={styles.detailRow}>
              <div className={styles.detailName}>
                <span title={row[0]}>{row[0]}</span>
              </div>
              <div
                className={styles.detailProcess}
                style={{ width: row[1] * 7 + 'em' }}
              />
              <div className={styles.detailNum}>
                <span title={row[1].toFixed(4)}>{row[1].toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}