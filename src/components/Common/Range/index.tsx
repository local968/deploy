import React, { Component } from 'react';
import styles from './styles.module.css';
import { Slider } from 'antd'

interface RageProps {
  range?,
  min?,
  max?,
  onChange?,
  value?,
  step?,
  tooltipVisible?,
  marks?
}

export default class Range extends Component<RageProps> {
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