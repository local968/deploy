import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from 'react-router';
import Route, { LoginRouter } from 'components/App/Route';
import styles from './styles.module.css';
import { Spin } from 'antd';

@withRouter
@inject('userStore', 'projectStore')
@observer
export default class Layout extends Component {
  render() {
    const { userStore, projectStore } = this.props;
    const { status } = userStore;
    const { init, isOnline } = projectStore
    const useLoginRouter = status === 'unlogin'
    const showMask = status === 'unlogin' ? false : status !== 'unlogin' && !init
    const text = isOnline ? 'Loading...' : 'reconnecting...'
    const style = isOnline ? null : { backgroundColor: 'rgba(255, 255, 255, 0.8)' }
    // const community = ;
    return <div className={styles.route}>
      {useLoginRouter ? <LoginRouter /> : <Route />}
      {showMask && <Mask text={text} style={style} />}
    </div>
  }
}

class Mask extends Component {
  render() {
    const { style, text } = this.props
    return <div className={styles.load} style={style}><Spin tip={text} size="large"></Spin></div>
  }
}
