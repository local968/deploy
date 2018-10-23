import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from 'react-router';
import Route, { LoginRouter } from 'components/App/Route';
import styles from './styles.module.css';
import { Spin } from 'antd';

@withRouter
@inject('userStore')
@observer
export default class Layout extends Component {

  render() {
    const { userStore } = this.props;
    const { status } = userStore;
    // const community = ;
    return <div className={styles.route}>
      {status === 'init' && <Mask />}
      {status === 'unlogin' ? <LoginRouter /> : <Route />}
    </div>
  }
}

class Mask extends Component {
  render() {
    return <div className={styles.load}><Spin tip="Loading..." size="large"></Spin></div>
  }
}
