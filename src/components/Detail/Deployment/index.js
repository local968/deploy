import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { runInAction, action } from 'mobx';
import styles from './styles.module.css';
import apiIcon from './icon-data-api.svg';
import sourceIcon from './icon-data-source.svg';
import ApiInstruction from './apiInstruction';

@inject('deployStore')
@observer
export default class Deployment extends Component {
  constructor(props) {
    super(props);
    const { match, deployStore } = this.props;
    runInAction(() => (deployStore.currentId = match.params.id));
  }
  @action
  selectionOption = (key, value) => () => {
    if (!this.props.deployStore.currentDeployment) return;
    this.props.deployStore.currentDeployment[key] = value;
  };
  render() {
    const { deployStore } = this.props;
    const cd = deployStore.currentDeployment || {};
    return (
      <div className={styles.deployment}>
        <div className={styles.info}>
          <span className={styles.model}>
            Model:{cd.modelName}
            <i className={styles.mark}>!</i>
            <a className={styles.change}>Change</a>
          </span>
          <span className={styles.data}>
            Deployment Data Definition<i className={styles.mark}>?</i>
            <a className={styles.download}>Download</a>
          </span>
          <span className={styles.email}>
            Email to Receive Alert:{cd.email}
            <a className={styles.edit}>Edit</a>
          </span>
        </div>
        <DeploymentOption cd={cd} selectionOption={this.selectionOption} />
        {cd.option === 'api' && <ApiInstruction cd={cd} />}
      </div>
    );
  }
}

const DeploymentOption = observer(({ cd, selectionOption }) => (
  <div className={styles.deploymentOption}>
    <span className={styles.label}>
      <span className={styles.text}>Deployment Option:</span>
    </span>
    <div className={styles.selections}>
      {cd.option === 'api' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img alt="api" src={apiIcon} className={styles.selectionIcon} />Predict
            with API
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}
      {cd.option === 'data' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img
              alt="data source"
              src={sourceIcon}
              className={styles.selectionIcon}
            />Predict with Data Source
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}
      {cd.option !== 'data' && (
        <div
          className={styles.selection}
          onClick={selectionOption('option', 'data')}
        >
          <span className={styles.text}>
            <img
              alt="data source"
              src={sourceIcon}
              className={styles.selectionIcon}
            />Predict with Data Source
          </span>
        </div>
      )}
      {cd.option !== 'api' && (
        <div
          className={styles.selection}
          onClick={selectionOption('option', 'api')}
        >
          <span className={styles.text}>
            <img alt="api" src={apiIcon} className={styles.selectionIcon} />Predict
            with API
          </span>
        </div>
      )}
    </div>
  </div>
));
