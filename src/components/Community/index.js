import React, {Component} from 'react';
import styles from './styles.module.css';
// import {inject, observer} from 'mobx-react';
// import moment from 'moment';
// import {Bread, Select, Pagination, Switch, Search} from 'components/Common';
import {Menu, Dropdown, Icon} from 'antd';
import communityLanguage from './communityLanguage.png'
import EN from '../../constant/en';

const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer"
         href="//localhost:3000?language=zh-CN">中文社区</a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer"
         href="//localhost:3000?language=en-US">community for english</a>
    </Menu.Item>
  </Menu>
);

export default class Community extends Component {

  render() {
    return (
      <div className={styles.content}>
        <div className={styles.header}>{EN.CommunityR2aiCommunity}</div>
        <div className={styles.label}>{EN.CommunityUsethesame}</div>
        <div className={styles.funcs}>
          <div>{EN.CommunityRich}/div>
            <div>{EN.CommunityIndept}</div>
            <div>{EN.CommunityQuotes}</div>
            <div>{EN.Communityscientists}</div>
            <div>{EN.CommunityReviews}</div>
            <div>{EN.CommunityFirst}</div>
          </div>
          <div className={styles.endLabel}>{EN.CommunityAfter}
          </div>

        <div className={styles.selectContent}>
          <img className={styles.imgs} src={communityLanguage} alt="communityImage"/>
          <Dropdown overlay={menu} placement="bottomCenter">
            <a className={`ant-dropdown-link ${styles.selectText}`}>
              {EN.CommunityEnter}<Icon type="down"/>
            </a>
          </Dropdown>
        </div>
      </div>
      </div>
    )
  }
}
