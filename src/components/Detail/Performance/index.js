import React, { Component } from 'react';
import { Checkbox } from 'antd';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { Select, InputNumber, Icon } from 'antd';
import moment from 'moment';
import styles from './styles.module.css';
import downloadIcon from './icon-download.svg';
import helpIcon from './icon-help.svg';
import infoIcon from './icon-info.svg';
import databaseIcon from './icon-database.svg';
import fileIcon from './icon-file-local.svg';
import onceIcon from './icon-once.svg';
import OneTime from 'components/Common/OneTime';
import AutoRepeat from 'components/Common/AutoRepeat';
import List from './list';
import DatabaseConfig from 'components/Common/DatabaseConfig';

const Option = Select.Option;

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

@inject('deployStore')
@observer
export default class Performance extends Component {
  @observable dialog = null;

  @action
  selectionOption = (key, value) => () => {
    this.props.deployStore.currentDeployment.performanceOptions[key] = value;
  };
  show = key => action(() => (this.dialog = key));
  closeDialog = action(() => (this.dialog = null));
  render() {
    const { deployStore } = this.props;
    const cd = deployStore.currentDeployment;
    const cdpo = cd.performanceOptions;
    return (
      <div className={styles.performance}>
        {cdpo.enable && (
          <List cd={cd} cdpo={cdpo} selectionOption={this.selectionOption} />
        )}
        {!cdpo.enable && (
          <React.Fragment>
            <div className={styles.block}>
              <span className={styles.label}>
                <span className={styles.text}>Model</span>
              </span>
              <div className={styles.selections}>
                <span className={styles.modelName}>{cd.modelName}</span>
                <img alt="model" src={infoIcon} className={styles.infoIcon} />
              </div>
            </div>
            <div className={styles.block}>
              <span className={styles.label}>
                <span className={styles.text}>Validation Data Definition</span>
                {/* <img src={helpIcon} alt="help" className={styles.helpIcon} /> */}
              </span>
              <div className={styles.selections}>
                <img
                  className={styles.downloadIcon}
                  src={downloadIcon}
                  alt="download"
                />
                <a
                  className={styles.download}
                  href={deployStore.dataDefinition}
                >
                  Download
                </a>
              </div>
            </div>
            <DataSource
              cdpo={cdpo}
              selectionOption={this.selectionOption}
              show={this.show}
            />
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
            <div
              className={styles.save}
              onClick={() => {
                if (cdpo.frequency) this.selectionOption('enable', true)();
                cd.save();
              }}
            >
              <span className={styles.saveText}>
                SAVE & SETUP {!cdpo.frequency && 'LATER'}
              </span>
            </div>
            <DatabaseConfig
              options={cdpo.sourceOptions}
              visible={this.dialog === 'databasesource'}
              validation
              onClose={this.closeDialog}
              title="Validation Data Source - Database"
              onSubmit={options => {
                this.selectionOption('source', 'database')();
                this.selectionOption('sourceOptions', options)();
                this.closeDialog();
              }}
            />
            <OneTime
              options={cdpo.frequencyOptions}
              visible={this.dialog === 'onetime'}
              onClose={this.closeDialog}
              onSubmit={options => {
                this.selectionOption('frequency', 'once')();
                this.selectionOption('frequencyOptions', options)();
                this.closeDialog();
              }}
            />
            <AutoRepeat
              options={cdpo.frequencyOptions}
              visible={this.dialog === 'autorepeat'}
              onClose={this.closeDialog}
              onSubmit={options => {
                this.selectionOption('frequency', 'repeat')();
                this.selectionOption('frequencyOptions', options)();
                this.closeDialog();
              }}
            />
          </React.Fragment>
        )}
      </div>
    );
  }
}

const DataSource = observer(({ cdpo, selectionOption, show }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>Data Source:</span>
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
              Database
              <span className={styles.path}>{cdpo.sourceOptions.hostname}</span>
            </span>
          </span>
          <span className={styles.or}>
            <span className={styles.orText}>or</span>
          </span>
        </div>
      )}

      {cdpo.source === 'file' && (
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

      {cdpo.source !== 'database' && (
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
      {cdpo.source !== 'file' && (
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
    </div>
  </div>
));

const MeasurementMetric = observer(({ cdpo, selectionOption, type }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>Measurement Metric</span>
    </span>
    <div className={styles.selections}>
      {type === 'Classification' && (
        <Select
          className={styles.select}
          value={cdpo.measurementMetric}
          onChange={value => selectionOption('measurementMetric', value)()}
        >
          <Option value="AUC">AUC</Option>
          <Option value="Accuracy">Accuracy</Option>
        </Select>
      )}
      {type === 'Regression' && <span className={styles.rmse}>RMSE</span>}
    </div>
  </div>
));

const MetricThreshold = observer(({ cdpo, selectionOption, type }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>Metric Threshold</span>
    </span>
    <div className={styles.selections}>
      <span className={styles.compare}>
        {type === 'Classification' ? '<' : '>'}
      </span>
      <InputNumber
        className={styles.inputNumber}
        min={1}
        max={100}
        value={cdpo.metricThreshold}
        onChange={value => {
          selectionOption('metricThreshold', value || 0)();
        }}
        formatter={value => `${value}%`}
      />
    </div>
  </div>
));

const DeployFrequency = observer(({ cdpo, selectionOption, show }) => (
  <React.Fragment>
    <div className={styles.block}>
      <span className={styles.label}>
        <span className={styles.text}>Deploy Frequency:</span>
      </span>
      <div className={styles.selections}>
        {cdpo.frequency === 'once' && (
          <div className={styles.selected} onClick={show('onetime')}>
            <span className={styles.result}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />
              <span className={styles.resultText}>
                One Time<span className={styles.detail}>
                  <span className={styles.bold}>time:</span>
                  {cdpo.frequencyOptions.time === 'completed'
                    ? ' After completed'
                    : moment
                        .unix(cdpo.frequencyOptions.time)
                        .format('DD/MM/YYYY h:mma')}
                </span>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cdpo.frequency === 'repeat' && (
          <div className={styles.selected} onClick={show('autorepeat')}>
            <span className={styles.result}>
              <Icon type="sync" className={styles.antdIcon} />
              <span className={styles.resultText}>
                Redeploy every{' '}
                {`${cdpo.frequencyOptions.repeatFrequency} ${
                  cdpo.frequencyOptions.repeatPeriod
                } ${
                  cdpo.frequencyOptions.repeatPeriod !== 'day' ? 'on' : ''
                } ${dateFormat[cdpo.frequencyOptions.repeatPeriod](
                  cdpo.frequencyOptions.repeatOn
                )}`}
                <small className={styles.detail}>
                  <span className={styles.bold}>Starts:</span>
                  {moment
                    .unix(cdpo.frequencyOptions.starts)
                    .format('DD/MM/YYYY h:mma')}
                  <br />
                  <span className={styles.bold}>Ends:</span>
                  {cdpo.frequencyOptions.ends === 'never'
                    ? 'never'
                    : cdpo.frequencyOptions.ends > 10000
                      ? moment
                          .unix(cdpo.frequencyOptions.ends)
                          .format('DD/MM/YYYY h:mma')
                      : `after ${cdpo.frequencyOptions.ends} occurrences`}
                </small>
              </span>
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cdpo.frequency !== 'once' && (
          <div className={styles.selection} onClick={show('onetime')}>
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />One
              Time
            </span>
          </div>
        )}
        {cdpo.frequency !== 'repeat' && (
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
          checked={cdpo.autoDisable}
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
