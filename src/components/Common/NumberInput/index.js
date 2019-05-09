import React, { Component } from 'react';
// import styles from './styles.module.css';
import { observable } from 'mobx'
import { observer } from 'mobx-react';
import { message } from 'antd'
import EN from '../../../constant/en'

@observer
export default class NumberInput extends Component {
  @observable isFocus = false
  @observable temp = ""

  handleChange = e => {
    if (!this.isFocus) return
    this.temp = e.target.value
  }

  handleFocus = () => {
    this.temp = this.props.value
    this.isFocus = true
  }

  handleBlur = () => {
    const { temp, props: { value, isInt, min, max, onBlur } } = this
    if (!temp || isNaN(temp)) return this.temp = value
    try {
      const num = parseFloat(temp)
      if (isInt && num.toString().includes(".")) throw new Error(EN.Thenumbermustbeaninteger)
      if ((min || (!min && min === 0)) && num < min) throw new Error(`${EN.Thenumbermustbegreaterthanorequalto}10`)
      if ((max || (!max && max === 0)) && num > max) throw new Error(`${EN.Thenumbermustbelessthanorequalto}${max}`)
      onBlur(num)
      this.isFocus = false
    } catch (err) {
      message.error(err.message)
      this.temp = value
      this.isFocus = false
    }
  }

  render() {
    const { props, isFocus, temp } = this
    const { value, style, className } = props
    return <input className={className} onBlur={this.handleBlur} value={isFocus ? temp : value} onChange={this.handleChange} style={style} onFocus={this.handleFocus} />
  }
}

