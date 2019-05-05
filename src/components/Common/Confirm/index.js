import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import Modal from '../Modal'
import EN from '../../../constant/en'

export default class Confirm extends Component {
  render() {
    const { width, visible, title, content, onClose, onConfirm, confirmText, closeText, closeByMask, showClose } = this.props
    return <Modal
      width={width}
      title={title}
      visible={visible}
      onClose={onClose}
      closeByMask={typeof closeByMask === 'undefined' ? true : closeByMask}
      showClose={typeof showClose === 'undefined' ? true : showClose}
      content={<div className={styles.deleteModal}>
        <div className={styles.modalText}><span>{content}</span></div>
        <div className={styles.modalBox}>
          <button className={classnames(styles.modalButton, styles.modalCancel)} onClick={onClose}><span id={styles.modalCloseText}>{closeText || EN.Cancel}</span></button>
          <button className={classnames(styles.modalButton, styles.modalConfirm)} onClick={onConfirm}><span id={styles.modalConfirmText}>{confirmText || "OK"}</span></button>
        </div>
      </div>}>
    </Modal>
  }
}
