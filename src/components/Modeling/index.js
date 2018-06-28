import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { Progress } from 'antd';
import { when } from 'mobx';

const criteria = {
    defualt: 'defualt',
    costBased: 'costBased'
}

@inject('userStore', 'projectStore')
@observer
export default class Modeling extends Component {
    constructor(props) {
        super(props);
        const { pid } = props.match.params || {};
        this.pid = pid ? parseInt(pid, 10) : 0;

        when(
            () => props.userStore.userId && !props.userStore.isLoad,
            () => props.projectStore.init(props.userStore.userId, this.pid)
        )
    }

    render() {
        const {models, project} = this.props.projectStore;
        return this.props.projectStore && models.length && <div className={styles.modeling}>
            <ModelResult models={models} project={project}/>
        </div>
    }
}

@observer
class ModelResult extends Component {
    state = {
        criteria: this.props.project.criteria
    }

    onChange = (e) => {
        this.setState({
            criteria: e.target.value
        })
    }

    selectModel = (model) => {
        this.props.models.forEach(m => m.recommend = false);
        model.recommend = true;
    }

    render() {
        const {models, project} = this.props;
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
                        <span>Selected Model :<a>&nbsp;{current.backend}</a></span>
                    </div>
                    <div className={styles.row}>
                        <span>Target :<a>&nbsp;{project.target}</a></span>
                    </div>
                </div>
                <div className={styles.performanceBox}>
                    <div className={styles.performance}>
                        <Progress width={84} type="circle" percent={current.score.auc * 100} format={percent => (percent / 100).toFixed(2)} />
                        <div className={styles.performanceText}><span>Performance (AUC)</span></div>
                    </div>
                    <Predicted model={models[0]}/>
                </div>
            </div>
            <div className={styles.line}></div>
            <div className={styles.selectBlock}>
                <div className={styles.selectText}>
                    <span> Select your model based on your own criteria:</span>
                </div>
                <div className={styles.radioGroup}>
                    <div className={styles.radio}><input type="radio" name="criteria" value={criteria.defualt} id={criteria.defualt} onChange={this.onChange} defaultChecked={this.state.criteria===criteria.defualt} /><label htmlFor={criteria.defualt}>Mr. One's Defult Selection</label></div>
                    <div className={styles.radio}><input type="radio" name="criteria" value={criteria.costBased} id={criteria.costBased} onChange={this.onChange} defaultChecked={this.state.criteria===criteria.costBased} /><label htmlFor={criteria.costBased}>Cost Based</label></div>
                </div>
            </div>
            <div className={styles.table}>
                <div className={styles.rowHeader}>
                    <div className={styles.rowData}>
                        <div className={classnames(styles.cell, styles.name, styles.cellHeader)}><span>Model Name</span></div>
                        <div className={classnames(styles.cell, styles.predict, styles.cellHeader)}></div>
                        <div className={classnames(styles.cell, styles.cellHeader)}><span>Accuracy</span></div>
                        <div className={classnames(styles.cell, styles.cellHeader)}><span>Performance(AUC)</span></div>
                        <div className={classnames(styles.cell, styles.cellHeader)}><span>Execution Speed</span></div>
                        <div className={classnames(styles.cell, styles.cellHeader)}><span>Variable Impact</span></div>
                        <div className={classnames(styles.cell, styles.cellHeader)}><span>Model Process Flow</span></div>
                    </div>
                </div>
                <div className={styles.data}>
                    {models.map((model, key) => {
                        const rand = ((Math.random() * 0.4) + 0.3) * 3.6;
                        console.log(rand)
                        return <div key={key} className={styles.rowData}>
                            <div className={styles.modelSelect}><input type="radio" name="modelSelect" defaultChecked={model.recommend} onChange={this.selectModel.bind(this,model)} /></div>
                            <div className={classnames(styles.cell, styles.name)}><span>{model.backend}</span></div>
                            <div className={classnames(styles.cell, styles.predict)}>
                                <PredictedProgress predicted={0.55} width={rand} height={0.2} type={"success"} />
                                <div className={styles.space}></div>
                                <PredictedProgress predicted={0.75} width={3.6-rand} height={0.2} type={"predicted"} />
                            </div>
                            <div className={styles.cell}><span>{model.score.auc.toFixed(2)}</span></div>
                            <div className={styles.cell}><span>{model.score.auc.toFixed(2)}</span></div>
                            <div className={styles.cell}><span>{model.executeTime + "ms"/*/1000rows*/}</span></div>
                            <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div>
                            <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div>
                        </div>
                    })}
                </div>
            </div>
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
        // const {model} = this.props;
        return <div className={styles.progressBox}>
            <div className={styles.progressBlock}>
                <PredictedProgress predicted={0.55} width={3.5} label={0} type={"success"} />
            </div>
            <div className={styles.progressBlock}>
                <PredictedProgress predicted={0.75} width={3.5} label={1} type={"predicted"} />
            </div>
            <div className={styles.progressMeans}>
                <div className={styles.progressBlock}>
                    <div className={classnames(styles.progressSquare,styles.success)}></div>
                    <div><span>Actual: 0<br/>Predicted: 0</span></div>
                </div>
                <div className={styles.progressBlock}>
                    <div className={classnames(styles.progressSquare,styles.predicted)}></div>
                    <div><span>Actual: 1<br/>Predicted: 1</span></div>
                </div>
                <div className={styles.progressBlock}>
                    <div className={classnames(styles.progressSquare,styles.different)}></div>
                    <div><span>Actual: &<br/>Predicted<br/>Different</span></div>
                </div>
            </div>
        </div>
    }
}

class PredictedProgress extends Component{
    render() {
        const {predicted, width, label, type, height} = this.props;
        const title = label === undefined ? "" : <div className={styles.progressTitle}><span>{label}</span></div>
        return <div className={styles.progressLine}>
            {title}
            <div className={classnames(styles.progress,styles[type])} style={{width:(width * predicted) + "em", height: (height||0.27)+'em'}}><span>{(predicted * 100).toFixed(0)+"%"}</span></div>
            <div className={classnames(styles.progress,styles.different)} style={{width:(width * (1-predicted)) + "em", height: (height||0.27)+'em'}}><span>{((1-predicted) * 100).toFixed(0)+"%"}</span></div>
        </div>
    }
}