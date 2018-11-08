import React, {Component} from 'react';
import styles from './styles.module.css';
// import {inject, observer} from 'mobx-react';
// import moment from 'moment';
// import {Bread, Select, Pagination, Switch, Search} from 'components/Common';
import {Menu, Dropdown, Icon} from 'antd';
import communityLanguage from './communityLanguage.png'

const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer"
         href="http://app14.newa-tech.com:54000?language=zh-CN">中文社区</a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer"
         href="http://app14.newa-tech.com:54000?language=en-US">community for english</a>
    </Menu.Item>
  </Menu>
);

export default class Community extends Component {

  render() {
    return (
      <div className={styles.content}>
        <div className={styles.header}>R2.ai Community - Your Intelligent Partner in AI</div>
        <div className={styles.label}>Use the same product login ID and password to access our AI community for</div>
        <div className={styles.funcs}>
          <div>Rich product resources</div>
          <div>In-depth case studies</div>
          <div>Quotes from experts</div>
          <div>Q&A with data scientists</div>
          <div>Reviews from users</div>
          <div>First to try our products</div>
        </div>
        <div className={styles.endLabel}>After product account expires, you can still use the account to acess our
          community to learn more!
        </div>

        <div className={styles.selectContent}>
          <img className={styles.imgs} src={communityLanguage} alt="communityImage"/>
          <Dropdown overlay={menu} placement="bottomCenter">
            <a className={`ant-dropdown-link ${styles.selectText}`}>
              Enter the community <Icon type="down"/>
            </a>
          </Dropdown>
        </div>
      </div>
    )
  }
}
