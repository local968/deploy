import React, {Component} from 'react';
import {Popover, Icon} from 'antd';

import styles from './styles.module.css';

export default class Hint extends Component {
  render () {
    const {content, placement, themeStyle} = this.props;
    return (
      <Popover
        overlayClassName={styles.popover}
        content={content}
        placement={placement} >
        <Icon className={styles.icon} style={themeStyle} type="question-circle-o" />
      </Popover>
    );
  }
}