import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Modal } from 'components/Common';
import { observable, action } from 'mobx';
import { Icon, Popover } from 'antd';
import autoIcon from './icon_automatic_modeling.svg';
import advancedIcon from './icon_advanced_modeling.svg';
import EN from '../../../constant/en';
import uuid from 'uuid';
import moment from 'moment';
import AdvancedModel from './AdvancedModel'
import WarningBlock from './WarningBlock';

interface StartTrainInterface {
  projectStore: any
  userStore: any
}
@inject('projectStore', 'userStore')
@observer
export default class StartTrain extends Component<StartTrainInterface> {
  @observable visible = false;
  @observable warning = false

  checkBeforeFastTrain = () => {
    const { project } = this.props.projectStore;
    const { dataHeader, colType } = project
    const labels = dataHeader.filter(h => colType[h] !== 'Raw')
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
    const { project } = this.props.projectStore;
    const { updateProject, nextSubStep } = project;
    updateProject(nextSubStep(1, 2));
    this.closeWarn()
  }

  fastTrain = (run = true) => {
    if (!run) return;
    const { project } = this.props.projectStore;
    const checked = this.checkBeforeFastTrain()
    if (!checked) return
    const setting = project.newSetting();
    const name = `auto.${moment().format('MM.DD.YYYY_HH:mm:ss')}`;
    const id = uuid.v4();
    project.settings.push({
      setting,
      name,
      id,
      models: [],
    });
    project.settingId = id;
    project.fastTrain();
  };

  advanced = () => {
    this.visible = true;
  };

  closeAdvanced = () => {
    this.visible = false;
  };

  render() {
    const { start_AutomaticModeling_UN = true } = this.props.userStore.info.role;
    return (
      <div className={styles.modelStart}>
        <div className={styles.startTitle}>
          <span>{EN.PrepareToModel}</span>
        </div>
        <div className={styles.trainWarp}>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.fastTrain.bind(this, start_AutomaticModeling_UN)}>
              <div className={styles.trainRecommend}>
                <span>
                  <Icon
                    type="star"
                    style={{ color: '#50647a' }}
                    theme="filled"
                  />
                  {EN.Recommended}
                </span>
              </div>
              <div className={styles.trainImg}>
                {this.warning ? <Popover content={<WarningBlock backToConnect={this.backToConnect} onClose={this.closeWarn} />} placement='right' getPopupContainer={el => el.parentElement} visible={true} overlayClassName={styles.warnBlock}>
                  <img src={autoIcon} alt="auto" />
                </Popover> : <img src={autoIcon} alt="auto" />}
                {/* <Popover content={<WarningBlock backToConnect={this.backToConnect} onClose={this.closeWarn} visible={this.warning} />} placement='right' getPopupContainer={el => el.parentElement} visible={!!this.warning} overlayClassName={styles.warnBlock}>
                  <img src={autoIcon} alt="auto" />
                </Popover> */}
              </div>
              <div className={styles.trainName}>
                <span>{EN.EasyAndSimple}</span>
              </div>
              <div className={styles.trainDesc}>
                <span>{EN.EasyAndSimpleTip}</span>
              </div>
            </div>
            <button
              style={{ display: (start_AutomaticModeling_UN ? '' : 'none') }}
              className={styles.train} onClick={this.fastTrain.bind(this, start_AutomaticModeling_UN)}>
              <span>{EN.AutomaticModeling}</span>
            </button>
          </div>
          <div className={styles.trainSep} />
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.advanced}>
              <div className={styles.trainImg}>
                <img src={advancedIcon} alt="advanced" />
              </div>
              <div className={styles.trainName}>
                <span>{EN.DetailedAndAdvanced}</span>
              </div>
              <div className={styles.trainDesc}>
                <span>{EN.DetailedAndAdvancedTip}</span>
              </div>
            </div>
            <button className={styles.train} onClick={this.advanced}>
              <span>{EN.AdvancedModeling}</span>
            </button>
          </div>
        </div>
        <Modal
          width="13em"
          content={
            <AdvancedModel
              project={this.props.projectStore.project}
              closeAdvanced={this.closeAdvanced}
            />
          }
          title={EN.AdvancedModeling}
          onClose={this.closeAdvanced}
          visible={this.visible}
          closeByMask={true}
          showClose={true}
        />
      </div>
    );
  }
}


