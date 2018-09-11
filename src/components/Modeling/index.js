import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import StartTrain from './Start';
import Loading from './Loading';
import ModelError from './Error';
import ModelResult from './Result';
import { ProjectSide } from '../Common';
import modelSelectionIcon from './model_selection_d.svg';
import startModelingActiveIcon from './start_modeling_a.svg';
import modelSelectionActiveIcon from './model_selection_a.svg';

// import r2Loading from './Mr.OneLoading2.gif';
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

@observer
export default class Modeling extends Component {
  constructor(props) {
    super(props);
    this.step = [
      { label: 'Start Modeling', value: 'startModeling' },
      { label: 'Model Selection', value: 'modelSelection' }
    ];
  }

  getChild = () => {
    const { models, project } = this.props;
    const { train2Error, train2ing, subStepActive } = project;
    if (subStepActive === 1) return <StartTrain project={project} />;

    if (train2Error) return <ModelError />;
    if (!models.length && train2ing) return <Loading project={project} />;
    return (
      <ModelResult
        models={models}
        project={project}
        history={this.props.history}
      />
    );
  };

  enter = step => {
    const { lastSubStep, subStepActive } = this.props.project;

    if (step === subStepActive) return false;

    if (step > lastSubStep) return false;

    this.props.project.nextSubStep(step, 3);
  };

  render() {
    const { project } = this.props;
    return (
      <div className={styles.modeling}>
        {project && this.getChild()}
        {project && (
          <ProjectSide
            enter={this.enter}
            list={this.step}
            step={project.subStepActive}
            imgs={imgs}
          />
        )}
      </div>
    );
  }
}
