import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Route, Switch } from 'react-router-dom';
import { autorun, observable, action } from 'mobx'
import StartTrain from './Start';
import Loading from './Loading';
import ModelError from './Error';
import ModelResult from './Result';
import { ProjectSide } from 'components/Common';
// import r2Loading from './R2 LearnLoading2.gif';
// import { when } from 'mobx';

// const Criteria = {
//     defualt: 'defualt',
//     costBased: 'costBased'
// }
@inject('projectStore', 'routing')
@observer
export default class Modeling extends Component {
  @observable right = 0
  @observable view = 'simple'

  constructor(props) {
    super(props);
    this.sideRef = React.createRef();
  }

  componentDidMount() {
    this.autorun = autorun(() => {
      const { projectStore: { project }, routing } = this.props;
      if (!project) return
      const { curStep, subStepActive, id } = project;
      if (curStep !== 3) return
      let url = ''
      if (subStepActive === 1) url = `/project/${id}/train/start`
      if (subStepActive >= 2) url = `/project/${id}/train/result`
      if (!url) return routing.push("/")
      if (!routing.location.pathname.startsWith(`/project/${id}/train`)) return
      if (routing.location.pathname.includes(url)) return
      return routing.push(url)
    })
  };

  componentWillUnmount() {
    this.autorun && this.autorun()
  }

  componentDidUpdate() {
    if (this.sideRef.current) this.sideRef.current.reset()
  }

  resetSide = () => {
    if (this.sideRef.current) this.sideRef.current.reset()
  }

  changeView = view => {
    this.view = view
  }

  enter = step => {
    const { lastSubStep, subStepActive, updateProject, nextSubStep } = this.props.projectStore.project;
    if (step === subStepActive) return false;
    if (step > lastSubStep) return false;
    updateProject(nextSubStep(step, 3))
  };

  render() {
    const { project } = this.props.projectStore;
    const { view } = this

    return (
      <div className={styles.modeling}>
        {project && <Switch>
          <Route exact path="/project/:id/train/start" component={(props) => <StartTrain {...props} />} />
          <Route exact path="/project/:id/train/result" component={() => {
            return <TrainResult
              resetSide={this.resetSide}
              project={project}
              view={view}
              changeView={this.changeView} />
          }} />
        </Switch>}
        {project && <ProjectSide
          enter={this.enter}
          project={project}
          keyword='modeling'
          ref={this.sideRef}
        />}
      </div>
    );
  }
}

@observer
class TrainResult extends Component {
  render() {
    const { project, view, changeView, resetSide } = this.props;
    const { models, train2Error, train2ing } = project;
    if (train2Error) return <ModelError />;
    if (!models.length && train2ing) return <Loading />;
    return <ModelResult
      view={view}
      changeView={changeView}
      resetSide={resetSide}
    />
  }
}
