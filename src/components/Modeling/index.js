import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Progress, Spin } from 'antd';
import autoIcon from './mr-one-logo-blue.svg';
// import r2Loading from './Mr.OneLoading2.gif';
// import { when } from 'mobx';

// const Criteria = {
//     defualt: 'defualt',
//     costBased: 'costBased'
// }

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

        if (train2ing) return <Loading />;
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

class Loading extends Component {
    render() {
        return <div className={styles.loading}><Spin tip="Training..." size="large"></Spin></div>
    }
}

class ModelError extends Component {
    render() {
        return <div className={styles.loading}><Spin tip="Training..." size="large"></Spin></div>
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
            {problemType === "Classification" ?
                <ClassificationTable models={models} selectModel={this.selectModel} /> :
                <RegressionTable models={models} selectModel={this.selectModel} />}
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
        return problemType === "Classification" ?
            <div className={styles.performanceBox}>
                <div className={styles.performance}>
                    <Progress width={84} type="circle" percent={model.score.holdoutScore.auc * 100} format={percent => (percent / 100).toFixed(2)} />
                    <div className={styles.performanceText}><span>Performance (AUC)</span></div>
                </div>
                <Predicted model={model} />
            </div> :
            <div className={styles.performanceBox}>
                <div className={styles.performance}>
                    <div className={styles.rmsePerformance}><span>{model.score.holdoutScore.rmse.toFixed(4)}</span></div>
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

class ClassificationTable extends Component {
    render() {
        const { models, selectModel } = this.props;
        return <div className={styles.table}>
            <div className={styles.rowHeader}>
                <div className={styles.rowData}>
                    <div className={classnames(styles.cell, styles.name, styles.cellHeader)}><span>Model Name</span></div>
                    <div className={classnames(styles.cell, styles.predict, styles.cellHeader)}></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Performance(AUC)</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Holdout</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Execution Speed</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Variable Impact</span></div>
                    {/* <div className={classnames(styles.cell, styles.cellHeader)}><span>Process Flow</span></div> */}
                </div>
            </div>
            <div className={styles.data}>
                {models.map((model, key) => {
                    const rand = ((Math.random() * 0.2) + 0.4) * 3;
                    return <div key={key} className={styles.rowData}>
                        <div className={styles.modelSelect}><input type="radio" name="modelSelect" defaultChecked={model.recommend} onChange={selectModel.bind(null, model)} /></div>
                        <div className={classnames(styles.cell, styles.name)}><span>{model.name}</span></div>
                        <div className={classnames(styles.cell, styles.predict)}>
                            <PredictedProgress predicted={model.predicted[0]} width={rand} height={0.2} type={"success"} />
                            <div className={styles.space}></div>
                            <PredictedProgress predicted={model.predicted[1]} width={3 - rand} height={0.2} type={"predicted"} />
                        </div>
                        <div className={styles.cell}><span>{model.score.validateScore.auc.toFixed(2)}</span></div>
                        <div className={styles.cell}><span>{model.score.holdoutScore.auc.toFixed(2)}</span></div>
                        <div className={styles.cell}><span>{model.executeSpeed + "ms/1000rows"}</span></div>
                        <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div>
                        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
                    </div>
                })}
            </div>
        </div>
    }
}

class RegressionTable extends Component {
    render() {
        const { models, selectModel } = this.props;
        return <div className={styles.table}>
            <div className={styles.rowHeader}>
                <div className={styles.rowData}>
                    <div className={classnames(styles.cell, styles.name, styles.cellHeader)}><span>Model Name</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>RMSE</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>R2</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Execution Speed</span></div>
                    <div className={classnames(styles.cell, styles.cellHeader)}><span>Variable Impact</span></div>
                    {/* <div className={classnames(styles.cell, styles.cellHeader)}><span>Model Process Flow</span></div> */}
                </div>
            </div>
            <div className={styles.data}>
                {models.map((model, key) => {
                    return <div key={key} className={styles.rowData}>
                        <div className={styles.modelSelect}><input type="radio" name="modelSelect" defaultChecked={model.recommend} onChange={selectModel.bind(null, model)} /></div>
                        <div className={classnames(styles.cell, styles.name)}><span>{model.name}</span></div>
                        <div className={styles.cell}><span>{model.score.holdoutScore.rmse.toFixed(4)}</span></div>
                        <div className={styles.cell}><span>{model.score.holdoutScore.r2.toFixed(4)}</span></div>
                        <div className={styles.cell}><span>{model.executeSpeed + "ms/1000rows"}</span></div>
                        <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div>
                        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
                    </div>
                })}
            </div>
        </div>
    }
}