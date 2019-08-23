import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from 'react-router-dom';
import Route from 'components/App/Route';

import LoginRouter from 'components/App/LoginRoute';
import styles from './styles.module.css';
import { Spin } from 'antd';
import EN from '../../constant/en'
import { UserStore } from "stores/UserStore";
import { ProjectStore } from "stores/ProjectStore";

interface LayoutProps {
  userStore: UserStore,
  projectStore: ProjectStore
}

@inject('userStore', 'projectStore')
@observer
class Layout extends Component<LayoutProps> {
  constructor(props) {
    super(props)
  }

  render() {
    const { userStore, projectStore:{init,isOnline} } = this.props;
    const { status } = userStore;
    const useLoginRouter = status === 'unlogin';
    const showMask = status === 'unlogin' ? false : status !== 'unlogin' && !init;
    const text = isOnline ? EN.Loading : EN.Reconnecting;
    const style = isOnline ? null : { backgroundColor: 'rgba(255, 255, 255, 0.8)' };
    return <div className={styles.route}>
      {status !== 'init' && (useLoginRouter ? <LoginRouter /> : <Route />)}
      {showMask && <Mask text={text} style={style} />}
    </div>
  }
}

export default withRouter(Layout)

interface MaskProps {
  style: null | StringObject,
  text: string
}

class Mask extends Component<MaskProps> {
  render() {
    const { style, text } = this.props;
    return <div className={styles.load} style={style}><Spin tip={text} size="large"/></div>
  }
}
