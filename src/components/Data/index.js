import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import { ProjectSide } from 'components/Common';

import DataConnect from './Connect';
import DataSchema from './Schema';
import DataQuality from './Quality';

import dataConnectActive from './data_prograss_a.svg';
import dataSchemaActive from './data_schema_a.svg';
import dataSchema from './data_schema.svg';
import dataQualityActive from './data_quality_a.svg';
import dataQuality from './data_quality_d.svg';

const imgs = {
  dataSchema: <img src={dataSchema} alt="schema" />,
  dataQuality: <img src={dataQuality} alt="quality" />,
  dataConnectActive: <img src={dataConnectActive} alt="connect" />,
  dataSchemaActive: <img src={dataSchemaActive} alt="schema" />,
  dataQualityActive: <img src={dataQualityActive} alt="quality" />
}

@observer
export default class Data extends Component {
  constructor(props) {
    super(props);
    this.step = [
      { label: 'Data Connect', value: "dataConnect" },
      { label: 'Data Schema', value: "dataSchema" },
      { label: 'Data Quality', value: "dataQuality" }
    ]
  }

  enter = (step) => {
    const { mainStep, lastSubStep, subStepActive, noCompute, nextSubStep, updateProject } = this.props.project;

    if (step === subStepActive) return false;

    let maxStep = noCompute ? 2 : (mainStep > 2 ? 3 : lastSubStep);

    if (step > maxStep) return false;

    updateProject(nextSubStep(step, 2))
  }

  getChild = () => {
    const { project } = this.props;
    const { curStep, subStepActive } = project || {};

    let subStep = curStep !== 2 ? 3 : subStepActive;

    switch (subStep) {
      case 1:
        return <DataConnect project={project} />;
      case 2:
        return <DataSchema project={project} />;
      case 3:
        return <DataQuality project={project} />;
      default:
        return;
    }
  }

  render() {
    const { project } = this.props;
    const { mainStep, lastSubStep, noCompute } = project;
    let maxStep = noCompute ? 2 : (mainStep > 2 ? 3 : lastSubStep);
    return <div className={styles.data}>
      {project && this.getChild()}
      {project && <ProjectSide enter={this.enter} list={this.step} step={maxStep} imgs={imgs} />}
    </div>
  }
}
