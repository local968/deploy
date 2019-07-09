import React, { Component } from 'react';
import styles from './styles.module.css';
import { HistogramCategorical, HS } from '../../Charts';

interface Interface {
  type:any
  style?:any
  data:any
  target:any
  result:any
}

export default class SimplifiedViewPlot extends Component<Interface> {

  render() {
    const { type, style, data, target, result } = this.props;
    if (type === 'Raw') return null;
    if (type === 'Numerical') {
      return <div className={styles.plot} style={{
        width: 600,
        height: 500,
        flexDirection: 'column',
      }}>
        <HS
          x_name={target}
          y_name={'count'}
          title={`Feature:${target}`}
          data={data}
          result={result}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      <HistogramCategorical
        x_name={target}
        title={`Feature:${target}`}
        data={data}
      />

    </div>
  }
}
