import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import styles from './styles.module.css';
import { Background } from 'components/Common';
import SignIn from 'components/User/SignIn';
import SignUp from 'components/User/SignUp';
import SignActive from 'components/User/SignActive';
import ResetPassword from 'components/User/ResetPassword';
import ForgetPassword from 'components/User/ForgetPassword';
// import Community from 'components/Community';
import Support from 'components/Support';

export default class LoginRouter extends Component {
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