import React from 'react';
import styles from './styles.module.css';
import { Progress, Spin } from 'antd';

export default ({ progress, style }) => {
    return <div className={styles.load} style={style}>
        <div className={styles.block}>
            {typeof progress === 'number' ?
                <Progress
                    percent={progress}
                    // status="active"
                    strokeWidth={12}
                    format={percent => <div className={styles.text}>{percent.toFixed(2)}%</div>}
                    type="circle"
                /> :
                <Spin tip="Loading..." size="large"></Spin>}
        </div>
    </div>
}