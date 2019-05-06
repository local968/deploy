import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
// import autoIcon from './mr-one-logo-blue.svg';
import { Modal } from 'components/Common';
import { observable } from 'mobx';
import { message, Icon } from 'antd';
import AdvancedView from './advancedView';
import SimplifiedView from './simplifiedView';
import Preview from './Preview'
import autoIcon from './icon_automatic_modeling.svg';
import advancedIcon from './icon_advanced_modeling.svg';

@inject('projectStore')
@observer
export default class StartTrain extends Component {
  @observable visible = false

  fastTrain = () => {
    this.props.projectStore.project.newSetting('auto')
    this.props.projectStore.project.fastTrain();
  };

  advanced = () => {
    this.props.projectStore.project.newSetting('custom')
    this.visible = true
  }

  closeAdvanced = () => {
    this.visible = false
  }

  render() {
    return (
      <div className={styles.modelStart}>
        <div className={styles.startTitle}>
          <span>Data looks good now. It's time to train your model!</span>
        </div>
        <div className={styles.trainWarp}>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.fastTrain}>
              <div className={styles.trainRecommend}>
                <span><Icon type="star" style={{ color: "#50647a" }} theme='filled' />Recommended</span>
              </div>
              <div className={styles.trainImg}>
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>Easy and Simple</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  If you want R2 Learn to build the model automatically.
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.fastTrain}>
              <span>Automatic Modeling</span>
            </button>
          </div>
          <div className={styles.trainSep}></div>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock} onClick={this.advanced}>
              <div className={styles.trainImg}>
                <img src={advancedIcon} alt="advanced" />
              </div>
              <div className={styles.trainName}>
                <span>Detailed and Advanced</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  If you want to have more control over the modeling process.
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.advanced}>
              <span>Advanced Modeling</span>
            </button>
          </div>
        </div>
        <Modal width='13em'
          content={<AdvancedModel
            project={this.props.projectStore.project}
            closeAdvanced={this.closeAdvanced} />}
          title='Advanced Modeling'
          onClose={this.closeAdvanced}
          visible={this.visible}
          closeByMask={true}
          showClose={true} />
      </div>
    );
  }
}

@observer
class AdvancedModel extends Component {
  @observable tab = 1

  switchTab = (num) => {
    if (num !== 1 && num !== 2) return false;
    this.tab = num
  }

  modeling = () => {
    const { project, closeAdvanced } = this.props
    const { advancedModeling, version, algorithms, dataHeader, newVariable, trainHeader, customHeader, target } = project
    const allVariables = [...dataHeader, ...newVariable]
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v) && v !== target)
    const key = [allVariables, ...customHeader].map(v => v.sort().toString()).indexOf(checkedVariables.sort().toString())
    const hasNewOne = key === -1
    if (hasNewOne) project.customHeader.push(checkedVariables)
    const sortFn = (a, b) => a - b
    if (!!algorithms.length) project.version = [...new Set([...version, 3])].sort(sortFn)
    if (!project.version.length) return message.error("You need to select at least one algorithm!")
    closeAdvanced()
    advancedModeling()
  }

  render() {
    const { project, closeAdvanced } = this.props
    const { dataHeader, newVariable, trainHeader, target } = project
    const allVariables = [...dataHeader, ...newVariable]
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v) && v !== target)
    return <div className={styles.advancedModel}>
      <div className={styles.advancedContent}>
        <div className={styles.tabBox}>
          <div className={classnames(styles.tab, {
            [styles.active]: this.tab === 1
          })} onClick={this.switchTab.bind(null, 1)}><span>Advanced Variable Setting</span></div>
          <div className={classnames(styles.tab, {
            [styles.active]: this.tab === 2
          })} onClick={this.switchTab.bind(null, 2)}><span>Advanced Modeling Setting</span></div>
        </div>
        <div className={styles.viewBox}>
          <Preview project={project} />
          {this.tab === 1 ? <SimplifiedView project={project} /> : <AdvancedView project={project} />}
          <div className={styles.bottom}>
            <button className={classnames(styles.save, {
              [styles.disable]: !checkedVariables.length
            })} onClick={!checkedVariables.length ? null : this.modeling} ><span>Modeling</span></button>
            <button className={styles.cancel} onClick={closeAdvanced}><span>Cancel</span></button>
          </div>
        </div>

      </div>
    </div>
  }
}
