import { observer } from 'mobx-react';
import React from 'react';
import styles from './styles.module.css';
import { CorrelationMatrixs } from '../../../Charts';
import { Icon } from 'antd';

interface Interface {
  onClose:any
  CorrelationMatrixData:{
    data:any
    header:any
    fields:Array<string>
  }
}

const CorrelationPlot = observer((props:Interface)=>{
  const { onClose, CorrelationMatrixData } = props;
  return (
    <div className={styles.correlationPlot}>
      <div
        onClick={onClose}
        style={{ zIndex: 5 }}
        className={styles.plotClose}><span>
          <Icon
            style={{
              float: 'right',
              height: 23,
              alignItems: 'center',
              display: 'flex',
            }}
            onClick={onClose}
            type="close"
          />
          </span></div>

      <CorrelationMatrixs
        message={CorrelationMatrixData}
      />
    </div>
  )
});
export default CorrelationPlot;
