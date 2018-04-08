import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';
import styles from './styles.module.css';
import classnames from 'classnames';
import mockAvatar from 'components/Layout/Sider/mr-one-copy.svg';
// import down from './combined-shape-copy.svg';
// import more from './btn-more-option.svg';

@inject('deployStore')
@observer
class NormalHeader extends Component {
  @computed
  get enabledProjectsCount() {
    return this.props.deployStore.deployments.filter(_d => _d.enable).length;
  }

  @computed
  get normalProjectsCount() {
    return this.props.deployStore.deployments.filter(_d => !_d.issue).length;
  }

  render() {
    const { deployStore } = this.props;
    console.log(deployStore);
    return (
      <div className={styles.header}>
        <div className={classnames(styles.block, styles.total)}>
          <span className={styles.number}>
            {deployStore.deployments.length}
          </span>
          <span className={styles.text}>Total Project</span>
        </div>
        <div className={classnames(styles.block, styles.enabled)}>
          <span className={styles.number}>{this.enabledProjectsCount}</span>
          <span className={styles.text}>Enabled</span>
        </div>
        <div className={classnames(styles.block, styles.disabled)}>
          <span className={styles.number}>
            {deployStore.deployments.length - this.enabledProjectsCount}
          </span>
          <span className={styles.text}>Disabled</span>
        </div>
        <div className={styles.gap} />
        <div className={classnames(styles.block, styles.normal)}>
          <span className={styles.number}>{this.normalProjectsCount}</span>
          <span className={styles.text}>Normal</span>
        </div>
        <div className={classnames(styles.block, styles.issue)}>
          <span className={styles.number}>
            {deployStore.deployments.length - this.normalProjectsCount}
          </span>
          <span className={styles.text}>Issue</span>
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

const WelcomeHeader = () => (
  <div className={styles.wheader}>
    <img src={mockAvatar} alt="avatar" className={styles.wavatar} />
    <span className={styles.welcome}>Welcome!</span>
    {/* <img className={styles.more} src={more} alt="more" /> */}
  </div>
);

export default NormalHeader || WelcomeHeader;
