import React, { Component } from 'react';
import styles from './AdvancedView.module.css';

interface Interface {
  curSelected: any;
  value: any;
  thumbnail:any
  onClick: any;
}

export default class Thumbnail extends Component<Interface> {
  state = {
    clickActive: false,
    hoverActive: false,
  };
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
  };
  handleMouseEnter = () => {
    this.setState({ hoverActive: true });
  };
  handleMouseLeave = () => {
    this.setState({ hoverActive: false });
  };
  render() {
    const { selectedIcon, hoverIcon, normalIcon, text } = this.props.thumbnail;
    const { clickActive, hoverActive } = this.state;
    const icon = clickActive
      ? selectedIcon
      : hoverActive
      ? hoverIcon
      : normalIcon;
    return (
      <div
        className={styles.thumbnail}
        onClick={this.handleClick}
      >
        <img src={icon} alt="icon" />
        <div>{text}</div>
      </div>
    );
  }
}
