import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Menu, Dropdown, Icon } from 'antd';
import styles from './styles.module.css';
import mockAvatar from 'components/Layout/Sider/mr-one-copy.svg';
import notificationIcon from './notification.svg';
import down from './combined-shape-copy.svg';
import EN from '../../../constant/en';
import { UserStore } from 'stores/UserStore';
import { RouterStore } from 'mobx-react-router';

interface WelcomeHeaderProps {
  userStore?: UserStore,
  routing?: RouterStore
}

@inject('userStore', 'routing')
@observer
class WelcomeHeader extends Component<WelcomeHeaderProps> {
  logout = () => {
    this.props.routing.push('/');
    this.props.userStore.logout();
  };

  changepassword = () => {
    this.props.routing.push('/changepassword')
  };

  render() {
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
    const {from} = this.props.userStore.info as any;

    return (
      <div className={styles.header}>
        <div className={styles.wheader}>
          <img src={mockAvatar} alt="avatar" className={styles.wavatar} />
          <span className={styles.welcome}>
            {EN.Welcome}, {this.props.userStore.info.email.split('@')[0]}
          </span>
         {!from&&<Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
            <div className={styles.down}>
              <img src={down} alt="down" />
            </div>
          </Dropdown>}
        </div>
        <div className={styles.notification}>
          <img src={notificationIcon} alt="notification" />
          <span>
            <span className={styles.num}>1</span> {EN.Notification}
          </span>
          <div className={styles.pot} />
        </div>
      </div>
    );
  }
}

export default WelcomeHeader
