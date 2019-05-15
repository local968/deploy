import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {Icon, Checkbox, Progress, Select, Modal, InputNumber} from 'antd';
import {action, computed, observable} from 'mobx';
import moment from 'moment';
import config from 'config';
import styles from './styles.module.css';
import apiIcon from './icon-data-api.svg';
import sourceIcon from './icon-data-source.svg';
import databaseIcon from './icon-database.svg';
import fileIcon from './icon-file-local.svg';
// import serverIcon from './icon-server.svg';
// import upDatabaseIcon from './icon-upload-to-server.svg';
import appIcon from './icon-inapp.svg';
import onceIcon from './icon-once.svg';
import ApiInstruction from './apiInstruction';
import OneTime from 'components/Common/OneTime';
import AutoRepeat from 'components/Common/AutoRepeat';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import Uploader from '../Uploader';
import BButton from 'components/Common/BlackButton';
import Hint from 'components/Common/Hint';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import classnames from "classnames";

const { Option, OptGroup } = Select;

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

@inject('deploymentStore', 'userStore', 'routing','projectStore')
@observer
export default class Deployment extends Component {
  @observable dialog = null;
  @observable localEmail = '';
  @observable emailEditing = false;
  @observable errorTimes = 0;
  @observable uploadStatus = false;
  @observable uploadPercentage = 0;
  @observable uploadSpeed = '0 Kb/s';
  @observable modelEditing = false;
  @observable tempModelName = false;

  @action
  selectionOption = (key, value) => () => {
    this.props.deploymentStore.currentDeployment.deploymentOptions[key] = value;
    this.props.deploymentStore.currentDeployment.performanceOptions[key] = value;
    this.props.deploymentStore.currentDeployment.save();
  };

  @action
  toggleEdit = () => {
    this.localEmail = this.props.deploymentStore.currentDeployment.email;
    this.emailEditing = !this.emailEditing;
  };

  @action
  changeEmail = e => {
    this.localEmail = e.target.value;
  };

  @action
  submitEmail = e => {
    this.emailEditing = false;
    this.props.deploymentStore.currentDeployment.email = this.localEmail;
    this.props.deploymentStore.currentDeployment.save();
  };

  show = key => action(() => (this.dialog = key));

  closeDialog = action(() => (this.dialog = null));

  modelChange = action(value => {
    this.tempModelName = value
  })

  onSaveModel = action(() => {
    const cd = this.props.deploymentStore.currentDeployment
    if (this.modelEditing && this.tempModelName) {
      cd.modelName = this.tempModelName;
      cd.save();
      this.tempModelName = false;
    }
    this.modelEditing = !this.modelEditing
  })

  pause = action(() => {
    if (!this.uploadOperator) return
    if (this.uploadStatus === 'uploading') {
      this.uploadOperator.pause()
      this.uploadStatus = 'paused'
      return
    }
    this.uploadOperator.resume()
    this.uploadStatus = 'uploading'
  })

