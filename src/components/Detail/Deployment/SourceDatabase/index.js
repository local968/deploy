import React, { Component } from 'react';
import styles from './styles.module.css';
import { Modal } from 'antd';

export default class SourceDatabase extends Component {
  render() {
    const { visible } = this.props;
    return (
      <Modal closable={false} visible footer={null}>
        <div className={styles.title}>Data Source - Database</div>
        asddsa
      </Modal>
    );
  }
}
