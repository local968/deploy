import React, { Component } from 'react';
import styles from './styles.module.css';
import { Slider } from 'antd'

export default class Range extends Component {
  stop = e => {
    e.stopPropagation()
  }

  render() {
    const { range, min, max, onChange, value, step, tooltipVisible, marks } = this.props;
    return <div className={styles.range} onMouseOver={this.stop}>
      <Slider
        range={range}
        min={min}
        max={max}
        onChange={onChange}
        value={value}
        step={step}
        tooltipVisible={tooltipVisible}
        marks={marks}
      />
    </div>
  }
}