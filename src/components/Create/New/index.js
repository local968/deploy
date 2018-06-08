import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import styles from './styles.module.css';
import { BlackButton } from 'components/Common';

const ENTER_KEY = 13;

@inject('approachStore', 'deployStore')
@observer
export default class New extends Component {
  @observable approach;

  constructor(props) {
    super(props);
    const { approachStore, match } = this.props;
    approachStore
      .getApproach(match.params.id)
      .then(approach => (this.approach = approach));
  }

  handleChange = event => {
    this.projectName = event.target.value;
  };

  handleKeyDown = event => {
    if (event.which === ENTER_KEY) {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const { deployStore, history, match } = this.props;
    const modelName = this.approach.modelDeploy[0];
    const modelType = this.approach.typeOfProblem;
    deployStore
      .create({
        modelName,
        projectId: match.params.id,
        modelId: `${this.approach.id}-${modelName}`,
        modelType,
        name: this.projectName
      })
      .then(({ id }) => history.push(`/deploy/project/${id}`));
  };

  render() {
    const { match } = this.props;
    const modelName = this.approach && this.approach.modelDeploy[0];
    return (
      <div className={styles.new}>
        <Link className={styles.back} to={`/deploy/create/${match.params.id}`}>
          <Icon className={styles.icon} type="arrow-left" />
        </Link>
        <h2 className={styles.title}>Create a Deployment Project</h2>
        <div className={styles.selected}>
          <span className={styles.selectedText}>Selected Model:</span>
          <span className={styles.modelName} title={modelName}>
            {modelName}
          </span>
        </div>
        <input
          className={styles.name}
          type="text"
          placeholder="Project Name"
          value={this.projectName}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        <div className={styles.gap} />
        <BlackButton onClick={this.handleSubmit}>
          Create the Project
        </BlackButton>
      </div>
    );
  }
}
