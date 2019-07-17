import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';
import styles from './styles.module.css';
import classnames from 'classnames';
import EN from '../../../constant/en';
import { DeploymentStore } from 'stores/DeploymentStore';
import { ScheduleStore } from 'stores/ScheduleStore';
import { RouterStore } from 'mobx-react-router';


interface NormalHeaderProps {
  deploymentStore?: DeploymentStore,
  scheduleStore?: ScheduleStore,
  routing?: RouterStore
}

@inject('deploymentStore', 'scheduleStore', 'routing')
@observer
class NormalHeader extends Component<NormalHeaderProps> {
  @computed
  get enabledProjectsCount() {
    return this.props.deploymentStore.deployments.filter(_d => _d.enable).length;
  }

  @computed
  get normalProjectsCount() {
    const { deploymentStore, scheduleStore } = this.props;
    const isNormal = id =>
      scheduleStore.getLastSchedule(id, 'deployment').status !== 'issue' &&
      scheduleStore.getLastSchedule(id, 'performance').status !== 'issue';
    return deploymentStore.deployments.filter(_d => isNormal(_d.id)).length;
  }

  render() {
    const { deploymentStore, routing } = this.props;
    return (
      <div className={styles.header} onClick={() => routing.push('/deploy')}>
        <div className={classnames(styles.block, styles.total)}>
          <span className={styles.number}>
            {deploymentStore.deployments.length}
          </span>
          <span className={styles.text}>{EN.TotalProject}</span>
        </div>
        <div className={classnames(styles.block, styles.enabled)}>
          <span className={styles.number}>{this.enabledProjectsCount}</span>
          <span className={styles.text}>{EN.Enabled}</span>
        </div>
        <div className={classnames(styles.block, styles.disabled)}>
          <span className={styles.number}>
            {deploymentStore.deployments.length - this.enabledProjectsCount}
          </span>
          <span className={styles.text}>{EN.Disabled}</span>
        </div>
        <div className={styles.gap} />
        <div className={classnames(styles.block, styles.normal)}>
          <span className={styles.number}>{this.normalProjectsCount}</span>
          <span className={styles.text}>{EN.Normal}</span>
        </div>
        <div className={classnames(styles.block, styles.issue)}>
          <span className={styles.number}>
            {deploymentStore.deployments.length - this.normalProjectsCount}
          </span>
          <span className={styles.text}>{EN.Issue}</span>
        </div>
        <div className={styles.empty} />
        {/* <div className={styles.user}>
          <img src={mockAvatar} alt="avatar" className={styles.avatar} />
          <div className={styles.userBottom}>
            <span className={styles.name}>Newton Barley</span>
            <img className={styles.down} src={down} alt="down" />
          </div>
        </div> */}
      </div>
    );
  }
}

export default NormalHeader