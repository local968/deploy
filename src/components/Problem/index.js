import React, { Component } from 'react';
import styles from './styles.module.css';
// import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { Radio } from 'antd';
import Hint from '../Common/Hint';
import { when } from 'mobx';

const RadioGroup = Radio.Group;
const selectable = [
    {value: 'Classification', type: 'True or False (Binary Classification)', detail: (<p>To predict if an event is likely to happen or not (e.g. if a customer will purchase or not; if someone will become diabetic or not).</p>)},
    {value: 'Regression', type: 'Continuous Values (Regression)', detail: (<p>To predict a continuous/numeric value (e.g. cost of a purchase)</p>)},
];

@inject('userStore', 'projectStore')
@observer
class Problem extends Component {

    constructor(props) {
        super(props);
        const {pid} = props.match.params || {};
        this.pid = pid ? parseInt(pid, 10) : 0;
        
        when(
            () => props.userStore.userId && !props.userStore.isLoad,
            () => props.projectStore.init(props.userStore.userId, this.pid)
        )
    }

    problemTypeChange = e => {
        this.props.projectStore.project.updateProject({problemType: e.target.value});
    
    }

    nextStep = () => {
        this.props.projectStore.project.nextMainStep(2);
        this.props.history.push(`/data/${this.pid}`);
    }

    test = () => {
        this.props.project.sendTest();
    }

    render() {
        const {problemType} = this.props.projectStore.project || {};
        return <div className={styles.problem}>
            <div>
                <div><span>Describe your business problem.</span></div>
                <div>
                    <span>Industry</span>
                </div>
                <div>
                    <span>Business Function</span>
                </div>
                <div>
                    <span>Problem Statement</span>
                </div>
                <div>
                    <span>Business Value</span>
                </div>
                <RadioGroup value={problemType} onChange={this.problemTypeChange}>
                {selectable.map((content, index) => (
                    <Radio key={index} value={content.value}>
                    {content.type}
                    <Hint content={content.detail} placement="right" />
                    </Radio>
                ))}
                </RadioGroup>
                <div>
                    <button onClick={this.nextStep}>Continue</button>
                </div>
            </div>
        </div>
    }
}

export default Problem