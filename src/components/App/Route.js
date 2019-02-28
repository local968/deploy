import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import styles from './styles.module.css';
import { inject } from "mobx-react";
import { Background } from 'components/Common';
import Detail from 'components/Detail';
import Deploy from 'components/Deploy';
import Main from 'components/Main';
import Home from 'components/Home';
import SignIn from 'components/User/SignIn';
import SignUp from 'components/User/SignUp';
import SignActive from 'components/User/SignActive';
import ChangePassword from 'components/User/ChangePassword';
import ResetPassword from 'components/User/ResetPassword';
import ForgetPassword from 'components/User/ForgetPassword';
// import Community from 'components/Community';
import Support from 'components/Support';

@inject('socketStore')
class defaultRouter extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/deploy" component={Deploy} />
        <Route exact path="/test" component={() => 'test/test'} />
        <Route path="/project/:pid" component={Main} />
        <Route path="/deploy/project/:id" component={Detail} />
        <Route exact path="/changepassword" component={ChangePassword} />
        {/* <Route exact path="/community" component={Community} /> */}
        <Route exact path="/support" component={Support} />
        <Redirect to="/" />
      </Switch>
    )
  }
}

export default defaultRouter

export class LoginRouter extends Component {
  render() {
    return (
      <div className={styles.warp}>
        <Background />
        <div className={styles.content}>
          <Switch>
            <Route exact path="/" component={SignIn} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/active" component={SignActive} />
            <Route exact path="/resetpassword" component={ResetPassword} />
            <Route exact path="/forgetpassword" component={ForgetPassword} />
            {/* <Route exact path="/community" component={Community} /> */}
            <Route exact path="/support" component={Support} />
            <Redirect to="/" />
          </Switch>
        </div>
      </div>
    );
  }
}
