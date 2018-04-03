import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Checkbox } from 'antd';
import { runInAction, action, observable } from 'mobx';
import styles from './styles.module.css';
import apiIcon from './icon-data-api.svg';
import sourceIcon from './icon-data-source.svg';
import databaseIcon from './icon-database.svg';
import fileIcon from './icon-file-local.svg';
import serverIcon from './icon-server.svg';
import upDatabaseIcon from './icon-upload-to-server.svg';
import appIcon from './icon-inapp.svg';
import onceIcon from './icon-once.svg';
import ApiInstruction from './apiInstruction';
import SourceDatabase from './SourceDatabase';
import OneTime from './OneTime';
import AutoRepeat from './AutoRepeat';

@inject('deployStore')
@observer
export default class Deployment extends Component {
  @observable dialog = null;
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
  show = key => action(() => (this.dialog = key));
  closeDialog = action(() => (this.dialog = null));
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
        {cd.option === 'data' && (
          <DataSource cd={cd} selectionOption={this.selectionOption} />
        )}
        {cd.option !== 'api' &&
          cd.source && (
            <ResultLocation cd={cd} selectionOption={this.selectionOption} />
          )}
        {cd.option !== 'api' &&
          cd.source &&
          cd.location && (
            <DeployFrequency
              show={this.show}
              cd={cd}
              selectionOption={this.selectionOption}
            />
          )}
        {cd.option !== 'api' && (
          <div className={styles.save} onClick={cd.save}>
            <span className={styles.saveText}>
              SAVE & SETUP {!cd.frequency && 'LATER'}
            </span>
          </div>
        )}
        <SourceDatabase />
        <OneTime
          options={cd.frequencyOptions}
          visible={this.dialog === 'onetime'}
          onClose={this.closeDialog}
          onSubmit={options => {
            this.selectionOption('frequency', 'once')();
            this.selectionOption('frequencyOptions', options)();
            this.closeDialog();
          }}
        />
        <AutoRepeat
          options={cd.frequencyOptions}
          visible={this.dialog === 'autorepeat'}
          onClose={this.closeDialog}
          onSubmit={options => {
            this.selectionOption('frequency', 'repeat')();
            this.selectionOption('frequencyOptions', options)();
            this.closeDialog();
          }}
        />
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

const DataSource = observer(({ cd, selectionOption }) => (
  <div className={styles.dataSource}>
    <span className={styles.label}>
      <span className={styles.text}>Data Source:</span>
    </span>
    <div className={styles.selections}>
      {cd.source === 'database' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img
              alt="database"
              src={databaseIcon}
              className={styles.selectionIcon}
            />Database
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}

      {cd.source === 'file' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />Local
            File
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}

      {cd.source === 'server' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img
              alt="server"
              src={serverIcon}
              className={styles.selectionIcon}
            />File Server
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}

      {cd.source !== 'database' && (
        <div
          className={styles.selection}
          onClick={selectionOption('source', 'database')}
        >
          <span className={styles.text}>
            <img
              alt="database"
              src={databaseIcon}
              className={styles.selectionIcon}
            />Database
          </span>
        </div>
      )}
      {cd.source !== 'file' && (
        <div
          className={styles.selection}
          onClick={selectionOption('source', 'file')}
        >
          <span className={styles.text}>
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />Local
            File
          </span>
        </div>
      )}
      {cd.source !== 'server' && (
        <div
          className={styles.selection}
          onClick={selectionOption('source', 'server')}
        >
          <span className={styles.text}>
            <img
              alt="server"
              src={serverIcon}
              className={styles.selectionIcon}
            />File Server
          </span>
        </div>
      )}
    </div>
  </div>
));

const ResultLocation = observer(({ cd, selectionOption }) => (
  <div className={styles.resultLocation}>
    <span className={styles.label}>
      <span className={styles.text}>Result Location:</span>
    </span>
    <div className={styles.selections}>
      {cd.location === 'app' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img alt="app" src={appIcon} className={styles.selectionIcon} />In
            App
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}
      {cd.location === 'database' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img
              alt="database"
              src={upDatabaseIcon}
              className={styles.selectionIcon}
            />Upload to Database
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}
      {cd.location !== 'database' && (
        <div
          className={styles.selection}
          onClick={selectionOption('location', 'database')}
        >
          <span className={styles.text}>
            <img
              alt="database"
              src={upDatabaseIcon}
              className={styles.selectionIcon}
            />Upload to Database
          </span>
        </div>
      )}
      {cd.location !== 'app' && (
        <div
          className={styles.selection}
          onClick={selectionOption('location', 'app')}
        >
          <span className={styles.text}>
            <img alt="app" src={appIcon} className={styles.selectionIcon} />In
            App
          </span>
        </div>
      )}
    </div>
  </div>
));

const DeployFrequency = observer(({ cd, selectionOption, show }) => (
  <React.Fragment>
    <div className={styles.deployFrequency}>
      <span className={styles.label}>
        <span className={styles.text}>Deploy Frequency:</span>
      </span>
      <div className={styles.selections}>
        {cd.frequency === 'once' && (
          <div className={styles.selected}>
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />One
              Time
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cd.frequency === 'repeat' && (
          <div className={styles.selected}>
            <span className={styles.text}>
              <Icon type="sync" className={styles.antdIcon} />Auto Repeat
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cd.frequency !== 'once' && (
          <div className={styles.selection} onClick={show('onetime')}>
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />One
              Time
            </span>
          </div>
        )}
        {cd.frequency !== 'repeat' && (
          <div className={styles.selection} onClick={show('autorepeat')}>
            <span className={styles.text}>
              <Icon type="sync" className={styles.antdIcon} />Auto Repeat
            </span>
          </div>
        )}
      </div>
    </div>
    <div className={styles.row}>
      <div className={styles.holder} />
      <div className={styles.checkbox}>
        <Checkbox
          checked={cd.autoDisable}
          onChange={e => selectionOption('autoDisable', e.target.checked)()}
        >
          <span className={styles.checkboxText}>
            Auto disable if any issue occurs
          </span>
        </Checkbox>
      </div>
    </div>
  </React.Fragment>
));
