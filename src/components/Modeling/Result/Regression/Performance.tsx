import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from '../styles.module.css';
import { formatNumber } from '../../../../util';
import EN from '../../../../constant/en';
import { Hint } from 'components/Common';

interface Interface {
  current:any
}
@observer
export default class Performance extends Component<Interface> {
  render() {
    const { current } = this.props;
    return (
      <div className={styles.performanceBox}>
        <div className={styles.performance}>
          <div className={styles.rmsePerformance}>
            <span>{formatNumber(current.score.validateScore.nrmse)}</span>
          </div>
          <div className={styles.performanceText}>
            <span>
              <Hint content={EN.RootMeanSquareErrorRMSEmeasures} />{' '}
              {EN.NormalizedRMSE}
            </span>
          </div>
        </div>
        <div className={styles.space} />
        <div className={styles.performance}>
          <div className={styles.r2Performance}>
            <span>{formatNumber(current.score.validateScore.r2)}</span>
          </div>
          <div className={styles.performanceText}>
            <span>
              {EN.GoodnessofFit} (R<sup>2</sup>)
            </span>
          </div>
        </div>
      </div>
    );
  }
}
