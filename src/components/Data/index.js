import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { ProjectSide } from 'components/Common';
import { Route, Switch } from 'react-router-dom';
import DataConnect from './Connect';
import DataSchema from './Schema';
import DataQuality from './Quality';
import { autorun, observable } from 'mobx'

@inject('projectStore', 'routing')
@observer
export default class Data extends Component {
  @observable right = 0

  constructor(props) {
    super(props);
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
      if (!routing.location.pathname.startsWith(`/project/${project.id}/data`)) return
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
    return <div className={styles.data}>
      {!!project && <Switch>
        <Route exact path="/project/:id/data/connect" component={(props) => <DataConnect {...props} />} />
        <Route exact path="/project/:id/data/schema" component={(props) => <DataSchema {...props} />} />
        <Route exact path="/project/:id/data/quality" component={(props) => <DataQuality {...props} />} />
      </Switch>}
      <ProjectSide enter={this.enter} project={project} keyword='data' ref={this.sideRef} />
    </div>
  }
}
