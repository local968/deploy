import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { Select, InputNumber, Icon, Progress, Checkbox, Modal } from 'antd';
import moment from 'moment';
import styles from './styles.module.css';
import downloadIcon from './icon-download.svg';
import databaseIcon from './icon-database.svg';
import fileIcon from './icon-file-local.svg';
import onceIcon from './icon-once.svg';
import OneTime from 'components/Common/OneTime';
import AutoRepeat from 'components/Common/AutoRepeat';
// import List from './list';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import Uploader from '../Uploader';
import BButton from 'components/Common/BlackButton';
import Hint from 'components/Common/Hint';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import config from 'config';

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

let clusteringList = []

@inject('deploymentStore', 'userStore', 'routing')
@observer
export default class Performance extends Component {
  @observable dialog = null;
  @observable errorTimes = 0;
  @observable uploadStatus = false;
  @observable uploadPercentage = 0;
  @observable uploadSpeed = '0 Kb/s';
    @observable modelEditing = false;
    @observable tempModelName = false;

  @action
  selectionOption = (key, value) => () => {
    this.props.deploymentStore.currentDeployment.performanceOptions[key] = value;
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


    // isDisable (modelId) {
    //     if(modelId.indexOf('Agg') != -1 || modelId.indexOf('DBSCAN1') != -1 || modelId.indexOf('SpectralClustering') != -1 ){
    //         return true
    //     }else {
    //         return false
    //     }
    // }




    render() {
    const { deploymentStore, userStore, routing, match } = this.props;
    const cd = deploymentStore.currentDeployment;

    if(cd.modelType === 'Clustering') {
        cd.modelList && Object.entries(cd.modelList).map(([settingName, models]) =>{
            clusteringList = models.filter(model =>{
                return (model.modelId.indexOf('Agg') == -1 && model.modelId.indexOf('DBSCAN1') == -1  && model.modelId.indexOf('SpectralClustering') == -1)
            })
        })

    }

        console.log('123',clusteringList)
    const cdpo = cd.performanceOptions;
    const uploader = {
      onError: action((error, times) => {
        console.error(error)
        this.errorTimes = times
        this.uploadStatus = 'error'
        this.uploadError = error
      }),
      onFinished: action((response, file) => {
        cdpo.file = file.name
        cdpo.fileId = response.originalIndex
        cdpo.source = 'file'
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


    console.log(cd.modelType , 'cd.modelTypecd.modelType' , cd.modelList)

    return (
      <div className={styles.performance}>
        {/* {cdpo.enable && (
          <List cd={cd} cdpo={cdpo} selectionOption={this.selectionOption} />
        )} */}
        {/* {!cdpo.enable && (
          <React.Fragment> */}
          {
              cd.modelType !== 'Outlier' && cd.modelType !== 'Clustering' &&(
                  <div className={styles.block}>
                      <span className={styles.label}>
                        <span className={styles.text}>{EN.Model}</span>
                      </span>
                      <div className={styles.selections}>
                          <span className={styles.modelName}>{cd.modelName}</span>
                          {/* <img alt="model" src={infoIcon} className={styles.infoIcon} /> */}
                      </div>
                  </div>
              )
          }

          {
              cd.modelType === 'Outlier' &&(
                  <div className={styles.blocks}>
                  <span className={styles.labels}>{EN.Model}: {this.modelEditing ?
                      <Select  className={styles.selectionss} value={this.tempModelName || cd.modelName} onChange={this.modelChange}>
                          {cd.modelList && Object.entries(cd.modelList).map(([settingName, models]) =>
                              <OptGroup key={settingName} label={settingName}>
                                  {models.map(model =>  <Option key={model.modelId} alt={model.performance} value={model.name}>{model.name}</Option>
                                  )}
                              </OptGroup>)}
              </Select> : cd.modelName}</span>
                      <Hint themeStyle={{ fontSize: '1rem' }} content={cd.currentModel && cd.currentModel.performance} />
                      <a className={styles.labels} onClick={this.onSaveModel}>{this.modelEditing ? EN.Save : EN.Change}</a>
                  </div>
              )}

          {
              cd.modelType === 'Clustering' &&(
                  <div className={styles.blocks}>
                  <span className={styles.labels}>{EN.Model}: {this.modelEditing ?
                      <Select  className={styles.selectionss} value={this.tempModelName || cd.modelName} onChange={this.modelChange}>
                          {cd.modelList && Object.entries(cd.modelList).map(([settingName, models]) =>
                              <OptGroup key={settingName} label={settingName}>
                                  {clusteringList.map(model =>  <Option key={model.modelId} alt={model.performance} value={model.name}>{model.name}</Option>
                                  )}
                              </OptGroup>)}
                      </Select> : cd.modelName}</span>
                      <Hint themeStyle={{ fontSize: '1rem' }} content={cd.currentModel && cd.currentModel.performance} />
                      <a className={styles.labels} onClick={this.onSaveModel}>{this.modelEditing ? EN.Save : EN.Change}</a>
                  </div>
              )}

        <div className={styles.block}>
          <span className={styles.label}>
            <span className={styles.text}>{EN.lidationDataDefinition}</span>
            <Hint themeStyle={{ fontSize: '1rem' }} content={EN.ValidationDataDefinitionTip} />
          </span>
          <div className={styles.selections}>
            <img
              className={styles.downloadIcon}
              src={downloadIcon}
              alt="download"
            />
            <a className={styles.download} href={`/upload/dataDefinition?projectId=${cd.projectId}&type=performance`} >
              {EN.Download}
            </a>
          </div>
        </div>
        <DataSource
          cd={cd}
          cdpo={cdpo}
          selectionOption={this.selectionOption}
          show={this.show}
          uploader={uploader}
        />
        <Modal
          visible={!!this.uploadStatus}
          footer={null}
          width={700}
          maskClosable={false}
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
        {cdpo.source && (
          <MeasurementMetric
            cdpo={cdpo}
            type={cd.modelType}
            selectionOption={this.selectionOption}
          />
        )}
        {cdpo.source && (
          <MetricThreshold
            cdpo={cdpo}
            type={cd.modelType}
            selectionOption={this.selectionOption}
          />
        )}
        {cdpo.source && (
          <DeployFrequency
            cdpo={cdpo}
            selectionOption={this.selectionOption}
            show={this.show}
          />
        )}
        {cdpo.frequency && (
          <div className={styles.block}>
            <div className={styles.selections}>
              <span className={styles.label}>
                <span className={styles.text} />
              </span>
              <div
                className={styles.save}
                onClick={() => {
                  if (cdpo.frequency) {
                    deploymentStore.toggleEnable(cd.id, true);
                    routing.push(`/deploy/project/${match.params.id}/status`);
                    deploymentStore.deploySchedule(match.params.id, {
                      type: cdpo.measurementMetric,
                      value: cdpo.metricThreshold
                    });
                  }
                }}
              >
                <BButton className={styles.saveText}>{EN.DONE}</BButton>
              </div>
            </div>
          </div>
        )}
        <DatabaseConfig
          options={cdpo.sourceOptions}
          visible={this.dialog === 'databasesource'}
          validation
          projectId={cd.projectId}
          onClose={this.closeDialog}
          title={EN.ValidationDataSource + " - " + EN.Database}
          onSubmit={action(options => {
            // options.csvLocation = options.result.result.csvLocation;
            cdpo['source'] = 'database';
            cdpo['sourceOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        <OneTime
          options={cdpo.frequencyOptions}
          visible={this.dialog === 'onetime'}
          onClose={this.closeDialog}
          onSubmit={action(options => {
            cdpo['frequency'] = 'once';
            cdpo['frequencyOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        <AutoRepeat
          options={cdpo.frequencyOptions}
          visible={this.dialog === 'autorepeat'}
          onClose={this.closeDialog}
          onSubmit={action(options => {
            cdpo['frequency'] = 'repeat';
            cdpo['frequencyOptions'] = options;
            cd.save();
            this.closeDialog();
          })}
        />
        {/* </React.Fragment>
        )} */}
      </div>
    );
  }
}

const DataSource = observer(({ cd, cdpo, show, uploader }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>{EN.DataSourceText}:</span>
    </span>
    <div className={styles.selections}>
      {cdpo.source === 'database' && (
        <div className={styles.selected} onClick={show('databasesource')}>
          <span className={styles.result}>
            <img
              alt="database"
              src={databaseIcon}
              className={styles.selectionIcon}
            />
            <span className={styles.resultText}>
              {EN.Database}
              <span className={styles.path}>{cdpo.sourceOptions.hostname}</span>
            </span>
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>{EN.Or}</span>
          </span>
        </div>
      )}

      {cdpo.source === 'file' && (
        <div className={styles.selected}>
          <Uploader
            className={styles.resultText}
            {...uploader}
          >
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />{EN.LocalFile}
            <span className={styles.path} title={cdpo.file}>
              {cdpo.file}
            </span>
          </Uploader>
          <span className={styles.or}>
            <span className={styles.orText}>{EN.Or}</span>
          </span>
        </div>
      )}

      {cdpo.source !== 'database' && (
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
      {cdpo.source !== 'file' && (
        <div className={styles.selectionWithoutHover}>
          <Uploader
            className={styles.text}
            {...uploader}
          >
            <img alt="file" src={fileIcon} className={styles.selectionIcon} />
            {EN.LocalFile}
          </Uploader>
        </div>
      )}
    </div>
  </div>
));

const MeasurementMetric = observer(({ cdpo, selectionOption, type }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>{EN.MeasurementMetric}</span>
    </span>
    <div className={styles.selections}>
      {type === 'Classification' && (
        <Select
          className={styles.select}
          value={cdpo.measurementMetric}
          onChange={value => selectionOption('measurementMetric', value)()}
        >
          {/* <Option value="Accuracy">{EN.Accuracy}</Option> */}
          <Option value="AUC">{EN.AUC}</Option>
          <Option value="F1">F1</Option>
          {/* <Option value="Precision">{EN.Precision}</Option> */}
          {/* <Option value="Recall">{EN.Recall}</Option> */}
        </Select>
      )}
      {type === 'Regression' && (
        <Select
          className={styles.select}
          value={cdpo.measurementMetric}
          onChange={value => selectionOption('measurementMetric', value)()}
        >
          <Option value="R2">R²</Option>
          <Option value="RMSE">{EN.RMSE}</Option>
          <Option value="MSE">MSE</Option>
        </Select>
      )}

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
          <Option value="silhouette_euclidean">Silhouette Score</Option>
        </Select>
      )}

    </div>
  </div>
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

const DeployFrequency = observer(({ cdpo, selectionOption, show }) => (
  <React.Fragment>
    <div className={styles.block}>
      <span className={styles.label}>
        <span className={styles.text}>{EN.DeployFrequency}:</span>
      </span>
      <div className={styles.selections}>
        {cdpo.frequency === 'once' && (
          <div className={styles.selected} onClick={show('onetime')}>
            <span className={styles.result}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />
              <span className={styles.resultText}>
                {EN.OneTime}<span className={styles.detail}>
                  <span className={styles.bold}>{EN.Times}</span>
                  {cdpo.frequencyOptions.time === 'completed'
                    ? EN.Aftercompleted
                    : moment
                      .unix(cdpo.frequencyOptions.time)
                      .format('MM/DD/YYYY h:mma')}
                </span>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>{EN.Or}</span>
            </span>
          </div>
        )}
        {cdpo.frequency === 'repeat' && (
          <div className={styles.selected} onClick={show('autorepeat')}>
            <span className={styles.result}>
              <Icon type="sync" className={styles.antdIcon} />
              <span className={styles.resultText}>
                {EN.Redeployevery}{' '}
                {`${cdpo.frequencyOptions.repeatFrequency} ${
                  cdpo.frequencyOptions.repeatPeriod
                  } ${
                  cdpo.frequencyOptions.repeatPeriod !== 'day' ? 'on' : ''
                  } ${cdpo.frequencyOptions.repeatPeriod &&
                  dateFormat[cdpo.frequencyOptions.repeatPeriod](
                    cdpo.frequencyOptions.repeatOn
                  )}`}
                <small className={styles.detail}>
                  <span className={styles.bold}>{EN.Starts}:</span>
                  {moment
                    .unix(cdpo.frequencyOptions.starts)
                    .format('MM/DD/YYYY h:mma')}
                  <br />
                  <span className={styles.bold}>{EN.Ends}:</span>
                  {cdpo.frequencyOptions.ends === 'never'
                    ? EN.NeverS
                    : cdpo.frequencyOptions.ends > 10000
                      ? moment
                        .unix(cdpo.frequencyOptions.ends)
                        .format('MM/DD/YYYY h:mma')
                      : `after ${cdpo.frequencyOptions.ends} occurrences`}
                </small>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>{EN.Or}</span>
            </span>
          </div>
        )}
        {cdpo.frequency !== 'once' && (
          <div className={styles.selection} onClick={show('onetime')}>
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />{EN.OneTime}
            </span>
          </div>
        )}
        {cdpo.frequency !== 'repeat' && (
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
          checked={cdpo.autoDisable}
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
