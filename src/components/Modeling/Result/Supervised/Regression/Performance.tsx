import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from '../styles.module.css';
import { formatNumber } from '../../../../../util';
import EN from '../../../../../constant/en';
import { Hint } from 'components/Common';
import Model from 'stores/Model';

interface Interface {
  current: Model
}
@observer
export default class Performance extends Component<Interface> {
  render() {
    const { current } = this.props;
    return (
      <div className={styles.performanceBox}>
        <div className={styles.performance}>
          <div className={styles.rmsePerformance}>
            <span>{formatNumber(current.score.validateScore.nrmse.toString())}</span>
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
            <span>{formatNumber(current.score.validateScore.r2.toString())}</span>
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
