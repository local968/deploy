import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { Radio } from 'antd';
import Hint from 'components/Common/Hint';
import ContinueButton from 'components/Common/ContinueButton';
// import { when } from 'mobx';
import { Input } from 'antd';
import { observable, runInAction, action } from 'mobx';
const { TextArea } = Input;

const RadioGroup = Radio.Group;
const selectable = [
  { value: 'Classification', type: 'True or False (Binary Classification)', detail: (<p>To predict if an event is likely to happen or not (e.g. if a customer will purchase or not; if someone will become diabetic or not).</p>) },
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
    const { changeProjectType, statement, business } = this.props.project || {}
    return <div className={styles.problem}>
      <div>
        <div className={styles.title}><span>Describe your business problem.</span></div>
        <div className={styles.textBox}>
          <div className={styles.text}><span>Problem Statement</span></div>
          <TextArea
            defaultValue={statement}
            className={styles.textarea}
            onChange={this.onChange.bind(this, "statement")}
            rows={6}
            placeholder='<Problem statement>  e.g. Predict important customers who might churn in the next 30 days so that customer service department can take effectively target and retain these customers.' />
        </div>
        <div className={styles.textBox}>
          <div className={styles.text}><span>Business Value</span></div>
          <TextArea
            defaultValue={business}
            className={styles.textarea}
            onChange={this.onChange.bind(this, "business")}
            rows={6}
            placeholder='<Business value> e.g. This will help proactively retain important customers. Acquiring a new customer is not costlier than retain an existing customer. It is critial to maintain customer satisfaction and loyalty to sustain good revenue opportunity and a strong market presence.' />
        </div>
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
    </div>
  }
}

export default Problem
