import React  from 'react';
// @ts-ignore
import styles from './AdvancedView.module.css';

interface Interface {
  children?:any
  rowStyle?:any
  onClick?
}

export default function Row(props:Interface){
    const { children, rowStyle, ...other } = props;
    return (
      <div className={styles.adrow} style={rowStyle} {...other}>
        {children}
      </div>
    );
}
