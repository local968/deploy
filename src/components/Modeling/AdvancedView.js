import React, { Component } from 'react';
import styles from './styles.module.css';


export default class AdvancedView extends Component {
  render() {
    return (
      <div className={styles.modelResult}>
        <div className={styles.row}>
          <span>
            Modeling Results :{' '}
            <div className={styles.status}>&nbsp;&nbsp;OK</div>
          </span>
        </div>
      </div>
    )
  }
}

