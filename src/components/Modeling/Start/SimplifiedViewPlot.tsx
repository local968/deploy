import React, { Component } from 'react';
import styles from './styles.module.css';
import { HistogramCategorical, HS } from '../../Charts';

interface Interface {
  type:any
  style?:any
  data:any
  target?:any
  value?:any
  result:any
  renameVariable?:any
}

export default class SimplifiedViewPlot extends Component<Interface> {

  render() {
    const { type, style, data, target,value,result,renameVariable={}} = this.props;
    if (type === 'Raw') return null;
    if (type === 'Numerical') {
      return <div className={styles.plot} style={{
        width: 600,
        height: 500,
        flexDirection: 'column',
      }}>
        <HS
          x_name={target||value}
          y_name={'count'}
          data={data}
          result={result}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      <HistogramCategorical
        x_name={target||value}
        title={`Feature:${target||value}`}
        data={data}
        xAxisName = {data.map((itm)=>target?(renameVariable[itm.name]||itm.name):itm.name)}
      />
    </div>
  }
}

