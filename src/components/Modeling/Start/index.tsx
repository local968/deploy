import React, { Component } from 'react';
import styles from './Start.module.css';
import { observer, inject } from 'mobx-react';
import { Modal,Show} from 'components/Common';
import { observable } from 'mobx';
import {  Icon } from 'antd';
import autoIcon from './icon_automatic_modeling.svg';
import advancedIcon from './icon_advanced_modeling.svg';
import EN from '../../../constant/en';
import uuid from 'uuid';
import moment from 'moment';
import AdvancedModel from './AdvancedModel'

interface StartTrainInterface {
  projectStore: any
  userStore:any
}
@inject('projectStore','userStore')
@observer
export default class StartTrain extends Component<StartTrainInterface> {
  @observable visible = true;

  fastTrain(run=true){
    if(!run)return;
    const { project } = this.props.projectStore;
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
    const {start_AutomaticModeling=true} = this.props.userStore.info.role;
    return (
      <div className={styles.modelStart}>
        <div className={styles.startTitle}>
          <span>{EN.PrepareToModel}<a href={this.props.projectStore.project.downloadCleanData()} target="_blank" className={styles.downloadEtlData}><Icon type="cloud-download" />{EN.DownloadEtlData}</a></span>
        </div>
        <div className={styles.trainWarp}>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.fastTrain.bind(this,start_AutomaticModeling)}>
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
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>{EN.EasyAndSimple}</span>
              </div>
              <div className={styles.trainDesc}>
                <span>{EN.EasyAndSimpleTip}</span>
              </div>
            </div>
            <Show
              name='start_AutomaticModeling'
            >
              <button
                className={styles.train} onClick={this.fastTrain.bind(this)}>
                <span>{EN.AutomaticModeling}</span>
              </button>
            </Show>

          </div>
          <div className={styles.trainSep}/>
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


