import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { Modal } from 'components/Common';
import { observable } from 'mobx';
import { message, Icon } from 'antd';
import AdvancedView from './advancedView';
import SimplifiedView from './simplifiedView';
import Preview from './Preview'
import autoIcon from './icon_automatic_modeling.svg';
import advancedIcon from './icon_advanced_modeling.svg';
import EN from '../../../constant/en';
import uuid from 'uuid'
import moment from 'moment'

@inject('projectStore','userStore')
@observer
export default class StartTrain extends Component {
  @observable visible = false;

  fastTrain = () => {
    const { project } = this.props.projectStore
    const setting = project.newSetting()
    const name = `auto.${moment().format('MM.DD.YYYY_HH:mm:ss')}`
    const id = uuid.v4()
    project.settings.push({
      setting,
      name,
      id,
      models: []
    })
    project.settingId = id
    project.fastTrain();
  };

  advanced = () => {
    this.visible = true
  }

  closeAdvanced = () => {
    this.visible = false
  }

  render() {
    const {modeling_start_AutomaticModeling=true} = this.props.userStore.info.role;
    return (
      <div className={styles.modelStart}>
        <div className={styles.startTitle}>
          <span>{EN.PrepareToModel}</span>
        </div>
        <div className={styles.trainWarp}>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.fastTrain.bind(this,modeling_start_AutomaticModeling)}>
              <div className={styles.trainRecommend}>
                <span><Icon type="star" style={{ color: "#50647a" }} theme='filled' />{EN.Recommended}</span>
              </div>
              <div className={styles.trainImg}>
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>{EN.EasyAndSimple}</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  {EN.EasyAndSimpleTip}
                </span>
              </div>
            </div>
            <button
              style={{display:(modeling_start_AutomaticModeling?'':'none')}}
              className={styles.train} onClick={this.fastTrain}>
              <span>{EN.AutomaticModeling}</span>
            </button>
          </div>
          <div className={styles.trainSep}/>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.advanced.bind(this,modeling_start_AutomaticModeling)}>
              <div className={styles.trainImg}>
                <img src={advancedIcon} alt="advanced" />
              </div>
              <div className={styles.trainName}>
                <span>{EN.DetailedAndAdvanced}</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  {EN.DetailedAndAdvancedTip}
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.advanced}>
              <span>{EN.AdvancedModeling}</span>
            </button>
          </div>
        </div>
        <Modal width='13em'
          content={<AdvancedModel
            project={this.props.projectStore.project}
            closeAdvanced={this.closeAdvanced} />}
          title={EN.AdvancedModeling}
          onClose={this.closeAdvanced}
          visible={this.visible}
          closeByMask={true}
          showClose={true} />
      </div>
    );
  }
}

@inject('userStore')
@observer
class AdvancedModel extends Component {
  @observable tab = 1
  @observable visiable = false
  @observable setting = {
    name: `custom.${moment().format('MM.DD.YYYY_HH:mm:ss')}`,
    id: uuid.v4(),
    setting: this.props.project.newSetting(),
    models: []
  }

  switchTab = (num) => {
    if (num !== 1 && num !== 2) return false;
    this.tab = num
  }

  modeling = () => {
    const { project, closeAdvanced } = this.props
    const { advancedModeling, version, algorithms, dataHeader, newVariable, trainHeader, customHeader, informativesLabel, target } = project
    const allVariables = [...dataHeader, ...newVariable]
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v) && v !== target)
    const key = [allVariables, informativesLabel, ...customHeader].map(v => v.sort().toString()).indexOf(checkedVariables.sort().toString())
    const hasNewOne = key === -1
    if (!this.setting.name) {
      message.destroy();
      return message.error(EN.settingNameRequired)
    }
    if (hasNewOne) project.customHeader.push(checkedVariables)
    const sortFn = (a, b) => a - b
    if (!!algorithms.length) {
      project.version = [...new Set([...version, 3])].sort(sortFn)
    } else {
      project.version = version.filter(_v => _v !== 3)
    }
    if (!project.version.length) {
      message.destroy();
      return message.error(EN.Youneedtoselectatleast)
    }
    project.settings.push({ ...this.setting })
    project.settingId = this.setting.id
    closeAdvanced()
    advancedModeling()
  }

  showTable = () => {
    this.visiable = true
  }

  hideTable = () => {
    this.visiable = false
  }

  setSetting = (setting) => {
    Object.entries(setting).forEach(([key, value]) => {
      this.setting.setting[key] = value
    })
  }

  setSettingName = (name) => {
    this.setting.name = name
  }

  render() {
    const { project, closeAdvanced } = this.props;
    const { dataHeader, newVariable, trainHeader, target } = project;
    const allVariables = [...dataHeader, ...newVariable];
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v) && v !== target);
    const {quality_RemapTarget=true} = this.props.userStore.info.role;
    return <div className={styles.advancedModel}>
      <div className={styles.advancedContent}>
        <div className={styles.tabBox}>
          <div className={classnames(styles.tab, {
            [styles.active]: this.tab === 1
          })} onClick={this.switchTab.bind(null, 1)}><span>{EN.AdvancedVariable} {EN.Setting}</span></div>
          <div className={classnames(styles.tab, {
            [styles.active]: this.tab === 2
          })} onClick={this.switchTab.bind(null, 2)}><span>{EN.AdvancellcedModeling} {EN.Setting}</span></div>
        </div>
        <div className={styles.viewBox}>
          <Preview project={project} visiable={this.visiable} showTable={this.showTable} hideTable={this.hideTable} />
          {this.tab === 1 ? <SimplifiedView project={project} /> : <AdvancedView project={project} hidden={this.visiable || this.tab === 1} setting={this.setting} setSetting={this.setSetting} setSettingName={this.setSettingName} />}
          <div className={styles.bottom}>
            <button
              style={{display:(quality_RemapTarget?'':'none')}}
              className={classnames(styles.save, {
              [styles.disable]: !checkedVariables.length
            })}
              onClick={!checkedVariables.length ? null : this.modeling} >
              <span>{EN.Modeling}</span>
            </button>
            <button className={styles.cancel} onClick={closeAdvanced}><span>{EN.Cancel}</span></button>
          </div>
        </div>
      </div>
    </div>
  }
}
