import React from 'react';
import styles from './styles.module.css';
import { Progress } from 'antd';

export default ({ progress }) => {
    return <div className={styles.load}>
        <div className={styles.block}>
            <Progress
                percent={progress}
                // status="active"
                strokeWidth={12}
                format={percent => <div className={styles.text}>{percent.toFixed(2)}%</div>}
                type="circle"
            />
        </div>
    </div>
}