import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';
import { withRouter } from 'react-router';
import { Menu, Dropdown } from 'antd';
import styles from './styles.module.css';
import classnames from 'classnames';
import mockAvatar from 'components/Layout/Sider/mr-one-copy.svg';
import notificationIcon from './notification.svg';
import loginIcon from './login.svg';
import projectActiveIcon from './project-d1.svg';
import problemIcon from './icon_business_problem_d.svg';
import problemActiveIcon from './icon_business_problem_a.svg';
import dataIcon from './icon_data_d.svg';
import dataActiveIcon from './icon_data_prograss_a.svg';
import modelingIcon from './icon_modeling_d.svg';
import modelingActiveIcon from './icon_modeling_a.svg';
import down from './combined-shape-copy.svg';
// import more from './btn-more-option.svg';

const imgs = {
  problem: <img src={problemIcon} alt="problem" />,
  data: <img src={dataIcon} alt="data" />,
  modeling: <img src={modelingIcon} alt="modeling" />,
  projectActive: <img src={projectActiveIcon} alt="project" />,
  problemActive: <img src={problemActiveIcon} alt="problem" />,
  dataActive: <img src={dataActiveIcon} alt="data" />,
  modelingActive: <img src={modelingActiveIcon} alt="modeling" />
};

const step = ['project', 'problem', 'data', 'modeling'];

@inject('deploymentStore', 'scheduleStore', 'routing')
@observer
class NormalHeader extends Component {
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
          <span className={styles.text}>Total Project</span>
        </div>
        <div className={classnames(styles.block, styles.enabled)}>
          <span className={styles.number}>{this.enabledProjectsCount}</span>
          <span className={styles.text}>Enabled</span>
        </div>
        <div className={classnames(styles.block, styles.disabled)}>
          <span className={styles.number}>
            {deploymentStore.deployments.length - this.enabledProjectsCount}
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
            {deploymentStore.deployments.length - this.normalProjectsCount}
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

@inject('userStore', 'projectStore', 'routing')
@observer
class ProjectHeader extends Component {
  logout = () => {
    this.props.routing.push('/');
    this.props.userStore.logout();
  };

  enter = index => {
    const { projectStore } = this.props;
    if (projectStore.conflict) return
    let maxStep = projectStore.project.mainStep;
    if (index > maxStep) return;
    const { nextMainStep, updateProject } = projectStore.project
    updateProject(nextMainStep(index));
  };

  render() {
    const { userStore, projectStore } = this.props;

    const { curStep, mainStep } = projectStore.project || {};
    return (
      <div className={styles.header}>
        <div className={styles.menu}>
          {step.map((v, k) => {
            let str = v.split('');
            let text = str.shift().toUpperCase() + str.join('');
            let line = '';
            if (k !== 0) {
              line = (
                <div className={styles.line}>
                  <span>-----------------------------------------------</span>
                </div>
              );
            }
            return (
              <div
                key={k}
                onClick={this.enter.bind(this, k)}
                className={classnames(styles.item, {
                  [styles.current]: curStep === k,
                  [styles.active]: mainStep >= k
                })}
              >
                <div className={styles.iconBlock}>
                  <div className={styles.icon}>
                    {imgs[v + (mainStep >= k ? 'Active' : '')]}
                  </div>
                  {line}
                  <div className={styles.iconText}>
                    <span>{text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.tools}>
          <div className={styles.notification}>
            <img src={notificationIcon} alt="notification" />
            <span>
              <span className={styles.num}>1</span> Notification
            </span>
            <div className={styles.pot} />
          </div>
          <div className={styles.user}>
            <img src={mockAvatar} alt="avatar" className={styles.avatar} />
            <div className={styles.userBottom}>
              <span className={styles.name}>{userStore.info.email}</span>
              <div className={styles.down} onClick={this.logout}>
                <img src={down} alt="down" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

@inject('userStore', 'routing')
@observer
class WelcomeHeader extends Component {
  logout = () => {
    this.props.routing.push('/');
    this.props.userStore.logout();
  };

  render() {
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a onClick={this.logout}>Log out</a>
        </Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.header}>
        <div className={styles.wheader}>
          <img src={mockAvatar} alt="avatar" className={styles.wavatar} />
          <span className={styles.welcome}>
            Welcome , {this.props.userStore.info.email}
          </span>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
            <div className={styles.down}>
              <img src={down} alt="down" />
            </div>
          </Dropdown>
        </div>
        <div className={styles.notification}>
          <img src={notificationIcon} alt="notification" />
          <span>
            <span className={styles.num}>1</span> Notification
          </span>
          <div className={styles.pot} />
        </div>
      </div>
    );
  }
}

const LoginHeader = props => (
  <div className={styles.header}>
    <div className={styles.wheader}>
      <span className={styles.welcome}>Welcome to R2.ai</span>
    </div>
    <div
      className={styles.auth}
      onClick={() =>
        props.pathname === '/'
          ? props.routing.push('/signup')
          : props.routing.push('/')
      }
    >
      <div className={styles.loginIcon}>
        <img src={loginIcon} alt="login" />
      </div>
      <span>{props.pathname === '/' ? 'Sign Up' : 'Sign In'}</span>
    </div>
  </div>
);

@withRouter
@inject('userStore', 'routing')
@observer
export default class Header extends Component {
  render() {
    const isHome = this.props.history.location.pathname === '/';
    const isDeploy = this.props.history.location.pathname.startsWith('/deploy');
    const isLogin = this.props.userStore.status === 'login';

    if (!isLogin)
      return (
        <LoginHeader
          pathname={this.props.routing.location.pathname}
          routing={this.props.routing}
        />
      );
    if (isHome) return <WelcomeHeader />;
    if (isDeploy) return <NormalHeader />;
    return <ProjectHeader />;
  }
}
