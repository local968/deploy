import React from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { formatNumber } from '../../../util'
import { Spin } from 'antd'
import Model from 'stores/Model';

interface VariableImpactProps {
  model: Model
  mapHeader: StringObject
}
const VariableImpact = observer((props:VariableImpactProps)=>{
  const { model, mapHeader } = props;
  const { featureImportance, permutationImportance, importanceLoading } = model as any;
  const keys = Object.keys(featureImportance);
  if (!keys.length && !importanceLoading) permutationImportance();

  const arr = Object.entries(featureImportance).sort(
    (a:any, b:any) => b[1] - a[1]
  );
  return (
    <div className={styles.detail}>
      {!arr.length ? <div className={styles.detailNone}>
        <Spin size='large' />
      </div> : arr.map((row:any, index) => {
        return (
          <div key={index} className={styles.detailRow}>
            <div className={styles.detailName}>
              <span title={mapHeader[row[0]] || row[0]}>{mapHeader[row[0]] || row[0]}</span>
            </div>
            <div
              className={styles.detailProcess}
              style={{ width: row[1] * 7 + 'em' }}
            />
            <div className={styles.detailNum}>
              <span title={formatNumber(row[1].toString())}>{formatNumber(row[1].toString())}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});
export default VariableImpact;
