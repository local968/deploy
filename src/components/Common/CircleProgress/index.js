import React, { Component } from 'react'
import styles from './styles.module.css'
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';

@observer
export default class Circle extends Component {
  @observable percent = 0
  @observable prevPercent = 0
  @observable stage = false

  @computed
  get state1() {

  }

  constructor(props) {
    super(props)

  }

  componentDidMount() {
    window.cc = this
  }

  render() {
    return <div className={styles.circle}>
      <div className={styles.topLeft}>
        <div className={styles.circumference}></div>
        <div className={styles.cover}></div>
        <div className={styles.bl} style={{ transform: `rotateZ(${this.state4 * 0.9}deg)` }}></div>
      </div>
      <div className={styles.topRight}>
        <div className={styles.circumference}></div>
        <div className={styles.cover}></div>
        <div className={styles.tl} style={{ transform: `rotateZ(${this.state1 * 0.9}deg)` }}></div>
      </div>
      <div className={styles.bottomLeft}>
        <div className={styles.circumference}></div>
        <div className={styles.cover}></div>
        <div className={styles.br} style={{ transform: `rotateZ(${this.state3 * 0.9}deg)` }}></div>
      </div>
      <div className={styles.bottomRight}>
        <div className={styles.circumference}></div>
        <div className={styles.cover}></div>
        <div className={styles.tr} style={{ transform: `rotateZ(${this.state2 * 0.9}deg)` }}></div>
      </div>
    </div>
  }
}
