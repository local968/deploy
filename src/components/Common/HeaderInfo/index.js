import React, { Component } from 'react';
import styles from './styles.module.css'

export default class HeaderInfo extends Component {
  render() {
    const { row, col, style, rotate } = this.props
    return <div className={styles.content} style={style}>
      <div className={styles.row} style={{ marginLeft: 'auto', alignItems: 'flex-end' }}><span id={styles.text} title={row}>{row}</span></div>
      <div className={styles.sep}><span id={styles.sepText} style={{ transform: `rotate(${rotate || 21.8}deg)` }}></span></div>
      <div className={styles.row} style={{ marginRight: 'auto' }}><span id={styles.text} title={col}>{col}</span></div>
    </div>;
  }
}