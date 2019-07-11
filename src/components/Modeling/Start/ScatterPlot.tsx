import React, { Component } from 'react';
import styles from './styles.module.css';
import { BoxPlots, TSENOne, UnivariantPlots } from '../../Charts';

interface Interface {
  type:any
  style?:any
  data:any
  message:any
  colType:any
}

export default class ScatterPlot extends Component<Interface> {
  render() {
    const { type, style, data, message, colType } = this.props;
    if (type === 'Regression') {
      //散点图
      if (colType === 'Numerical') {
        return <div className={styles.plot} style={style}>
          <TSENOne
            x_name={message.x}
            y_name={message.y}
            data={data}
          />
        </div>
      }

      //箱线图
      return <div className={styles.plot} style={style}>
        <BoxPlots
          x_keys={data.x_keys}
          value={data.value}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      <UnivariantPlots
        x_name={message.x}
        y_name={message.y}
        result={data}
      />
    </div>

  }
}
