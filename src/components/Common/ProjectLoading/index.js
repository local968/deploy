import React from 'react';
import styles from './styles.module.css';
import { Spin } from 'antd';

export default () => {
    return <div className={styles.load}>
        <Spin tip="Loading..." size="large"></Spin>
    </div>
}