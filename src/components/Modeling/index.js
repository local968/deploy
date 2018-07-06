import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Progress, Spin } from 'antd';
import autoIcon from './mr-one-logo-blue.svg';
import config from '../../config.js'
// import r2Loading from './Mr.OneLoading2.gif';
// import { when } from 'mobx';

// const Criteria = {
//     defualt: 'defualt',
//     costBased: 'costBased'
// }

const Classification = 'Classification';
const Regression = 'Regression';

// @inject('userStore', 'projectStore')
@observer
export default class Modeling extends Component {
    // constructor(props) {
    //     super(props);
    //     const { pid } = props.match.params || {};
    //     this.pid = pid ? parseInt(pid, 10) : 0;

    //     when(
    //         () => props.userStore.userId && !props.userStore.isLoad,
    //         () => props.projectStore.init(props.userStore.userId, this.pid)
    //     )
    // }

    getChild = () => {
        const { models, project } = this.props;
        const { train2ing, train2Finished, train2Error } = project;

        if (train2ing) return <Loading project={project}/>;
        if (train2Finished) return <ModelResult models={models} project={project} />;
        if (train2Error) return <ModelError />;
        return <StartTrain project={project} />
    }

    render() {
        return <div className={styles.modeling}>
            {this.getChild()}
        </div>
    }
}

@observer
class StartTrain extends Component {
    fastTrain = () => {
        this.props.project.nextMainStep(3);
        this.props.project.fastTrain();
    }

    render() {
        return <div className={styles.modelStart}>
            <div className={styles.startTitle}>
                <span>Data looks good now, It’s  time to train your model!</span>
            </div>
            <div className={styles.trainBox}>
                <div className={styles.trainBlock}>
                    <div className={styles.trainRecommend}><span>Recommended</span></div>
                    <div className={styles.trainImg}><img src={autoIcon} alt="auto" /></div>
                    <div className={styles.trainName}><span>Easy and simple </span></div>
                    <div className={styles.trainDesc}><span>If you want Mr.One to build the model automatically, choose automatic modeling.</span></div>
                </div>
                <button className={styles.train} onClick={this.fastTrain}><span>Automatic Modeling</span></button>
            </div>
        </div>
    }
}

@observer
class Loading extends Component {
    timer = null
    state = {
        progress: 0
    }
    componentDidMount() {
        const {project} = this.props;
        const {totalLines, rawHeader} = project || {}
        //暂定
        const rowRatio = (Math.max(totalLines / 50000,1) - 1) * 0.1 + 1;
        const colRatio = Math.max(rawHeader.length / 20,1) * 1;
        const time = rowRatio * colRatio * config.trainTimeDefault * 1000;
        const perTime = time / 90 * 5
        this.clearTimer()
        this.timer = setInterval(this.autoIncrease, perTime)
    }

    componentWillUnmount() {
        this.clearTimer()
    }

    autoIncrease = () => {
        const {progress} = this.state;
        if(progress === 90) return this.clearTimer();
        this.setState({
            progress: progress + 5
        })
    }

    clearTimer = () => {
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    render() {
        return <div className={styles.loading}>
            <div className={styles.training}>
                <Progress className={styles.trainingProgress} percent={this.state.progress} status="active" />
            </div>
            <div className={styles.trainingText}><span>Training</span></div>
        </div>
    }
}

class ModelError extends Component {
    render() {
        return <div className={styles.loading}><span>Training Failed</span></div>
    }
}

@observer
class ModelResult extends Component {
    // onChange = (e) => {
    //     this.props.project.updateProject({
    //         criteria: e.target.value
    //     })
    // }

    selectModel = (model) => {
        this.props.models.forEach(m => m.recommend = false);
        model.recommend = true;
    }

