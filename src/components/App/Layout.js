<<<<<<< HEAD
import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from 'react-router';
import Route, {LoginRouter} from 'components/App/Route';
import styles from './styles.module.css';
import {Spin} from 'antd';

@withRouter
@inject('userStore')
@observer
export default class Layout extends Component { 
    render() {
        const {hasToken, isInit} = this.props.userStore;
        return <div className={styles.route}>
            {isInit && <Mask />}
            {hasToken?<Route />:<LoginRouter />}
        </div>
    }
}

class Mask extends Component{
    render() {
        return <div className={styles.load}><Spin tip="Loading..." size="large"></Spin></div>
    }
}
=======
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
  // componentWillMount() {
  // if(!this.props.userStore.hasToken){
  //     this.props.history.push("/")
  // }
  // }

  render() {
    const { status } = this.props.userStore;
    return <div className={styles.route}>
      {status === 'init' && <Mask />}
      {status === 'login' ? <Route /> : <LoginRouter />}
    </div>
  }
}

class Mask extends Component {
  render() {
    return <div className={styles.load}><Spin tip="Loading..." size="large"></Spin></div>
  }
}
>>>>>>> next
