import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Route, Switch } from 'react-router-dom';
import { autorun, observable } from 'mobx'
import StartTrain from './Start';
import Loading from './Loading';
import ModelError from './Error';
import ModelResult from './Result';
import { ProjectSide } from 'components/Common';
import modelSelectionIcon from './model_selection_d.svg';
import startModelingActiveIcon from './start_modeling_a.svg';
import modelSelectionActiveIcon from './model_selection_a.svg';

// import r2Loading from './R2 LearnLoading2.gif';
// import { when } from 'mobx';

// const Criteria = {
//     defualt: 'defualt',
//     costBased: 'costBased'
// }
const imgs = {
  modelSelection: <img src={modelSelectionIcon} alt="selection" />,
  startModelingActive: <img src={startModelingActiveIcon} alt="start" />,
  modelSelectionActive: <img src={modelSelectionActiveIcon} alt="selection" />
};

@inject('projectStore', 'routing')
@observer
export default class Modeling extends Component {
  @observable right = 0

  constructor(props) {
    super(props);
    this.step = [
      { label: 'Start Modeling', value: 'startModeling' },
      { label: 'Model Selection', value: 'modelSelection' }
    ];
    this.sideRef = React.createRef();
  }

  componentDidMount() {
    this.autorun = autorun(() => {
      const { projectStore: { project }, routing } = this.props;
      if (!project) return
      const { curStep, subStepActive, id } = project;
      if (curStep !== 3) return
      let url = ''
      if (subStepActive === 1) url = `/project/${id}/modeling/start`
      if (subStepActive >= 2) url = `/project/${id}/modeling/result`
      if (!url) return routing.push("/")
      if (!routing.location.pathname.startsWith(`/project/${id}/modeling`)) return
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

  enter = step => {
    const { lastSubStep, subStepActive, updateProject, nextSubStep } = this.props.projectStore.project;
    if (step === subStepActive) return false;
    if (step > lastSubStep) return false;
    updateProject(nextSubStep(step, 3))
  };

  render() {
    const { project } = this.props.projectStore;
    const { models, train2Error, train2ing } = project;
    //mobx
    if (models.length) { }
    if (train2Error) { }
    if (train2ing) { }
    return (
      <div className={styles.modeling}>
        {project && <Switch>
          <Route exact path="/project/:id/modeling/start" component={StartTrain} />
          <Route exact path="/project/:id/modeling/result" component={trainResult} />
        </Switch>}
        {project && <ProjectSide
          enter={this.enter}
          list={this.step}
          step={project.lastSubStep}
          current={project.subStepActive}
          imgs={imgs}
          ref={this.sideRef}
        />}
      </div>
    );
  }
}

@inject('projectStore')
@observer
class trainResult extends Component {
  render() {
    const { project } = this.props.projectStore;
    const { models, train2Error, train2ing } = project;
    if (train2Error) return <ModelError />;
    if (!models.length && train2ing) return <Loading project={project} />;
    return <ModelResult
      models={models}
      project={project}
    />
  }
}
