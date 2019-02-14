import React, { Component } from 'react';
import styles from './styles.module.css'

export default class HeaderInfo extends Component {
  render() {
    const { row, col, height, width } = this.props
    return <div className={styles.content} style={{ height, width }}>
      <div className={styles.row} style={{ marginLeft: 'auto' }}><span id={styles.text} title={row}>{row}</span></div>
      <div className={styles.sep}><span id={styles.sepText} style={{ transform: 'rotate(21.8deg)' }}></span></div>
      <div className={styles.row} style={{ marginRight: 'auto' }}><span id={styles.text} title={col}>{col}</span></div>
    </div>;
  }
}