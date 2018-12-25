import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { withRouter } from 'react-router-dom';

@withRouter
@observer
export default class ProjectSide extends Component {
    @observable loading = false
    @observable right = 0

    componentDidMount() {
        this.reset()
        window.addEventListener('resize', this.reset)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.reset)
    }

    reset = () => {
        if (this.loading) return
        this.loading = true
        const parent = this.dom.parentElement
        const prev = this.dom.previousSibling
        if (!parent || !prev) {
            this.loading = false
            return setTimeout(this.reset, 100)
        }
        this.right = 0
        parent.scrollLeft = 0
        const max = prev.clientWidth
        const min = parent.clientWidth
        if (max > min) {
            parent.onscroll = e => {
                this.right = Math.min(max - min, e.target.scrollLeft) * -1
            }
        }
        this.loading = false
    }

    refCb = dom => {
        this.dom = dom
    }

    render() {
        const { list, step, imgs, current, enter } = this.props;
        return <div className={styles.projectSide} ref={this.refCb} style={{ right: this.right }}>
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