import React, { Component } from 'react';
import styles from './AdvancedView.module.css';

export default class Thumbnail extends Component {
  state = {
    clickActive: false,
    hoverActive: false
  }
  componentDidMount() {
    const { curSelected, value } = this.props;
    this.setState({ clickActive: curSelected === value });
  }
  componentWillReceiveProps(nextProps) {
    const { curSelected, value } = nextProps;
    this.setState({ clickActive: curSelected === value });
  }
  handleClick = e => {
    e.stopPropagation();
    this.setState({ clickActive: true });
    this.props.onClick(this.props.value);
  }
  // handleMouseEnter = () => {
  //   this.setState({ hoverActive: true });
  // }
  // handleMouseLeave = () => {
  //   this.setState({ hoverActive: false });
  // };
  render() {
    const { selectedIcon, hoverIcon, normalIcon, text } = this.props.thumbnail;
    const { clickActive, hoverActive } = this.state;
    const icon = clickActive ? selectedIcon : hoverActive ? hoverIcon : normalIcon;
    return (
      <div
        className={styles.thumbnail}
        // onMouseEnter={this.handleMouseEnter}
        // onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
      >
        <img src={icon} alt="icon" />
        <div>{text}</div>
      </div>
    )
  }
}
