import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import autoIcon from './mr-one-logo-blue.svg';
import { Modal } from '../../Common';
import { when } from 'mobx';
import { Spin } from 'antd';
import histogramIcon from './histogramIcon.svg';
import univariantIcon from './univariantIcon.svg';


@observer
export default class StartTrain extends Component {
    state = {
        visible: false
    }

    fastTrain = () => {
        this.props.project.nextSubStep(2, 3);
        this.props.project.fastTrain();
    };

    advanced = () => {
        this.setState({
            visible: true
        })
    }

    closeAdvanced = () => {
        this.setState({
            visible: false
        })
    }

    render() {
        const {project} = this.props;
        return (
            <div className={styles.modelStart}>
                <div className={styles.startTitle}>
                    <span>Data looks good now, It’s time to train your model!</span>
                </div>
                <div className={styles.trainWarp}>
                    <div className={styles.trainBox}>
                        <div className={styles.trainBlock}>
                            <div className={styles.trainRecommend}>
                                <span>Recommended</span>
                            </div>
                            <div className={styles.trainImg}>
                                <img src={autoIcon} alt="auto" />
                            </div>
                            <div className={styles.trainName}>
                                <span>Easy and simple</span>
                            </div>
                            <div className={styles.trainDesc}>
                                <span>
                                    If you want Mr.One to build the model automatically, choose
                                    automatic modeling.
                </span>
                            </div>
                        </div>
                        <button className={styles.train} onClick={this.fastTrain}>
                            <span>Automatic Modeling</span>
                        </button>
                    </div>
                    <div className={styles.trainSep}></div>
                    <div className={styles.trainBox}>
                        <div className={styles.trainBlock}>
                            <div className={styles.trainImg}>
                                <img src={autoIcon} alt="auto" />
                            </div>
                            <div className={styles.trainName}>
                                <span>Detailed and advanced</span>
                            </div>
                            <div className={styles.trainDesc}>
                                <span>
                                    If you want to have more control over the modeling process, choose advanced modeling.
                </span>
                            </div>
                        </div>
                        <button className={styles.train} onClick={this.advanced}>
                            <span>Advanced Modeling</span>
                        </button>
                    </div>
                </div>
                <Modal width='12em' content={<AdvancedModel project={project} closeAdvanced={this.closeAdvanced}/>} title='Advanced Modeling' onClose={this.closeAdvanced} visible={this.state.visible} />
            </div>
        );
    }
}


class AdvancedModel extends Component {
    state = {
        tab: 1
    }

    switchTab= (num) => {
        if(num !== 1 && num !== 2) return false;
        this.setState({
            tab: num
        })
    }

    render() {
        const {project, closeAdvanced} = this.props
        return <div className={styles.advancedModel}>
            <div className={styles.advancedContent}>
                <div className={styles.tabBox}>
                    <div className={classnames(styles.tab, {
                        [styles.active]: this.state.tab === 1
                    })} onClick={this.switchTab.bind(null, 1)}><span>Simplified View</span></div>
                    <div className={classnames(styles.tab, {
                        [styles.active]: this.state.tab === 2
                    })} onClick={this.switchTab.bind(null, 2)}><span>Advanced View</span></div>
                </div>
                {this.state.tab === 1 ? <SimplifiedView project={project} closeAdvanced={closeAdvanced}/> : <AdvancedView project={project} closeAdvanced={closeAdvanced}/>}
                <div className={styles.bottom}>
                    <button className={styles.save} onClick={this.modeling} ><span>modeling</span></button>
                    <button className={styles.cancel} onClick={closeAdvanced}><span>cancel</span></button>
                </div>
            </div>
        </div>
    }
}

@observer
class SimplifiedView extends Component {
    state = {
        sort: -1
    }

    componentDidMount() {
        when(
            () => !this.props.project.dataViews,
            () => this.props.project.dataView()
        )
        when(
            () => !this.props.project.preImportance,
            () => this.props.project.preTrainImportance()
        )
    }

