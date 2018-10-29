import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { Radio } from 'antd';
import Hint from 'components/Common/Hint';
import ContinueButton from 'components/Common/ContinueButton';
import { action } from 'mobx';

const RadioGroup = Radio.Group;
const selectable = [
  { value: 'Classification', type: 'True or False (Binary Classification)', detail: (<p>To predict if an event is likely to happen or not (e.g. if a customer will purchase or not).</p>) },
  { value: 'Regression', type: 'Continuous Values (Regression)', detail: (<p>To predict a continuous/numeric value (e.g. cost of a purchase)</p>) },
];

@observer
class Problem extends Component {

  nextStep = () => {
    const { project } = this.props;
    project.saveProblem()
  }

  onChange = action((type, e) => {
    this.props.project[type] = e.target.value;
  })

  render() {
    const { changeProjectType } = this.props.project || {}
    return <div className={styles.problem}>
      <div className={styles.title}><span>Choose Problem Type</span></div>
      <div className={styles.radioBox}>
        <div className={styles.text}><span>Prediction</span></div>
        <RadioGroup className={styles.radio} value={changeProjectType} onChange={this.onChange.bind(this, "changeProjectType")}>
          {selectable.map((content, index) => (
            <Radio key={index} value={content.value}>
              {content.type}
              <Hint content={content.detail} placement="right" />
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <ContinueButton onClick={this.nextStep} disabled={!changeProjectType} text="Continue" />
    </div>
  }
}

export default Problem
