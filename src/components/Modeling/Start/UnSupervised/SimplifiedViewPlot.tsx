import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './styles.module.css';
import { HistogramCategorical, HS } from '../../../Charts';

interface Interface {
  type:any
  style?:any
  data:any
  value:any
  result:any
}
@observer
export default class SimplifiedViewPlot extends Component<Interface> {

  render() {
    const { type, style, data, value, result } = this.props;
    if (type === 'Raw') return null;
    if (type === 'Numerical') {
      return <div className={styles.plot} style={{
        width: 600,
        height: 500,
        flexDirection: 'column',
      }}>
        <HS
          x_name={value}
          y_name={'count'}
          data={data}
          result={result}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      <HistogramCategorical
        x_name={value}
        y_name={'count'}
        data={data}
        width = {550}
        height = {330}
      />
    </div>
  }
}
