import React, {Component} from "react";
import { computed } from 'mobx';
import {observer, inject} from "mobx-react";
import {withRouter} from 'react-router';
import Route, {LoginRouter} from 'components/App/Route';
import styles from './styles.module.css';
import {Spin} from 'antd';
import Community from 'components/Community';

@withRouter
@inject('userStore', 'routing')
@observer
export default class Layout extends Component {
  @computed get community() {
    return this.props.routing.location.pathname.includes('community')
  }

  render() {
    const {routing, userStore} = this.props;
    const {status} = userStore;
    // const community = ;
    return <div className={styles.route}>
      {!this.community && status === 'init' && <Mask/>}
      {!this.community && status === 'unlogin' ? <LoginRouter/> : <Route/>}
      {this.community && <Community/>}
    </div>
  }
}

class Mask extends Component {
  render() {
    return <div className={styles.load}><Spin tip="Loading..." size="large"></Spin></div>
  }
}