  render() {
    const { deploymentStore, userStore, routing, match  } = this.props;
    console.log(this.props.projectStore)
    const cd = deploymentStore.currentDeployment;
    const cdpo = cd.performanceOptions;
    console.log(cd ,'cd')
    const cddo = cd.deploymentOptions;
    const measureDo = cd
    const uploader = {
      onError: action((error, times) => {
        console.error(error)
        this.errorTimes = times
        this.uploadStatus = 'error'
        this.uploadError = error
      }),
      onFinished: action((response, file) => {
        cddo.file = file.name
        cddo.fileId = response.originalIndex
        cddo.source = 'file'
        cd.save()
        this.uploadPercentage = 100
        this.uploadStatus = false
      }),
      onProgress: action((progress, speed) => {
        const done = progress.split('/')[0]
        const total = progress.split('/')[1]
        this.uploadSpeed = speed
        this.uploadPercentage = formatNumber((done / total) * 100, 2)
      }),
      onStart: action(() => {
        this.uploadStatus = 'uploading'
        this.uploadSpeed = '0 Kb/s'
        this.uploadPercentage = 0
      }),
      operator: (opeartor) => {
        this.uploadOperator = opeartor
      },
      params: { projectId: cd.projectId, userId: userStore.info.id, type: 'deploy' }
    }
    return (
      <div className={styles.deployment} >
        <div className={styles.info}>
          <span className={styles.model}>{EN.Model}: {this.modelEditing ? <Select value={this.tempModelName || cd.modelName} onChange={this.modelChange}>
            {cd.modelList && Object.entries(cd.modelList).map(([settingName, models]) =>
              <OptGroup key={settingName} label={settingName}>
                {models.map(model => <Option key={model.modelId} alt={model.performance} value={model.name}>{model.name}</Option>)}
              </OptGroup>)}
          </Select> : cd.modelName}</span>
          <Hint themeStyle={{ fontSize: '1rem' }} content={cd.currentModel && cd.currentModel.performance} />
          <a className={styles.change} onClick={this.onSaveModel}>{this.modelEditing ? EN.Save : EN.Change}</a>
          <span className={styles.data}>{EN.DeploymentDataDefinition}</span>
          <Hint themeStyle={{ fontSize: '1rem' }} content={EN.ValidationDataDefinitionTip} />
          <a className={styles.download} target="_blank" href={`http://${config.host}:${config.port}/upload/dataDefinition?projectId=${cd.projectId}`}>{EN.Download}</a>
          {/* <span className={styles.email}>
            Email to Receive Alert: {!this.emailEditing && (cd.email || 'empty')}
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
          )} */}
        </div>
        <DeploymentOption cddo={cddo} selectionOption={this.selectionOption} />
        {cddo.option === 'api' && <ApiInstruction deployment={cd} />}
        {
          cddo.option === 'data' && (
            <DataSource
              cddo={cddo}
              show={this.show}
              uploader={uploader}
            />
          )
        }
        <Modal
          visible={!!this.uploadStatus}
          width={700}
          maskClosable={false}
          footer={null}
          onCancel={action(() => { this.uploadStatus = false; this.uploadOperator.pause() })}>
          <div className={styles.uploading}>
            <Progress percent={isNaN(this.uploadPercentage) ? 0 : parseFloat(this.uploadPercentage)} />
            <span className={styles.speed}>{this.uploadSpeed}</span>
            <span className={styles.pause} onClick={this.pause}>{this.uploadStatus === 'uploading'
              ? <span><Icon type="pause" theme="outlined" />{EN.Paused}</span>
              : <span><Icon type="caret-right" theme="outlined" />{EN.Resume}</span>}</span>
          </div>
          {this.uploadStatus === 'error' && <div className={styles.uploadError}>{this.uploadError.toString()}</div>}
        </Modal>
        {
          cddo.option !== 'api' &&
          cddo.source && (
            <ResultLocation
              cddo={cddo}
              selectionOption={this.selectionOption}
              show={this.show}
            />
          )
        }
        {
          cddo.option !== 'api' &&
          cddo.source &&
          cddo.location && (
            <div>
              <DeployFrequency
                show={this.show}
                cddo={cddo}
                selectionOption={this.selectionOption}
              />
            </div>
          )
        }
        {
        cddo.option !== 'api' &&
        cddo.source &&
        cddo.location &&
        cddo.frequency && (
          <MeasurementMetric
            cdpo={cdpo}
            type={cd.modelType}
            selectionOption={this.selectionOption}
          />
        )
      }
        {
          cddo.option !== 'api' &&
          cddo.source &&
          cddo.location &&
          cddo.frequency && (
            <MetricThreshold
              cdpo={cdpo}
              type={cd.modelType}
              selectionOption={this.selectionOption}
            />
          )
        }
        {
          cddo.option !== 'api' &&
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
                      deploymentStore.toggleEnable(cd.id, true);
                      routing.push(
                        `/deploy/project/${match.params.id}/operation`
                      );
                      deploymentStore.deploySchedule(match.params.id);
                    }
                  }}
                >
                  <BButton className={styles.saveText}>{EN.DONE}</BButton>
                </div>
              </div>
            </div>
          )
        }
        <DatabaseConfig
          options={cddo.sourceOptions}
          visible={this.dialog === 'databasesource'}
          onClose={this.closeDialog}
          title={EN.DataSourceDatabase}
          projectId={cd.projectId}
          onSubmit={action(options => {
            // options.csvLocation = options.result.result.csvLocation;
            cddo['source'] = 'database';
            cddo['sourceOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        {/* <DatabaseConfig
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
        /> */}
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
      </div >
    );
  }
}

