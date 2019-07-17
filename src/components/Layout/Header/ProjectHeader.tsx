import React, { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { Menu, Dropdown, Icon } from 'antd';
import styles from './styles.module.css';
import classnames from 'classnames';
import mockAvatar from 'components/Layout/Sider/mr-one-copy.svg';
import notificationIcon from './notification.svg';
import projectActiveIcon from './project-d1.svg';
import problemIcon from './icon_business_problem_d.svg';
import problemActiveIcon from './icon_business_problem_a.svg';
import dataIcon from './icon_data_d.svg';
import dataActiveIcon from './icon_data_prograss_a.svg';
import modelingIcon from './icon_modeling_d.svg';
import modelingActiveIcon from './icon_modeling_a.svg';
import down from './combined-shape-copy.svg';
// import more from './btn-more-option.svg';
import EN from '../../../constant/en';
import { UserStore } from 'stores/UserStore';
import { ProjectStore } from 'stores/ProjectStore';
import { RouterStore } from 'mobx-react-router';
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

interface ProjectHeaderProps {
  userStore?: UserStore,
  projectStore?: ProjectStore,
  routing?: RouterStore
}

@inject('userStore', 'projectStore', 'routing')
@observer
class ProjectHeader extends Component<ProjectHeaderProps> {
  logout = () => {
    this.props.routing.push('/');
    this.props.userStore.logout();
  };

  changepassword = () => {
    this.props.routing.push('/changepassword')
  }

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
    const menu = (
      <Menu className={styles.logout}>
        <Menu.Item key="0">
          <a onClick={this.changepassword}><Icon type='unlock' />{EN.ChangePassword}</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a onClick={this.logout}><Icon type='logout' />{EN.LogOut}</a>
        </Menu.Item>
      </Menu>
    );
    if (!projectStore.project) return null
    const { curStep, mainStep } = projectStore.project;
    return (
      <div className={styles.header}>
        <div className={styles.menu}>
          {step.map((v, k) => {
            let str = v.split('');
            let text = str.shift().toUpperCase() + str.join('');
            const Problem = EN.Problem;
            const Project = EN.Project;
            const Data = EN.Data;
            const Modeling = EN.Modeling;
            const zd = {
              Problem,
              Project,
              Data,
              Modeling,
            };
            text = zd[text];
            let line: string | ReactElement = '';
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
              <span className={styles.num}>1</span> {EN.Notification}
            </span>
            <div className={styles.pot} />
          </div>
          <div className={styles.user}>
            <img src={mockAvatar} alt="avatar" className={styles.avatar} />
            <div className={styles.userBottom}>
              <span className={styles.name}>{userStore.info.email}</span>
              <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
                <div className={styles.down}>
                  <img src={down} alt="down" />
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectHeader