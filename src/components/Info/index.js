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
import EN from '../../constant/en';

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
  @observable right = 0

  constructor(props) {
    super(props);
    this.step = [
      { label: EN.DataConnects, value: "dataConnect" },
      { label: EN.DataSchemas, value: "dataSchema" },
      { label: EN.DataQualitys, value: "dataQuality" }
    ];
    this.sideRef = React.createRef();
  }

  componentDidMount() {
    this.autorun = autorun(() => {
      const { projectStore: { project }, routing } = this.props;
      if (!project) return
      const { curStep, subStepActive } = project;
      if (curStep !== 2) return
      let url = ''
      switch (subStepActive) {
        case 1:
          url = `/project/${project.id}/info/connect`
          break
        case 2:
          url = `/project/${project.id}/info/schema`
          break
        case 3:
          url = `/project/${project.id}/info/quality`
          break
        default:
      }
      if (!url) return routing.push('/')
      if (!routing.location.pathname.startsWith(`/project/${project.id}/info`)) return
      if (routing.location.pathname.includes(url)) return
      return routing.push(url)
    })
  }

  componentWillUnmount() {
    this.autorun && this.autorun()
  }

  componentDidUpdate() {
    if (this.sideRef.current) this.sideRef.current.reset()
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
        <Route exact path="/project/:id/info/connect" component={(props) => <DataConnect {...props} />} />
        <Route exact path="/project/:id/info/schema" component={(props) => <DataSchema {...props} />} />
        <Route exact path="/project/:id/info/quality" component={(props) => <DataQuality {...props} />} />
      </Switch>}
      <ProjectSide enter={this.enter} list={this.step} step={maxStep} imgs={imgs} current={subStepActive} ref={this.sideRef} />
    </div>
  }
}
