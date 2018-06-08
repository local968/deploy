import React, { Component } from 'react';
import styles from './styles.module.css';
import classsnames from 'classnames';

import { toLocaleString } from '../../../util';

export default class Row extends Component {
  render() {
    const {children, rowStyle} = this.props;
    return (
      <div className={styles.row} style={rowStyle} >
        {children}
      </div>
    );
  }
}

export class RowCell extends Component {
  render() {
    const {data, cellStyle, other, cellClassName, ...rest} = this.props;
    
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classsnames(styles.cell, cellClassName)}
        title={(typeof data === 'string' || typeof data === 'number') ? data : null}
      >
        {toLocaleString(data)}
        {other}
      </div>
    );
  }
}
