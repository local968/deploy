import React, {Component} from 'react';
import styles from './styles.module.css';
import logo from './rsquared_logo_color.svg';
import home from './icon-home.svg';
import help from './icon-help.svg';
import community from './community.png'
import switchIcon from './switch.svg';
import {inject, observer} from 'mobx-react';
import {withRouter} from 'react-router';

@withRouter
@inject('userStore', 'deploymentStore', 'routing')
@observer
export default class Sider extends Component {
  render() {
    const {userStore, routing} = this.props;
    const isLogin = userStore.status === 'login';
    const isDeploy = routing.location.pathname.includes('deploy');
    return (
      <aside className={styles.sider}>
        <div className={styles.logo}>
          <img className={styles.logoImg} src={logo} alt="logo"/>
          {/* <h2 className={styles.mrone}>R2 Learn</h2> */}
        </div>
        <div className={styles.menus}>
          <a
            className={styles.home}
            onClick={() =>
              isDeploy && isLogin ? routing.push('/deploy') : routing.push('/')
            }
          >
            <img alt="home" src={home}/>
            <h4 className={styles.nav}>Home</h4>
          </a>
          <a className={styles.support}>
            <img alt="support" src={help}/>
            <h4 className={styles.nav}>Support</h4>
          </a>
          <a className={styles.support} onClick={() => routing.push('/community')}>
            <img alt="support" src={community} className={styles.community}/>
            <h4 className={styles.nav}>Community</h4>
          </a>
        </div>
        <a className={styles.bottom} onClick={this.switchClick}>
          <img alt="switch" src={switchIcon}/>
          {isDeploy || !isLogin ? (
            <h4 className={styles.nav}>
              Model<br/>Training
            </h4>
          ) : (
            <h4 className={styles.nav}>
              Deployment<br/>Console
            </h4>
          )}
        </a>
      </aside>
    );
  }

  switchClick = () => {
    const {location, deploymentStore, userStore, routing} = this.props;
    const isDeploy = routing.location.pathname.includes('deploy');
    const userId = userStore.info.id;
    if (location.pathname.indexOf('/deploy/project/') !== -1) {
      const deploymentId = location.pathname.split('/')[3];
      const projectId = deploymentStore.deployments.find(d => d.id === parseInt(deploymentId, 10)).projectId;
      routing.push('/project/' + projectId);
      return;
    }

    isDeploy || !userId ? routing.push('/') : routing.push('/deploy');
  };
}
