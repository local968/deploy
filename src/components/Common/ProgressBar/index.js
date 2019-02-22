import React, { Component } from 'react';
import styles from './styles.module.css';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

@observer
class ProgressBar extends Component {
  @observable value

  constructor(props) {
    super(props)
    this.setProgress(props.progress)
  }

  componentWillReceiveProps(props) {
    this.setProgress(props.progress, props.allowRollBack)
  }

  setProgress = (progress, allowRollBack) => {
    if (typeof progress === 'number') {
      this.value = allowRollBack ? progress : Math.max(progress, (this.value || 0))
    } else {
      this.value = 0
    }
  }

  render() {
    const { style } = this.props
    return <div className={styles.processBg} style={style}>
      <div className={styles.processBlock}>
        <div className={styles.process} style={{ width: `${this.value}%` }}></div>
      </div>
      <div className={styles.text}>{`${this.value.toFixed(2)}%`}</div>
    </div>
  }
}

export default ProgressBar
