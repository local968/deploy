import React, { Component } from 'react';
import styles from './styles.module.css';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { formatNumber } from '../../../util';
interface Interface {
  progress: any
  style?: any,
  allowRollBack?: boolean
}
@observer
export default class ProgressBar extends Component<Interface> {
  @observable value;

  constructor(props) {
    super(props);
    this.setProgress(props.progress);
  }

  componentWillReceiveProps(props) {
    this.setProgress(props.progress, props.allowRollBack);
  }

  setProgress = (progress, allowRollBack = false) => {
    if (typeof progress === 'number') {
      this.value = allowRollBack
        ? progress
        : Math.max(progress, this.value || 0);
    } else {
      this.value = 0;
    }
  };

  render() {
    const { style } = this.props;
    return (
      <div className={styles.processBg} style={style}>
        <div className={styles.processBlock}>
          <div className={styles.process} style={{ width: `${this.value}%` }} />
        </div>
        <div className={styles.text}>{`${formatNumber(this.value, 2)}%`}</div>
      </div>
    );
  }
}
