import React, { Component } from 'react';
import styles from './styles.module.css';
import logo from './rsquared_logo_color.svg';
import home from './icon-home.svg';
import help from './icon-help.svg';
import switchIcon from './switch.svg';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';

@withRouter
@inject('userStore', 'deployStore')
@observer
export default class Sider extends Component {
  render() {
    const { history, userStore } = this.props;
    const { userId } = userStore;
    const isDeploy = history.location.pathname.includes('deploy');
    return (
      <aside className={styles.sider}>
        <div className={styles.logo}>
          <img className={styles.logoImg} src={logo} alt="logo" />
          {/* <h2 className={styles.mrone}>Mr.one</h2> */}
        </div>
        <div className={styles.menus}>
          <a
            className={styles.home}
            onClick={() =>
              isDeploy && userId ? history.push('/deploy') : history.push('/')
            }
          >
            <img alt="home" src={home} />
            <h4 className={styles.nav}>Home</h4>
          </a>
          <a className={styles.support}>
            <img alt="support" src={help} />
            <h4 className={styles.nav}>Support</h4>
          </a>
        </div>
        <a className={styles.bottom} onClick={this.switchClick}>
          <img alt="switch" src={switchIcon} />
          {isDeploy || !userId ? (
            <h4 className={styles.nav}>
              Model<br />Training
            </h4>
          ) : (
            <h4 className={styles.nav}>
              Deployment<br />Console
            </h4>
          )}
        </a>
      </aside>
    );
  }

  switchClick = () => {
    const { location, deployStore, userStore, history } = this.props;
    const isDeploy = history.location.pathname.includes('deploy');
    const { userId } = userStore;
    if (location.pathname.indexOf('/deploy/project/') !== -1) {
      const deploymentId = location.pathname.split('/')[3];
      const projectId = deployStore.deployments.find(d => d.id === deploymentId)
        .projectId;
      history.push('/project/' + projectId);
      return;
    }

    isDeploy || !userId ? history.push('/') : history.push('/deploy');
  };
}
