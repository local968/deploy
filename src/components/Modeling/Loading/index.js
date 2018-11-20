import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Progress } from 'antd';
import config from 'config';

@observer
export default class Loading extends Component {
    timer = null;
    @observable progress = 1

    componentDidMount() {
        const { project } = this.props;
        const { totalLines, sortHeader } = project || {};
        //暂定
        const rowRatio = (Math.max(totalLines / 50000, 1) - 1) * 0.1 + 1;
        const colRatio = Math.max(sortHeader.length / 20, 1) * 1;
        const time = rowRatio * colRatio * config.trainTimeDefault * 1000;
        const perTime = (time / 90) * 5;
        this.clearTimer();
        this.timer = setInterval(this.autoIncrease, perTime);
    }

    componentWillUnmount() {
        this.clearTimer();
    }

    autoIncrease = () => {
        const { progress } = this;
        if (progress === 90) return this.clearTimer();
        this.progress = Math.min(progress + 5, 90)
    };

    clearTimer = () => {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    };

    render() {
        const { abortTrain } = this.props.project
        return (
            <div className={styles.loading}>
                <div className={styles.training}>
                    <Progress
                        className={styles.trainingProgress}
                        percent={this.progress}
                        status="active"
                    />
                </div>
                <div className={styles.trainingText}>
                    <span>Training</span>
                </div>
                <div className={styles.trainingAbort}>
                    <div className={styles.abortButton} onClick={abortTrain.bind(null, true)}>
                        <span>Abort Training</span>
                    </div>
                </div>
            </div>
        );
    }
}