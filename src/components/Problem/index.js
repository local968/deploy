import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { Radio } from 'antd';
import Hint from '../Common/Hint';
import { observable, autorun } from 'mobx';

const RadioGroup = Radio.Group;
const selectable = [
    {value: 'Classification', type: 'True or False (Binary Classification)', detail: (<p>To predict if an event is likely to happen or not (e.g. if a customer will purchase or not; if someone will become diabetic or not).</p>)},
    {value: 'Regression', type: 'Continuous Values (Regression)', detail: (<p>To predict a continuous/numeric value (e.g. cost of a purchase)</p>)},
];

@inject('projectStore')
@observer
class Problem extends Component {

    constructor(props) {
        super(props);
        const {pid, aid} = props.match.params || {};
        this.pid = pid?parseInt(pid):0;
        // this.aid = aid?parseInt(aid):0;
        
        //实际只修改approach
        //project下对应多个approach，目前暂时只有一个
        props.projectStore.init(this.pid);
    }

    problemTypeChange = e => {
        this.props.projectStore.currentApproach.updateApproach({problemType: e.target.value});
    
    }

    nextStep = () => {
        this.props.projectStore.currentApproach.nextMainStep(2);
        this.props.history.push(`/data/${this.pid}`);
    }

    test = () => {
        this.props.currentApproach.sendTest();
    }

    render() {
        const {problemType} = this.props.projectStore.currentApproach || {};
        return <div>
            <div>
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
                <div>
                    <button onClick={this.nextStep}>Continue</button>
                </div>
            </div>
        </div>
    }
}

export default Problem