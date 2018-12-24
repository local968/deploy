import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

@withRouter
@observer
export default class ProjectSide extends Component {

    render() {
        const { list, step, imgs, current, enter } = this.props;
        return <div className={styles.projectSide}>
            <div className={styles.sideBox}>
                {list.map((v, k) => {
                    return <div className={classnames(styles.sideBlock, {
                        [styles.sideBlockLarge]: list.length < 3,
                        [styles.active]: step > k,
                        [styles.current]: current === k + 1
                    })} key={k}>
                        {k !== 0 && <div className={classnames(styles.sideLine, {
                            [styles.sideLineLarge]: list.length < 3
                        })}><span>-------------------------------------------------------------</span></div>}
                        <div className={styles.sideIcon} onClick={enter.bind(null, k + 1)}>{imgs[v.value + (step > k ? "Active" : "")]}</div>
                        <span onClick={enter.bind(null, k + 1)}>{v.label}</span>
                    </div>
                })}
            </div>
        </div>
    }
}