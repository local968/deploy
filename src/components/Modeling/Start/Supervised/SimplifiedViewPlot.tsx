import React, { ReactElement } from 'react';
import styles from './styles.module.css';
import { HistogramCategorical, HS } from '../../../Charts';

interface Interface {
  readonly type:string
  readonly style?:any
  readonly data:any
  readonly target?:any
  readonly value?:any
  readonly result:any
  readonly renameVariable?:any
  readonly across?:boolean
}

export default function SimplifiedViewPlot(props:Interface):ReactElement{
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

