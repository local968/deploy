import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import moment from 'moment';
import uuid from 'uuid';
import { message } from 'antd';
import EN from '../../../constant/en';
import styles from './Start.module.css';
import SimplifiedView from './Supervised/SimplifiedView';
import AdvancedView from './Supervised/advancedView';
import UnSimplifiedView from './UnSupervised/SimplifiedView';
import UnAdvancedView from './UnSupervised/advancedView';
import classnames from 'classnames'
import Preview from './Preview'
import { Show } from 'components/Common';
import Project from 'stores/Project';

interface AdvancedModelInterface {
  project: Project
  closeAdvanced: () => void
}

export interface AdvancedSetting {
  name: string,
  id: string,
  setting: unknown,
  models: string[],
};

@observer
export default class AdvancedModel extends Component<AdvancedModelInterface> {
  @observable tab = 1;
  @observable visiable = false;
  @observable setting: AdvancedSetting = {
    name: `custom.${moment().format('MM.DD.YYYY_HH:mm:ss')}`,
    id: uuid.v4(),
    setting: this.props.project.newSetting(),
    models: [],
  };

  switchTab = num => {
    if (num !== 1 && num !== 2) return false;
    this.tab = num;
  };

  modeling = () => {
    const { project, closeAdvanced } = this.props;
    const {
      advancedModeling,
      version,
      algorithms,
      dataHeader,
      newVariable,
      trainHeader,
      customHeader,
      informativesLabel,
      target,
    } = project;
    const allVariables = [...dataHeader, ...newVariable];
    const checkedVariables = allVariables.filter(
      v => !trainHeader.includes(v) && v !== target,
    );
    const key = [allVariables, informativesLabel, ...customHeader]
      .map(v => v.sort().toString())
      .indexOf(checkedVariables.sort().toString());
    const hasNewOne = key === -1;
    if (!this.setting.name) {
      message.destroy();
      return message.error(EN.settingNameRequired);
    }
    if (hasNewOne) project.customHeader.push(checkedVariables);
    const sortFn = (a, b) => a - b;
    if (!!algorithms.length) {
      project.version = [...new Set([...version, 3])].sort(sortFn);
    } else {
      project.version = version.filter(_v => _v !== 3);
    }
    if (!project.version.length) {
      message.destroy();
      return message.error(EN.Youneedtoselectatleast);
    }
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
    const { dataHeader, newVariable, trainHeader, target, problemType } = project;
    const allVariables = [...dataHeader, ...newVariable];
    const checkedVariables = allVariables.filter(
      v => !trainHeader.includes(v) && v !== target,
    );
    const isUnsupervised = ['Clustering', 'Outlier'].includes(problemType);

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
              isUnsupervised ? <UnSimplifiedView project={project} /> : <SimplifiedView project={project} />
            ) : (
                isUnsupervised ? <UnAdvancedView
                  project={project}
                  hidden={this.visiable || this.tab === 1}
                  setting={this.setting}
                  setSetting={this.setSetting}
                  setSettingName={this.setSettingName}
                /> : <AdvancedView
                    project={project}
                    hidden={this.visiable || this.tab === 1}
                    setting={this.setting}
                    setSetting={this.setSetting}
                    setSettingName={this.setSettingName}
                  />
              )}
            <div className={styles.bottom}>
              <Show
                name='start_AdvancedModeling'
              >
                <button
                  className={classnames(styles.save, {
                    [styles.disable]: !checkedVariables.length,
                  })}
                  onClick={!checkedVariables.length ? null : this.modeling}
                >
                  <span>{EN.Modeling}</span>
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
