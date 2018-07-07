import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';

@observer
export default class ProjectSide extends Component {
    enter = (step) => {
        this.props.enter(step)
    }

    render() {
        const { list, step, imgs } = this.props;
        console.log(this.props)
        return <div className={styles.dataSide}>
            <div className={styles.sideBox}>
                {list.map((v, k) => {
                    return <div className={classnames(styles.sideBlock, {
                        [styles.sideBlockLarge]: list.length < 3,
                        [styles.active]: step > k
                    })} key={k}>
                        {k !== 0 && <div className={classnames(styles.sideLine, {
                            [styles.sideLineLarge]: list.length < 3
                        })}><span>-------------------------------------------------------------</span></div>}
                        <div className={styles.sideIcon} onClick={this.enter.bind(this, k + 1)}>{imgs[v.value + (step > k ? "Active" : "")]}</div>
                        <span onClick={this.enter.bind(this, k + 1)}>{v.label}</span>
                    </div>
                })}
            </div>
        </div>
    }
}