import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Checkbox } from 'antd';
import { action, observable, runInAction } from 'mobx';
import moment from 'moment';
import styles from './styles.module.css';
import apiIcon from './icon-data-api.svg';
import sourceIcon from './icon-data-source.svg';
import databaseIcon from './icon-database.svg';
import fileIcon from './icon-file-local.svg';
// import serverIcon from './icon-server.svg';
import upDatabaseIcon from './icon-upload-to-server.svg';
import appIcon from './icon-inapp.svg';
import onceIcon from './icon-once.svg';
import ApiInstruction from './apiInstruction';
import OneTime from 'components/Common/OneTime';
import AutoRepeat from 'components/Common/AutoRepeat';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import Uploader from 'components/Common/Uploader';
import BButton from 'components/Common/BlackButton';
import DBStore from 'stores/DBStore';

const ordinalNumberPostFix = number => {
  if ((number > 3 && number < 21) || number % 10 > 3) return 'th';
  return { 0: 'th', 1: 'st', 2: 'nd', 3: 'rd' }[number % 10];
};

const dateFormat = {
  day: () => '',
  week: number =>
    [
      '',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ][number],
  month: number => `${number}${ordinalNumberPostFix(number)}`
};

@inject('deployStore', 'routing')
@observer
export default class Deployment extends Component {
  @observable dialog = null;
  @observable localEmail = '';
  @observable emailEditing = false;

  @action
  selectionOption = (key, value) => () => {
    this.props.deployStore.currentDeployment.deploymentOptions[key] = value;
    this.props.deployStore.currentDeployment.save();
  };

  @action
  toggleEdit = () => {
    this.localEmail = this.props.deployStore.currentDeployment.email;
    this.emailEditing = !this.emailEditing;
  };

  @action
  changeEmail = e => {
    this.localEmail = e.target.value;
  };

  @action
  submitEmail = e => {
    this.emailEditing = false;
    this.props.deployStore.currentDeployment.email = this.localEmail;
    this.props.deployStore.currentDeployment.save();
  };

  show = key => action(() => (this.dialog = key));

  closeDialog = action(() => (this.dialog = null));

