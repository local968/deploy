import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import moment from 'moment';
import uuid from 'uuid';
import { message, Popover } from 'antd';
import EN from '../../../constant/en';
import styles from './styles.module.css';
import SimplifiedViews from './SimplifiedViews';
import AdvancedView from './advancedView';
import classnames from 'classnames';
import Preview from './Preview';
import { Show } from 'components/Common';
import WarningBlock from './WarningBlock';

interface AdvancedModelInterface {
  project: any
  closeAdvanced: any
}

@observer
export default class AdvancedModel extends Component<AdvancedModelInterface> {
  @observable tab = 1;
  @observable visiable = false;
  @observable setting = {
    name: `custom.${moment().format('MM.DD.YYYY_HH:mm:ss')}`,
    id: uuid.v4(),
    setting: this.props.project.newSetting(),
    models: [],
  };
  @observable warning = false

  checkBeforeTrain = () => {
    const { project } = this.props;
    const { dataHeader, trainHeader, newVariable, colType, newType } = project
    const variableType = { ...newType, ...colType };
    const labels = [...dataHeader, ...newVariable].filter(h => !trainHeader.includes(h) && variableType[h] !== 'Raw')
    if (labels.length < 2) {
      this.warning = true
      return false
    }
    return true
  }

  closeWarn = () => {
    this.warning = false
  }

  backToConnect = () => {
    const { project } = this.props;
    const { updateProject, nextSubStep } = project;
    updateProject(nextSubStep(1, 2));
    this.closeWarn()
  }

  switchTab = num => {
    if (num !== 1 && num !== 2) return false;
    this.tab = num;
  };

  modeling = () => {
    const checked = this.checkBeforeTrain()
    if (!checked) return
    const { project, closeAdvanced } = this.props;
    const {
      advancedModeling,
      problemType,
      algorithms,
      dataHeader,
      newVariable,
      trainHeader,
      customHeader,
      totalLines,
      kType,
    } = project;
    const allVariables = [...dataHeader, ...newVariable];
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v));
    const key = [allVariables, ...customHeader]
      .map(v => v.sort().toString())
      .indexOf(checkedVariables.sort().toString());
    const hasNewOne = key === -1;
    if (!this.setting.name) {
      message.destroy();
      return message.error(EN.settingNameRequired);
    }
    if (hasNewOne) project.customHeader.push(checkedVariables);
    const disableItems =
      problemType === 'Clustering'
        ? [
          ...(totalLines > 20000
            ? ['Agg', 'DBSCAN', 'SpectralClustering']
            : []),
          ...(kType === 'no_more_than' ? ['DBSCAN', 'MeanShift'] : []),
        ]
        : [];
    const trainAlgorithms = algorithms.filter(al => !disableItems.includes(al));
    if (!trainAlgorithms.length)
      return message.error(EN.Youneedtoselectatleast);
    project.settings.push({ ...this.setting });
    project.settingId = this.setting.id;
    closeAdvanced();
    advancedModeling();
  };

  showTable = () => {
    this.visiable = true;
  };

  hideTable = () => {
    this.visiable = false;
  };

  setSetting = setting => {
    Object.entries(setting).forEach(([key, value]) => {
      this.setting.setting[key] = value;
    });
  };

  setSettingName = name => {
    this.setting.name = name;
  };

  render() {
    const { project, closeAdvanced } = this.props;
    const { dataHeader, newVariable, trainHeader, target } = project;
    const allVariables = [...dataHeader, ...newVariable];
    const checkedVariables = allVariables.filter(
      v => !trainHeader.includes(v) && v !== target,
    );
    return (
      <div className={styles.advancedModel}>
        <div className={styles.advancedContent}>
          <div className={styles.tabBox}>
            <div
              className={classnames(styles.tab, {
                [styles.active]: this.tab === 1,
              })}
              onClick={this.switchTab.bind(null, 1)}
            >
              <span>
                {EN.AdvancedVariable} {EN.Setting}
              </span>
            </div>
            <div
              className={classnames(styles.tab, {
                [styles.active]: this.tab === 2,
              })}
              onClick={this.switchTab.bind(null, 2)}
            >
              <span>
                {EN.AdvancellcedModeling} {EN.Setting}
              </span>
            </div>
          </div>
          <div className={styles.viewBox}>
            <Preview
              project={project}
              visiable={this.visiable}
              showTable={this.showTable}
              hideTable={this.hideTable}
            />
            {this.tab === 1 ? (
              <SimplifiedViews project={project} />
            ) : (
                <AdvancedView
                  project={project}
                  hidden={this.visiable || this.tab === 1}
                  setting={this.setting}
                  setSetting={this.setSetting}
                  setSettingName={this.setSettingName}
                />
              )}
            <div className={styles.bottom}>
              <Show
                name='start_AdvancedModeling_UN'
              ><button
                className={classnames(styles.save, {
                  [styles.disable]: !checkedVariables.length,
                })}
                onClick={!checkedVariables.length ? null : this.modeling}
              >
                  {this.warning ? <Popover content={<WarningBlock backToConnect={this.backToConnect} onClose={this.closeWarn} />} placement='leftBottom' getPopupContainer={el => el.parentElement} visible={true} overlayClassName={styles.warnBlock}>
                    <span>{EN.Modeling}</span>
                  </Popover> : <span>{EN.Modeling}</span>}
                </button>
              </Show>
              <button className={styles.cancel} onClick={closeAdvanced}>
                <span>{EN.Cancel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}