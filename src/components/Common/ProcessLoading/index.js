import React, { Component } from 'react';
import styles from './styles.module.css';
import { Progress, Spin } from 'antd';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { formatNumber } from 'util'

@observer
class ProcessLoading extends Component {
  @observable value

  constructor(props) {
    super(props)
    this.setProgress(props.progress)
  }

  componentWillReceiveProps(props) {
    this.setProgress(props.progress)
  }

  setProgress = progress => {
    if (typeof progress === 'number') {
      this.value = Math.max(progress, (this.value || 0))
    }
  }

  render() {
    const { style } = this.props
    return <div className={styles.load} style={style}>
      <div className={styles.block}>
        {typeof this.value === 'number' ?
          <Progress
            percent={this.value}
            // status="active"
            strokeWidth={12}
            format={percent => <div className={styles.text}>{formatNumber(percent, 2)}%</div>}
            type="circle"
          /> :
          <Spin tip="Loading..." size="large"></Spin>}
      </div>
    </div>
  }
}

export default ProcessLoading