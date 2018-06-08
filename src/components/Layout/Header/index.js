import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';
import styles from './styles.module.css';
import classnames from 'classnames';
import mockAvatar from 'components/Layout/Sider/mr-one-copy.svg';
import notificationIcon from './notification.svg';
// import down from './combined-shape-copy.svg';
// import more from './btn-more-option.svg';

@inject('deployStore')
@observer
class NormalHeader extends Component {
  @computed
  get enabledProjectsCount() {
    return this.props.deployStore.deployments.filter(
      _d => _d.deploymentOptions && _d.deploymentOptions.enable
    ).length;
  }

  @computed
  get normalProjectsCount() {
    return this.props.deployStore.deployments.filter(_d => !_d.issue).length;
  }

  render() {
    const { deployStore } = this.props;
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

class ProjectHeader extends Component {
  render() {
    return <div className={styles.header}>
      <div className={styles.menu}>
        <div className={classnames(styles.item,styles.active)}>
          <div>
            1
          </div>
        </div>
        <div className={styles.item}>
          <div>
            1
          </div>
        </div>
        <div className={styles.item}>
          <div>
            1
          </div>
        </div>
        <div className={styles.item}>
          <div>
            1
          </div>
        </div>
      </div>
      <div className={styles.tools}>
        <div>2</div>
        <div>2</div>
      </div>
    </div>
  }
}

class WelcomeHeader extends Component{
  render() {
    return <div className={styles.header}>
      <div className={styles.wheader}>
        <img src={mockAvatar} alt="avatar" className={styles.wavatar} />
        <span className={styles.welcome}>Welcome!</span>
        {/* <img className={styles.more} src={more} alt="more" /> */}
      </div>
      <div className={styles.notification}>
        <img src={notificationIcon} alt="notification"/>
        <span>
          <span className={styles.num}>1</span> Notification
        </span>
        <div className={styles.pot}></div>
      </div>
    </div>
  }
}

export default class Header extends Component {

  render() {
    const isHome = this.props.history.location.pathname === "/" || false;
    const isDeploy = this.props.history.location.pathname.startsWith("/deploy");
    return (isHome && <WelcomeHeader />) || (isDeploy && <NormalHeader />) || <ProjectHeader />;
  }
} 
