import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import styles from './styles.module.css';
import { Background } from 'components/Common';
import SignIn from 'components/User/SignIn';
import SignUp from 'components/User/SignUp';
import SignActive from 'components/User/SignActive';
import ResetPassword from 'components/User/ResetPassword';
import ForgetPassword from 'components/User/ForgetPassword';
import Support from 'components/Support';
import config from 'config'

export default class LoginRouter extends Component {
  render() {
    return (
      <div className={styles.warp}>
        <Background />
        <div className={styles.content}>
          <Switch>
            <Route exact path="/" component={(props) => <SignIn {...props} />} />
            {config.register && <Route exact path="/signup" component={(props) => <SignUp {...props} />} />}
            <Route exact path="/active" component={(props) => <SignActive {...props} />} />
            <Route exact path="/resetpassword" component={(props) => <ResetPassword {...props} />} />
            <Route exact path="/forgetpassword" component={(props) => <ForgetPassword {...props} />} />
            <Route exact path="/support" component={(props) => <Support {...props} />} />
            <Redirect to="/" />
          </Switch>
        </div>
      </div>
    );
  }
}