const DeploymentOption = observer(({ cddo, selectionOption }) => (
  <div className={styles.deploymentOption}>
    <span className={styles.label}>
      <span className={styles.text}>{EN.DeploymentOptionText}:</span>
    </span>
    <div className={styles.selections}>
      {cddo.option === 'api' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img alt="api" src={apiIcon} className={styles.selectionIcon} />
            {EN.PredictWithAPI}
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>{EN.Or}</span>
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
            />{EN.PredictWithDataSource}
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>{EN.Or}</span>
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
            />{EN.PredictWithDataSource}
          </span>
        </div>
      )}
      {cddo.option !== 'api' && (
        <div
          className={styles.selection}
          onClick={selectionOption('option', 'api')}
        >
          <span className={styles.text}>
            <img alt="api" src={apiIcon} className={styles.selectionIcon} />
            {EN.PredictWithAPI}
          </span>
        </div>
      )}
    </div>
  </div>
));

const DataSource = observer(({ cddo, show, uploader }) => (
  <div className={styles.dataSource}>
    <span className={styles.label}>
      <span className={styles.text}>{EN.DataSourceText}:</span>
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
              {EN.Database}
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
            {...uploader}
          >
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />
            {EN.LocalFile}
            <span className={styles.path} title={cddo.file}>
              {cddo.file}
            </span>
          </Uploader>
          <span className={styles.or}>
            <span className={styles.orText}>{EN.Or}</span>
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
            />{EN.Database}
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
            {...uploader}
          >
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />
            {EN.LocalFile}
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
      <span className={styles.text}>{EN.ResultLocation}</span>
    </span>
    <div className={styles.selections}>
      {cddo.location === 'app' && (
        <div className={styles.selected}>
          <span className={styles.text}>
            <img alt="app" src={appIcon} className={styles.selectionIcon} />{EN.InApp}
          </span>
          <span className={styles.or} />
        </div>
      )}
      {/* {cddo.location === 'database' && (
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
      )} */}
      {/* {cddo.location !== 'database' && (
        <div className={styles.selection} onClick={show('databaselocation')}>
          <span className={styles.text}>
            <img
              alt="database"
              src={upDatabaseIcon}
              className={styles.selectionIcon}
            />Upload to Database
          </span>
        </div>
      )} */}
      {cddo.location !== 'app' && (
        <div
          className={styles.selection}
          onClick={selectionOption('location', 'app')}
        >
          <span className={styles.text}>
            <img alt="app" src={appIcon} className={styles.selectionIcon} />{EN.InApp}
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
        <span className={styles.text}>{EN.DeployFrequency}</span>
      </span>
      <div className={styles.selections}>
        {cddo.frequency === 'once' && (
          <div className={styles.selected} onClick={show('onetime')}>
            <span className={styles.result}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />
              <span className={styles.resultText}>
                {EN.OneTime}<span className={styles.detail}>
                  <span className={styles.bold}>{EN.Times}</span>
                  {cddo.frequencyOptions.time === 'completed'
                    ? EN.Aftercompleted
                    : moment
                      .unix(cddo.frequencyOptions.time)
                      .format('MM/DD/YYYY h:mma')}
                </span>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>{EN.Or}</span>
            </span>
          </div>
        )}
        {cddo.frequency === 'repeat' && (
          <div className={styles.selected} onClick={show('autorepeat')}>
            <span className={styles.result}>
              <Icon type="sync" className={styles.antdIcon} />
              <span className={styles.resultText}>
                {EN.Redeployevery}{' '}
                {`${cddo.frequencyOptions.repeatFrequency} ${
                  cddo.frequencyOptions.repeatPeriod
                  } ${
                  cddo.frequencyOptions.repeatPeriod !== 'day' ? 'on' : ''
                  } ${cddo.frequencyOptions.repeatPeriod &&
                  dateFormat[cddo.frequencyOptions.repeatPeriod](
                    cddo.frequencyOptions.repeatOn
                  )}`}
                <small className={styles.detail}>
                  <span className={styles.bold}>{EN.Starts}:</span>
                  {moment
                    .unix(cddo.frequencyOptions.starts)
                    .format('MM/DD/YYYY h:mma')}
                  <br />
                  <span className={styles.bold}>{EN.Ends}:</span>
                  {cddo.frequencyOptions.ends === 'never'
                    ? 'never'
                    : cddo.frequencyOptions.ends > 10000
                      ? moment
                        .unix(cddo.frequencyOptions.ends)
                        .format('MM/DD/YYYY h:mma')
                      : `after ${cddo.frequencyOptions.ends} occurrences`}
                </small>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>{EN.Or}</span>
            </span>
          </div>
        )}
        {cddo.frequency !== 'once' && (
          <div className={styles.selection} onClick={show('onetime')}>
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />{EN.OneTime}
            </span>
          </div>
        )}
        {cddo.frequency !== 'repeat' && (
          <div className={styles.selection} onClick={show('autorepeat')}>
            <span className={styles.text}>
              <Icon type="sync" className={styles.antdIcon} />{EN.AutoRepeat}
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
            {EN.Autodisableifanyissueoccurs}
          </span>
        </Checkbox>
      </div>
    </div>
  </React.Fragment>
));

const MetricThreshold = observer(({ cdpo, selectionOption, type }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>{EN.MetricThreshold}</span>
    </span>
    <div className={styles.selections}>
      {/* <span className={styles.compare}>
        {type === 'Classification' ? '<' : '>'}
      </span> */}
      <InputNumber
        className={styles.inputNumber}
        min={0}
        max={1}
        step={0.1}
        value={cdpo.metricThreshold}
        onChange={value => {
          selectionOption('metricThreshold', value || 0)();
        }}
      />
    </div>
  </div>
));

const MeasurementMetric = observer(({ cdpo, selectionOption, type }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>{EN.MeasurementMetric}</span>
    </span>
    <div className={styles.selections}>
      {type === 'Outlier' && (
        <Select
          className={styles.select}
          value={cdpo.measurementMetric}
          onChange={value => selectionOption('measurementMetric', value)()}
        >
          <Option value="Accuracy">{EN.Accuracy}</Option>
        </Select>
      )}
      {type === 'Clustering' && (
        <Select
          className={styles.select}
          value={cdpo.measurementMetric}
          onChange={value => selectionOption('measurementMetric', value)()}
        >
          <Option value="CVNN">CVNN</Option>
          <Option value="CH">CH Index</Option>
          <Option value="Silhouette Score">Silhouette Score</Option>
        </Select>
      )}
    </div>
  </div>
));

@observer
export class Measurement extends Component {

  handleMeasurement = value => {
    this.props.measureDo.performanceOptions.measurementMetric = value
  }
  render() {
    const {performanceOptions ,modelType } = this.props.measureDo
    const measurementList =
      modelType === "Outlier"
        ? // [{ value: "acc", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }, { value: "precision", label: 'Precision' }, { value: "recall", label: 'Recall' }] :
        [{ value: "score", label: EN.Accuracy }]
        : [
          { value: "CVNN", label: "CVNN" },
          { value: "CH", label: "CH Index" },
          { value: "Silhouette Score", label: "Silhouette Score" },
        ];

    return(
      <div className={styles.advancedBlock}>
        <div className={styles.advancedTitle}>
          <span>{EN.SetMeasurement}:</span>
        </div>
        <div className={styles.advancedOption}>
          <Select className={styles.antdAdvancedSize} value={performanceOptions.measurementMetric} onChange={this.handleMeasurement} >
            {measurementList.map((i, k) => <Option value={i.value} key={k}>{i.label}</Option>)}
          </Select>
        </div>
      </div>
    )
  }
};
