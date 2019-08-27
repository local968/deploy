import React from 'react';
import styles from './styles.module.css';
import { HistogramCategorical, HS } from '../../../Charts';

interface Interface {
  type:any
  style?:any
  data:any
  target?:any
  value?:any
  result:any
  renameVariable?:any
  across?:boolean
}

export default function SimplifiedViewPlot(props:Interface){
    const { type, style, data, target,value,result,renameVariable={},across} = props;
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
        data={data}
        xAxisName = {data.map((itm)=>target?(renameVariable[itm.name]||itm.name):itm.name)}
        across = {across}
        width = {550}
        height = {330}
      />
    </div>
}