    render() {
        const { models, project } = this.props;
        const { problemType } = project
        const current = models.find((model) => model.recommend);
        return <div className={styles.modelResult}>
            <div className={styles.result}>
                <div className={styles.box}>
                    <div className={styles.title}>
                        <span>We have recommended a model by default.</span>
                    </div>
                    <div className={styles.text}>
                        <span>You can also tell us your business needs to get a more precise recommendation.</span>
                    </div>
                    <div className={styles.row}>
                        <span>Modeling Results : <div className={styles.status}>&nbsp;&nbsp;OK</div></span>
                    </div>
                    <div className={styles.row}>
                        <span>Selected Model :<a>&nbsp;{current.name}</a></span>
                    </div>
                    <div className={styles.row}>
                        <span>Target :<a>&nbsp;{project.target}</a></span>
                    </div>
                </div>
                <Performance problemType={problemType} model={current} />
            </div>
            <div className={styles.line}></div>
            {/* <div className={styles.selectBlock}>
                <div className={styles.selectText}>
                    <span> Select your model based on your own criteria:</span>
                </div>
                <div className={styles.radioGroup}>
                    <div className={styles.radio}><input type="radio" name="criteria" value={Criteria.defualt} id={Criteria.defualt} onChange={this.onChange} defaultChecked={criteria === Criteria.defualt} /><label htmlFor={Criteria.defualt}>Mr. One's Defult Selection</label></div>
                    <div className={styles.radio}><input type="radio" name="criteria" value={Criteria.costBased} id={Criteria.costBased} onChange={this.onChange} defaultChecked={criteria === Criteria.costBased} /><label htmlFor={Criteria.costBased}>Cost Based</label></div>
                </div>
            </div> */}
            <ModelTable models={models} selectModel={this.selectModel} problemType={problemType} />
            <div className={styles.buttonBlock}>
                <button className={styles.button}><span>Check Model Insights</span></button>
                <div className={styles.or}><span>or</span></div>
                <button className={styles.button}><span>Deploy the Model</span></button>
            </div>
        </div>
    }
}


class Predicted extends Component {
    render() {
        const { model } = this.props;
        return <div className={styles.progressBox}>
            <div className={styles.progressBlock}>
                <PredictedProgress predicted={model.predicted[0]} width={3.5} label={0} type={"success"} />
            </div>
            <div className={styles.progressBlock}>
                <PredictedProgress predicted={model.predicted[1]} width={3.5} label={1} type={"predicted"} />
            </div>
            <div className={styles.progressMeans}>
                <div className={styles.progressBlock}>
                    <div className={classnames(styles.progressSquare, styles.success)}></div>
                    <div><span>Actual: 0<br />Predicted: 0</span></div>
                </div>
                <div className={styles.progressBlock}>
                    <div className={classnames(styles.progressSquare, styles.predicted)}></div>
                    <div><span>Actual: 1<br />Predicted: 1</span></div>
                </div>
                <div className={styles.progressBlock}>
                    <div className={classnames(styles.progressSquare, styles.different)}></div>
                    <div><span>Actual: &<br />Predicted<br />Different</span></div>
                </div>
            </div>
        </div>
    }
}

class PredictedProgress extends Component {
    render() {
        const { predicted, width, label, type, height } = this.props;
        const title = label === undefined ? "" : <div className={styles.progressTitle}><span>{label}</span></div>
        return <div className={styles.progressLine}>
            {title}
            <div className={classnames(styles.progress, styles[type])} style={{ width: (width * predicted) + "em", height: (height || 0.27) + 'em' }}><span>{(predicted * 100).toFixed(0) + "%"}</span></div>
            <div className={classnames(styles.progress, styles.different)} style={{ width: (width * (1 - predicted)) + "em", height: (height || 0.27) + 'em' }}><span>{((1 - predicted) * 100).toFixed(0) + "%"}</span></div>
        </div>
    }
}

class Performance extends Component {
    render() {
        const { problemType, model } = this.props;
        return problemType === Classification ?
            <div className={styles.performanceBox}>
                <div className={styles.performance}>
                    <Progress width={84} type="circle" percent={model.score.holdoutScore.auc * 100} format={percent => (percent / 100).toFixed(2)} />
                    <div className={styles.performanceText}><span>Performance (AUC)</span></div>
                </div>
                <Predicted model={model} />
            </div> :
            <div className={styles.performanceBox}>
                <div className={styles.performance}>
                    <div className={styles.rmsePerformance}><span>{model.score.holdoutScore.nrmse.toFixed(4)}</span></div>
                    <div className={styles.performanceText}><span>Normalized RMSE</span></div>
                </div>
                <div className={styles.space}></div>
                <div className={styles.performance}>
                    <div className={styles.r2Performance}><span>{model.score.holdoutScore.r2.toFixed(4)}</span></div>
                    <div className={styles.performanceText}><span>Goodness of Fit (R<sup>2</sup>)</span></div>
                </div>
            </div>
    }
}

class ModelTable extends Component {
    render() {
        const { models, selectModel, problemType } = this.props;
        return <div className={styles.table}>
            <div className={styles.rowHeader}>
                <div className={styles.rowData}>
                    <div className={classnames(styles.cell, styles.name, styles.cellHeader)}><span>Model Name</span></div>
                    {problemType === Classification&&<div className={classnames(styles.cell, styles.predict, styles.cellHeader)}></div>}
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>{problemType === Classification? 'Performance(AUC)' : 'RMSE'}</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}>{problemType === Classification? <span>Holdout</span> : <span>R<sup>2</sup></span>}</div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Execution Speed</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Variable Impact</span></div>
                    {/* <div className={classnames(styles.cell, styles.cellHeader)}><span>Process Flow</span></div> */}
                </div>
            </div>
            <div className={styles.data}>
                {models.map((model, key) => {
                    return <ModelDetail key={key} model={model} selectModel={selectModel} problemType={problemType} />
                })}
            </div>
        </div>
    }
}

