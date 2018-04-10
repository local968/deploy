import React, { Component } from 'react';
import { Checkbox } from 'antd';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { Select, InputNumber, Icon } from 'antd';
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

const Option = Select.Option;

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
                <img src={helpIcon} alt="help" className={styles.helpIcon} />
              </span>
              <div className={styles.selections}>
                <img
                  className={styles.downloadIcon}
                  src={downloadIcon}
                  alt="download"
                />
                <span className={styles.download}>Download</span>
              </div>
            </div>
            <DataSource cdpo={cdpo} selectionOption={this.selectionOption} />
            {cdpo.source && (
              <MeasurementMetric
                cdpo={cdpo}
                selectionOption={this.selectionOption}
              />
            )}
            {cdpo.source && (
              <MetricThreshold
                cdpo={cdpo}
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

const DataSource = observer(({ cdpo, selectionOption }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>Data Source:</span>
    </span>
    <div className={styles.selections}>
      {cdpo.source === 'database' && (
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

const MeasurementMetric = observer(({ cdpo, selectionOption }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>Measurement Metric</span>
    </span>
    <div className={styles.selections}>
      <Select
        className={styles.select}
        value={cdpo.measurementMetric}
        onChange={value => selectionOption('measurementMetric', value)()}
      >
        <Option value="AUC">AUC</Option>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="disabled" disabled>
          Disabled
        </Option>
        <Option value="Yiminghe">yiminghe</Option>
      </Select>
    </div>
  </div>
));

const MetricThreshold = observer(({ cdpo, selectionOption }) => (
  <div className={styles.block}>
    <span className={styles.label}>
      <span className={styles.text}>Metric Threshold</span>
    </span>
    <div className={styles.selections}>
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
            <span className={styles.text}>
              <img alt="once" src={onceIcon} className={styles.selectionIcon} />One
              Time
            </span>
            <span className={styles.or}>
              <span className={styles.orText}>or</span>
            </span>
          </div>
        )}
        {cdpo.frequency === 'repeat' && (
          <div className={styles.selected} onClick={show('autorepeat')}>
            <span className={styles.text}>
              <Icon type="sync" className={styles.antdIcon} />Auto Repeat
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
