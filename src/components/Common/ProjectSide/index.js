import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import dataConnectActive from './data_prograss_a.svg';
import dataSchemaActive from './data_schema_a.svg';
import dataSchema from './data_schema.svg';
import dataQualityActive from './data_quality_a.svg';
import dataQuality from './data_quality_d.svg';

import modelSelectionIcon from './model_selection_d.svg';
import startModelingActiveIcon from './start_modeling_a.svg';
import modelSelectionActiveIcon from './model_selection_a.svg';

import EN from '../../../constant/en';

const STEP = {
    data: [
        { label: EN.DataConnects, value: "dataConnect" },
        { label: EN.DataSchemas, value: "dataSchema" },
        { label: EN.DataQualitys, value: "dataQuality" }
    ],
    modeling: [
        { label: EN.StartModeling, value: 'startModeling' },
        { label: EN.ModelSelection, value: 'modelSelection' }
    ]
}

const IMAGES = {
    data: {
        dataSchema: <img src={dataSchema} alt="schema" />,
        dataQuality: <img src={dataQuality} alt="quality" />,
        dataConnectActive: <img src={dataConnectActive} alt="connect" />,
        dataSchemaActive: <img src={dataSchemaActive} alt="schema" />,
        dataQualityActive: <img src={dataQualityActive} alt="quality" />
    },
    modeling: {
        modelSelection: <img src={modelSelectionIcon} alt="selection" />,
        startModelingActive: <img src={startModelingActiveIcon} alt="start" />,
        modelSelectionActive: <img src={modelSelectionActiveIcon} alt="selection" />
    }
}

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

    check = () => {
        if (!this.domRef.current) return
        const parent = this.domRef.current.parentElement
        const prev = this.domRef.current.previousSibling
        const max = prev.clientWidth
        const min = parent.clientWidth
        if (this.min === min && this.max === max) return false
        this.right = 0
        parent.scrollLeft = 0
        this.max = max
        this.min = min
        return true
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
        const checked = this.check()
        if (checked) {
            if (this.max > this.min) {
                const parent = this.domRef.current.parentElement
                parent.onscroll = e => {
                    const checkedByscroll = this.check()
                    if (checkedByscroll) return
                    this.right = Math.min(this.max - this.min, e.target.scrollLeft) * -1
                }
            }
        }
        this.loading = false
    }

    render() {
        const { project, enter, keyword } = this.props;
        const { mainStep, lastSubStep, noCompute, subStepActive } = project;
        const step = keyword === 'data' ? (noCompute ? 2 : (mainStep > 2 ? 3 : lastSubStep)) : lastSubStep
        const list = STEP[keyword]
        const imgs = IMAGES[keyword]

        return <div className={styles.projectSide} ref={this.domRef} style={{ right: this.right }}>
            <div className={styles.sideBox}>
                {list.map((v, k) => {
                    return <div className={classnames(styles.sideBlock, {
                        [styles.sideBlockLarge]: list.length < 3,
                        [styles.active]: step > k,
                        [styles.current]: subStepActive === k + 1
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