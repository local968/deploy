import React  from 'react';
import styles from './AdvancedView.module.css';
import { formatNumber } from "../../../util";
import classnames from 'classnames'

interface Interface {
  data:any
  cellStyle?:any
  cellClassName?:any
  title?:any
  notFormat?:any
}
export default function RowCell(props:Interface){
    const { data, cellStyle, cellClassName, title, notFormat, ...rest } = props;
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={title ? title : typeof data === 'object' ? '' : data}
      >
        {notFormat ? data : formatNumber(data)}
      </div>
    );
}