    render() {
        const {project, closeAdvanced} = this.props;
        const {target, colType, colMap, targetMap, dataViewing, dataViews, rawHeader, preImportance, preImportanceing} = project;
        const targetUnique = Object.values(Object.assign({}, colMap[target], targetMap)).length;
        const targetData = colType[target]!=='Categorical' && dataViews ? dataViews[target] : {}
        return <div className={styles.simplified}>
            <div className={styles.targetTable}>
                <div className={styles.targetHead}>
                    <div className={classnames(styles.targetCell, styles.targetName)}><span>Target Variable</span></div>
                    <div className={classnames(styles.targetCell, styles.large)}><span>Histogram</span></div>
                    <div className={styles.targetCell}><span>Data Type</span></div>
                    <div className={styles.targetCell}><span>Mean</span></div>
                    <div className={styles.targetCell}><span>Unique Value</span></div>
                    <div className={styles.targetCell}><span>Min</span></div>
                    <div className={styles.targetCell}><span>Max</span></div>
                </div>
                <div className={styles.targetRow}>
                    <div className={classnames(styles.targetCell, styles.targetName)}><span>{target}</span></div>
                    <div className={classnames(styles.targetCell, styles.targetHistogram)}><img src={histogramIcon} alt='histogram'/><span>Compute</span></div>
                    <div className={styles.targetCell}><span>{colType[target]}</span></div>
                    <div className={classnames(styles.targetCell, {
                        [styles.none]: colType[target]==='Categorical'
                    })}><span>{targetData.mean || 'N/A'}</span></div>
                    <div className={styles.targetCell}><span>{targetUnique}</span></div>
                    <div className={classnames(styles.targetCell, {
                        [styles.none]: colType[target]==='Categorical'
                    })}><span>{targetData.min || 'N/A'}</span></div>
                    <div className={classnames(styles.targetCell, {
                        [styles.none]: colType[target]==='Categorical'
                    })}><span>{targetData.max || 'N/A'}</span></div>
                </div>
            </div>
            <div className={styles.simplifiedText}><span>You can use check box to create your own variable list.</span></div>
            <div className={styles.tool}>
                <div className={styles.toolSelect}>
                    <div className={styles.toolLabel}><span>Current Variable List</span></div>
                    <select defaultValue="all">
                        <option value='all'>All Variables ({rawHeader.length - 1})</option>
                    </select>
                </div>
                <div className={styles.toolButton}><span>Create a New Variable</span></div>
                <div className={classnames(styles.toolButton, styles.toolCheck)}><span>Check Correlation Matric</span></div>
            </div>
            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={classnames(styles.tableTh, styles.tableCheck)}></div>
                    <div className={styles.tableTh}><span>Name</span></div>
                    <div className={classnames(styles.tableTh, styles.tableLarge)}><span>Histogram</span></div>
                    <div className={classnames(styles.tableTh, styles.tableLarge)}><span>Univariant Plot</span></div>
                    <div className={classnames(styles.tableTh, styles.tableImportance)}><span>Importance</span></div>
                    <div className={styles.tableTh}><span>Data type</span></div>
                    <div className={styles.tableTh}><span>Mean</span></div>
                    <div className={styles.tableTh}><span>Unique Value</span></div>
                    <div className={styles.tableTh}><span>STD</span></div>
                    <div className={styles.tableTh}><span>Median</span></div>
                    <div className={styles.tableTh}><span>Min</span></div>
                    <div className={styles.tableTh}><span>Max</span></div>
                </div>
                <div className={styles.tableBody}>
                    {rawHeader.sort((a, b) => {
                        return preImportance ? this.state.sort * (preImportance[a] - preImportance[b]) : 0
                    }).map((h, i) => {
                        if(h === target) return null;
                        const data = colType[h]!=='Categorical' && dataViews ? dataViews[h] : {}
                        const map = targetMap || {};
                        const importance = preImportance?preImportance[h]:0.01;
                        return <div className={styles.tableRow} key={i}>
                            <div className={classnames(styles.tableTd, styles.tableCheck)}><input type='checkbox' defaultChecked={true} /></div>
                            <div className={styles.tableTd} title={h}><span>{h}</span></div>
                            <div className={classnames(styles.tableTd, styles.tableChart)}><img src={histogramIcon} alt='histogram'/><span>Compute</span></div>
                            <div className={classnames(styles.tableTd, styles.tableChart)}><img src={univariantIcon} alt='univariant'/><span>Compute</span></div>
                            <div className={classnames(styles.tableTd, styles.tableImportance)}>
                                <div className={styles.preImpotance}></div>
                                <div className={classnames(styles.preImpotance, styles.preImpotanceActive)} style={{width: (importance * 100) + '%'}}></div>
                            </div>
                            <div className={styles.tableTd}  title={colType[h]}><span>{colType[h]}</span></div>
                            <div className={classnames(styles.tableTd,{
                                [styles.none]: colType[h]==='Categorical'
                            })} title={data.mean || 'N/A'}><span>{data.mean || 'N/A'}</span></div>
                            <div className={styles.tableTd} title={Object.values(map).length}><span>{Object.values(map).length}</span></div>
                            <div className={classnames(styles.tableTd,{
                                [styles.none]: colType[h]==='Categorical'
                            })} title={data.std || 'N/A'}><span>{data.std || 'N/A'}</span></div>
                            <div className={classnames(styles.tableTd,{
                                [styles.none]: colType[h]==='Categorical'
                            })} title={data.median || 'N/A'}><span>{data.median || 'N/A'}</span></div>
                            <div className={classnames(styles.tableTd,{
                                [styles.none]: colType[h]==='Categorical'
                            })} title={data.min || 'N/A'}><span>{data.min || 'N/A'}</span></div>
                            <div className={classnames(styles.tableTd,{
                                [styles.none]: colType[h]==='Categorical'
                            })} title={data.max || 'N/A'}><span>{data.max || 'N/A'}</span></div>
                        </div>
                    })}
                </div>
            </div>
            {(dataViewing || preImportanceing) && <div className={styles.simplifiedLoad}>
                <Spin size="large" />
            </div>}
        </div>
    }
}

class AdvancedView extends Component {
    render() {
        return <div>
            <div>target</div>
            <div>tool</div>
            <div>table</div>
        </div>
    }
}