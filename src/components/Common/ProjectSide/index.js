import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

@observer
export default class ProjectSide extends Component {
    constructor(props) {
        super(props)
        this.domRef = React.createRef();
    }

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
        if (!this.domRef.current) return
        this.loading = true
        const parent = this.domRef.current.parentElement
        const prev = this.domRef.current.previousSibling
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

    render() {
        const { list, step, imgs, current, enter } = this.props;
        return <div className={styles.projectSide} ref={this.domRef} style={{ right: this.right }}>
            <div className={styles.sideBox}>
                {list.map((v, k) => {
                    return <div className={classnames(styles.sideBlock, {
                        [styles.sideBlockLarge]: list.length < 3,
                        [styles.active]: step > k,
                        [styles.current]: current === k + 1
                    })} key={k} onClick={enter.bind(null, k + 1)}>
                        {k !== 0 && <div className={classnames(styles.sideLine, {
                            [styles.sideLineLarge]: list.length < 3
                        })}><span>-------------------------------------------------------------</span></div>}
                        <div className={styles.sideIcon}>{imgs[v.value + (step > k ? "Active" : "")]}</div>
                        <span>{v.label}</span>
                    </div>
                })}
            </div>
        </div>
    }
}