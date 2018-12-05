import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { ProjectSide } from 'components/Common';
import { Route, Switch } from 'react-router-dom';
import DataConnect from './Connect';
import DataSchema from './Schema';
import DataQuality from './Quality';
import { autorun, observable } from 'mobx'

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

@inject('projectStore', 'routing')
@observer
export default class Data extends Component {
  @observable subStep = 0

  constructor(props) {
    super(props);
    this.step = [
      { label: 'Data Connect', value: "dataConnect" },
      { label: 'Data Schema', value: "dataSchema" },
      { label: 'Data Quality', value: "dataQuality" }
    ]
  }

  componentDidMount() {
    this.autorun = autorun(() => {
      const { projectStore: { project }, routing } = this.props;
      if (!project) return
      const { curStep, subStepActive } = project;
      if (curStep !== 2) return
      if (this.subStep === subStepActive) return
      this.subStep = subStepActive
      let url = ''
      switch (subStepActive) {
        case 1:
          url = `/project/${project.id}/data/connect`
          break
        case 2:
          url = `/project/${project.id}/data/schema`
          break
        case 3:
          url = `/project/${project.id}/data/quality`
          break
        default:
      }
      if (!url) return routing.push('/')
      if (routing.location.pathname.includes(url)) return
      return routing.push(url)
    })
  }

  componentWillUnmount() {
    this.autorun && this.autorun()
  }

  enter = (step) => {
    const { mainStep, lastSubStep, subStepActive, noCompute, nextSubStep, updateProject } = this.props.projectStore.project;

    if (step === subStepActive) return false;

    let maxStep = noCompute ? 2 : (mainStep > 2 ? 3 : lastSubStep);

    if (step > maxStep) return false;

    updateProject(nextSubStep(step, 2))
  }

  render() {
    const { project } = this.props.projectStore;
    const { mainStep, lastSubStep, noCompute, subStepActive } = project;
    const maxStep = noCompute ? 2 : (mainStep > 2 ? 3 : lastSubStep);
    return <div className={styles.data}>
      {!!project && <Switch>
        <Route exact path="/project/:id/data/connect" component={DataConnect} />
        <Route exact path="/project/:id/data/schema" component={DataSchema} />
        <Route exact path="/project/:id/data/quality" component={DataQuality} />
      </Switch>}
      <ProjectSide enter={this.enter} list={this.step} step={maxStep} imgs={imgs} current={subStepActive} />
    </div>
  }
}
