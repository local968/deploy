import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { formatNumber } from 'util'
import { Spin } from 'antd'

@observer
export default class VariableImpact extends Component {
  constructor(props) {
    super(props)
    const { featureImportance = {}, permutationImportance, importanceLoading } = props.model
    const keys = Object.keys(featureImportance)
    if(!keys.length && !importanceLoading) permutationImportance()
  }

  render() {
    const { model } = this.props;
    const { featureImportance } = model;
    const arr = Object.entries(featureImportance).sort(
      (a, b) => b[1] - a[1]
    );
    return (
      <div className={styles.detail}>
        {!arr.length ? <div className={styles.detailNone}>
          <Spin size='large' />
        </div> : arr.map((row, index) => {
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
                <span title={formatNumber(row[1])}>{formatNumber(row[1])}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
