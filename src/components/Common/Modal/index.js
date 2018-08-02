import React, { Component } from 'react';
import styles from './styles.module.css';

export default class Modal extends Component {
    render() {
        const { visible, width, content, title, onClose } = this.props;
        const blockStyle = width ? { width: width } : {};
        return !!visible && <div className={styles.modal}>
            <div className={styles.cover} onClick={onClose}></div>
            <div className={styles.block} style={blockStyle}>
                <div className={styles.title}>
                    <span id={styles.titleText}>{title}</span>
                    <div className={styles.close} onClick={onClose}>
                        <span id={styles.titleText}>X</span>
                    </div>
                </div>
                <div className={styles.content}>{content}</div>
            </div>
        </div>
    }
}