  render() {
    const { deployStore, routing, match } = this.props;
    const cd = deployStore.currentDeployment;
    const cddo = cd.deploymentOptions;
    return (
      <div className={styles.deployment}>
        <div className={styles.info}>
          <span className={styles.model}>Model:{cd.modelName}</span>
          <a className={styles.change}>Change</a>
          <span className={styles.data}>Deployment Data Definition</span>
          <a className={styles.download} href={deployStore.dataDefinition}>
            Download
          </a>
          <span className={styles.email}>
            Email to Receive Alert:{!this.emailEditing && (cd.email || 'empty')}
            {this.emailEditing && (
              <input
                type="text"
                className={styles.emailInput}
                value={this.localEmail}
                onChange={this.changeEmail}
              />
            )}
          </span>
          {!this.emailEditing && (
            <a className={styles.edit} onClick={this.toggleEdit}>
              Edit
            </a>
          )}
          {this.emailEditing && (
            <div className={styles.emailEdit}>
              <a className={styles.edit} onClick={this.submitEmail}>
                Save
              </a>
              <a className={styles.cancel} onClick={this.toggleEdit}>
                Cancel
              </a>
            </div>
          )}
        </div>
        <DeploymentOption cddo={cddo} selectionOption={this.selectionOption} />
        {cddo.option === 'api' && <ApiInstruction cddo={cddo} />}
        {cddo.option === 'data' && (
          <DataSource
            cd={cd}
            cddo={cddo}
            selectionOption={this.selectionOption}
            show={this.show}
          />
        )}
        {cddo.option !== 'api' &&
          cddo.source && (
            <ResultLocation
              cddo={cddo}
              selectionOption={this.selectionOption}
              show={this.show}
            />
          )}
        {cddo.option !== 'api' &&
          cddo.source &&
          cddo.location && (
            <DeployFrequency
              show={this.show}
              cddo={cddo}
              selectionOption={this.selectionOption}
            />
          )}
        {cddo.option !== 'api' &&
          cddo.source &&
          cddo.location &&
          cddo.frequency && (
            <div className={styles.done}>
              <div className={styles.selections}>
                <span className={styles.label}>
                  <span className={styles.text} />
                </span>
                <div
                  className={styles.save}
                  onClick={() => {
                    if (cddo.frequency) {
                      deployStore.toggleEnable(cd.id, true);
                      routing.push(
                        `/deploy/project/${match.params.id}/operation`
                      );
                      DBStore.deploySchedule({
                        deploymentId: match.params.id,
                        type: 'deployment'
                      });
                    }
                  }}
                >
                  <BButton className={styles.saveText}>DONE</BButton>
                </div>
              </div>
            </div>
          )}
        <DatabaseConfig
          options={cddo.sourceOptions}
          visible={this.dialog === 'databasesource'}
          onClose={this.closeDialog}
          title="Data Source - Database"
          projectId={cd.projectId}
          onSubmit={action(options => {
            options.csvLocation = options.result.result.csvLocation;
            cddo['source'] = 'database';
            cddo['sourceOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        <DatabaseConfig
          options={cddo.locationOptions}
          visible={this.dialog === 'databaselocation'}
          onClose={this.closeDialog}
          result
          projectId={cd.projectId}
          title="Deployment Result Location - Database"
          onSubmit={action(options => {
            cddo['location'] = 'database';
            cddo['locationOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        <OneTime
          options={cddo.frequencyOptions}
          visible={this.dialog === 'onetime'}
          onClose={this.closeDialog}
          onSubmit={action(options => {
            cddo['frequency'] = 'once';
            cddo['frequencyOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        <AutoRepeat
          options={cddo.frequencyOptions}
          visible={this.dialog === 'autorepeat'}
          onClose={this.closeDialog}
          onSubmit={action(options => {
            cddo['frequency'] = 'repeat';
            cddo['frequencyOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
      </div>
    );
  }
}

const DeploymentOption = observer(({ cddo, selectionOption }) => (
  <div className={styles.deploymentOption}>
    <span className={styles.label}>
      <span className={styles.text}>Deployment Option:</span>
    </span>
    <div className={styles.selections}>
      {cddo.option === 'api' && (
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
      {cddo.option === 'data' && (
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
      {cddo.option !== 'data' && (
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
      {cddo.option !== 'api' && (
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

const DataSource = observer(({ cd, cddo, selectionOption, show }) => (
  <div className={styles.dataSource}>
    <span className={styles.label}>
      <span className={styles.text}>Data Source:</span>
    </span>
    <div className={styles.selections}>
      {cddo.source === 'database' && (
        <div className={styles.selected} onClick={show('databasesource')}>
          <span className={styles.result}>
            <img
              alt="database"
              src={databaseIcon}
              className={styles.selectionIcon}
            />
            <span className={styles.resultText}>
              Database
              <span className={styles.path}>{cddo.sourceOptions.hostname}</span>
            </span>
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}

      {cddo.source === 'file' && (
        <div className={styles.selected}>
          <Uploader
            className={styles.resultText}
            onComplete={file => {
              selectionOption('file', file.name)();
            }}
            params={{ projectId: cd.projectId, userId: cd.userId }}
          >
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />Local
            File
            <span className={styles.path} title={cddo.file}>
              {cddo.file}
            </span>
          </Uploader>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}

      {/* {cddo.source === 'server' && (
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
      )} */}

      {cddo.source !== 'database' && (
        <div className={styles.selection} onClick={show('databasesource')}>
          <span className={styles.text}>
            <img
              alt="database"
              src={databaseIcon}
              className={styles.selectionIcon}
            />Database
          </span>
        </div>
      )}
      {cddo.source !== 'file' && (
        <div
          className={styles.selectionWithoutHover}
          // onClick={selectionOption('source', 'file')}
        >
          <Uploader
            className={styles.text}
            onComplete={file => {
              runInAction(() => {
                cd.deploymentOptions['source'] = 'file';
                cd.deploymentOptions['file'] = file.name;
                cd.save();
              });
            }}
            params={{ projectId: cd.projectId, userId: cd.userId }}
          >
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />Local
            File
          </Uploader>
        </div>
      )}
      {/* {cddo.source !== 'server' && (
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
      )} */}
    </div>
  </div>
));

const ResultLocation = observer(({ cddo, selectionOption, show }) => (
  <div className={styles.resultLocation}>
    <span className={styles.label}>
      <span className={styles.text}>Result Location:</span>
    </span>
    <div className={styles.selections}>
      {cddo.location === 'app' && (
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
      {cddo.location === 'database' && (
        <div className={styles.selected} onClick={show('databaselocation')}>
          <span className={styles.result}>
            <img
              alt="database"
              src={upDatabaseIcon}
              className={styles.selectionIcon}
            />
            <span className={styles.resultText}>
              Upload to Database<span className={styles.path}>
                {cddo.locationOptions.hostname}
              </span>
            </span>
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}
      {cddo.location !== 'database' && (
        <div className={styles.selection} onClick={show('databaselocation')}>
          <span className={styles.text}>
            <img
              alt="database"
              src={upDatabaseIcon}
              className={styles.selectionIcon}
            />Upload to Database
          </span>
        </div>
      )}
      {cddo.location !== 'app' && (
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

const DeployFrequency = observer(({ cddo, selectionOption, show }) => (
  <React.Fragment>
    <div className={styles.deployFrequency}>
      <span className={styles.label}>
        <span className={styles.text}>Deploy Frequency:</span>
      </span>
      <div className={styles.selections}>
        {cddo.frequency === 'once' && (
          <div className={styles.selected} onClick={show('onetime')}>
            <span className={styles.result}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />
              <span className={styles.resultText}>
                One Time<span className={styles.detail}>
                  <span className={styles.bold}>time:</span>
                  {cddo.frequencyOptions.time === 'completed'
                    ? ' After completed'
                    : moment
                        .unix(cddo.frequencyOptions.time)
                        .format('DD/MM/YYYY h:mma')}
                </span>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cddo.frequency === 'repeat' && (
          <div className={styles.selected} onClick={show('autorepeat')}>
            <span className={styles.result}>
              <Icon type="sync" className={styles.antdIcon} />
              <span className={styles.resultText}>
                Redeploy every{' '}
                {`${cddo.frequencyOptions.repeatFrequency} ${
                  cddo.frequencyOptions.repeatPeriod
                } ${
                  cddo.frequencyOptions.repeatPeriod !== 'day' ? 'on' : ''
                } ${cddo.frequencyOptions.repeatPeriod &&
                  dateFormat[cddo.frequencyOptions.repeatPeriod](
                    cddo.frequencyOptions.repeatOn
                  )}`}
                <small className={styles.detail}>
                  <span className={styles.bold}>Starts:</span>
                  {moment
                    .unix(cddo.frequencyOptions.starts)
                    .format('DD/MM/YYYY h:mma')}
                  <br />
                  <span className={styles.bold}>Ends:</span>
                  {cddo.frequencyOptions.ends === 'never'
                    ? 'never'
                    : cddo.frequencyOptions.ends > 10000
                      ? moment
                          .unix(cddo.frequencyOptions.ends)
                          .format('DD/MM/YYYY h:mma')
                      : `after ${cddo.frequencyOptions.ends} occurrences`}
                </small>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cddo.frequency !== 'once' && (
          <div className={styles.selection} onClick={show('onetime')}>
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />One
              Time
            </span>
          </div>
        )}
        {cddo.frequency !== 'repeat' && (
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
          checked={cddo.autoDisable}
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
