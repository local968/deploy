import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import autoIcon from './mr-one-logo-blue.svg';
import { Modal } from 'components/Common';
import { when, observable } from 'mobx';
import { Spin } from 'antd';
import AdvancedView from './advancedView';
import SimplifiedView from './simplifiedView';

@observer
export default class StartTrain extends Component {
  @observable visible = false

  fastTrain = () => {
    this.props.project.fastTrain();
  };

  advanced = () => {
    this.visible = true
  }

  closeAdvanced = () => {
    this.visible = false
  }

  render() {
    return (
      <div className={styles.modelStart}>
        <div className={styles.startTitle}>
          <span>Data looks good now, It's time to train your model!</span>
        </div>
        <div className={styles.trainWarp}>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock}>
              <div className={styles.trainRecommend}>
                <span>Recommended</span>
              </div>
              <div className={styles.trainImg}>
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>Easy and simple</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  If you want Mr.One to build the model automatically, choose
                  automatic modeling.
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.fastTrain}>
              <span>Automatic Modeling</span>
            </button>
          </div>
          <div className={styles.trainSep}></div>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock}>
              <div className={styles.trainImg}>
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>Detailed and advanced</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  If you want to have more control over the modeling process, choose advanced modeling.
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.advanced}>
              <span>Advanced Modeling</span>
            </button>
          </div>
        </div>
        <Modal width='13em' content={<AdvancedModel project={this.props.project} closeAdvanced={this.closeAdvanced} />} title='Advanced Modeling' onClose={this.closeAdvanced} visible={this.visible} />
      </div>
    );
  }
}

@observer
class AdvancedModel extends Component {
  componentDidMount() {
    when(
      () => !this.props.project.dataViews,
      () => this.props.project.dataView()
    )
    when(
      () => !this.props.project.preImportance,
      () => this.props.project.preTrainImportance()
    )
  }

  @observable tab = 1

  switchTab = (num) => {
    if (num !== 1 && num !== 2) return false;
    this.tab = num
  }

  modeling = () => {
    const { project, closeAdvanced } = this.props
    closeAdvanced()
    project.advancedModeling()
  }

  render() {
    const { project, closeAdvanced } = this.props
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
          {this.tab === 1 ? <SimplifiedView project={project} /> : <AdvancedView project={project} />}
          {(!project.dataViews || !project.preImportance) && <div className={styles.simplifiedLoad}>
            <Spin size="large" />
          </div>}
        </div>
        <div className={styles.bottom}>
          <button className={styles.save} onClick={this.modeling} ><span>modeling</span></button>
          <button className={styles.cancel} onClick={closeAdvanced}><span>cancel</span></button>
        </div>

      </div>
    </div>
  }
}