class ModelDetail extends Component {
    state = {
        type: '',
        visible: false
    }

    toggleImpact = () => {
        this.setState({
            type: 'impact',
            visible: !this.state.visible
        })
    }

    detail = () => {
        const {model} = this.props;
        const {featureImportanceDetail} = model;
        const arr = Object.entries(featureImportanceDetail).sort((a, b) => b[1] - a[1])
        return <div className={styles.detail}>
            {arr.map((row, index) => {
                return <div key={index} className={styles.detailRow}>
                    <div className={styles.detailName}><span>{row[0]}</span></div>
                    <div className={styles.detailProcess} style={{width: row[1] * 7 +"em"}}></div>
                    <div className={styles.detailNum}><span>{row[1].toFixed(4)}</span></div>
                </div>
            })}
        </div>
    }

    render() {
        const {model, selectModel, problemType} = this.props;
        return <div className={styles.rowBox}>
            <div className={styles.rowData}>
                <div className={styles.modelSelect}><input type="radio" name="modelSelect" defaultChecked={model.recommend} onChange={selectModel.bind(null, model)} /></div>
                <div className={classnames(styles.cell, styles.name)}><span>{model.name}</span></div>
                {problemType === Classification&&<div className={classnames(styles.cell, styles.predict)}>
                    <PredictedProgress predicted={model.predicted[0]} width={1.5} height={0.2} type={"success"} />
                    <div className={styles.space}></div>
                    <PredictedProgress predicted={model.predicted[1]} width={1.5} height={0.2} type={"predicted"} />
                </div>}
                <div className={styles.cell}><span>{problemType === Classification?model.score.validateScore.auc.toFixed(2):model.score.holdoutScore.nrmse.toFixed(4)}</span></div>
                <div className={styles.cell}><span>{problemType === Classification?model.score.holdoutScore.auc.toFixed(2):model.score.holdoutScore.r2.toFixed(4)}</span></div>
                <div className={styles.cell}><span>{model.executeSpeed + "ms/1000rows"}</span></div>
                <div className={classnames(styles.cell, styles.compute)}>
                    <span onClick={this.toggleImpact}>Compute</span>
                </div>
            </div>
            {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
            {this.state.visible && this.detail()}
        </div>
    }
}