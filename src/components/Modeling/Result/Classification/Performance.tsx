import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from '../styles.module.css';
import { Progress } from 'antd';
import { formatNumber } from '../../../../util';
import EN from '../../../../constant/en';
import {Hint} from 'components/Common'
import Predicted from './Predicted'
interface Interface {
  current:any
  yes:any
  no:any
}
@observer
export default class Performance extends Component<Interface> {
  render() {
    const { current, yes, no } = this.props;
    return (
      <div className={styles.performanceBox}>
        <div className={styles.performance}>
          <Progress
            width={84}
            type="circle"
            percent={current.score.validateScore.auc * 100}
            format={percent => (
              <span className={styles.performanceScore}>
                {formatNumber(String(percent / 100), 2)}
              </span>
            )}
            strokeColor={'#f5a623'}
          />
          <div className={styles.performanceText}>
            <span>
              <Hint content={EN.Areaunderthecurve} /> {EN.PerformanceAUC}
            </span>
          </div>
        </div>
        <Predicted model={current} yes={yes} no={no} />
      </div>
    );
  }
}
