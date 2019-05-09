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
import modelSelectionIcon from './model_selection_d.svg';
import startModelingActiveIcon from './start_modeling_a.svg';
import modelSelectionActiveIcon from './model_selection_a.svg';
import EN from '../../constant/en';
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
  @observable view = 'simple'
  @observable sort = {
    simple: {
      key: 'name',
      value: 1
    },
    advanced: {
      key: 'Model Name',
      value: 1
    }
  }

  constructor(props) {
    super(props);
    this.step = [
      { label: EN.StartModeling, value: 'startModeling' },
      { label: EN.ModelSelection, value: 'modelSelection' }
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

  resetSide = () => {
    if (this.sideRef.current) this.sideRef.current.reset()
  }

  changeView = view => {
    this.view = view
  }

  handleSort = (view, key) => {
    const sort = this.sort[view]
    if (!sort) return
    if (sort.key === key) sort.value = -sort.value
    else {
      sort.key = key
      sort.value = 1
    }
    this.sort = { ...this.sort, [view]: sort }
  }

  enter = step => {
    const { lastSubStep, subStepActive, updateProject, nextSubStep } = this.props.projectStore.project;
    if (step === subStepActive) return false;
    if (step > lastSubStep) return false;
    updateProject(nextSubStep(step, 3))
  };

  render() {
    const { project } = this.props.projectStore;
    const { view, sort } = this
    return (
      <div className={styles.modeling}>
        {project && <Switch>
          <Route exact path="/project/:id/modeling/start" component={(props) => <StartTrain {...props} />} />
          <Route exact path="/project/:id/modeling/result" component={() => {
            return <TrainResult
              resetSide={this.resetSide}
              project={project}
              view={view}
              sort={sort}
              changeView={this.changeView}
              handleSort={this.handleSort}
            />
          }} />
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

@observer
class TrainResult extends Component {
  render() {
    const { project, view, sort, handleSort, changeView, resetSide } = this.props;
    const { models, train2Error, train2ing } = project;
    if (train2Error) return <ModelError />;
    if (!models.length && train2ing) return <Loading />;
    return <ModelResult
      view={view}
      sort={sort}
      handleSort={handleSort}
      changeView={changeView}
      resetSide={resetSide}
    />
  }
}
