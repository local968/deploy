import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './styles.module.css';
import { CorrelationMatrixs } from '../../../Charts';
import { Icon } from 'antd';

interface CorrelationPlotInterface {
  onClose:any
  CorrelationMatrixData:any
}
@observer
export default class CorrelationPlot extends Component<CorrelationPlotInterface> {
  render() {
    const { onClose, CorrelationMatrixData } = this.props;
    const { type, value } = CorrelationMatrixData;
    return (
      <div className={styles.correlationPlot}>
        <div
          onClick={onClose}
          style={{ zIndex: 5 }}
          className={styles.plotClose}
        >
          <span>
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
          </span>
        </div>
        <CorrelationMatrixs value={value} type={type} />
      </div>
    );
  }
}
