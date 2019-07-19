import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames'
interface Interface {
  predicted: number
  width: number
  label?: string
  type: string
  failType: string
  height?: number
}
@observer
export default class PredictedProgress extends Component<Interface> {
  render() {
    const { predicted, width, label, type, failType, height } = this.props;
    const title =
      label === undefined ? (
        ''
      ) : (
          <div className={styles.progressTitle}>
            <span title={label}>{label}</span>
          </div>
        );
    const predictedPercent = Math.round(predicted * 100);
    const failedPercent = 100 - predictedPercent;
    const isSmaller =
      (!!predictedPercent && predictedPercent < 10) ||
      (!!failedPercent && failedPercent < 10);

    return (
      <div className={styles.progressLine}>
        {title}
        {!!predictedPercent && (
          <div
            className={classnames(styles.progress, styles[type], {
              [styles.progressLarge]: !failedPercent,
              [styles.progressSmall]: isSmaller,
            })}
            style={{
              width: width * predicted + 'em',
              height: (height || 0.27) + 'em',
            }}
          >
            <span>{predictedPercent + '%'}</span>
          </div>
        )}
        {!!failedPercent && (
          <div
            className={classnames(styles.progress, styles[failType], {
              [styles.progressLarge]: !predictedPercent,
              [styles.progressSmall]: isSmaller,
            })}
            style={{
              width: width * (1 - predicted) + 'em',
              height: (height || 0.27) + 'em',
            }}
          >
            <span>{failedPercent + '%'}</span>
          </div>
        )}
      </div>
    );
  }
}
