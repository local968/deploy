import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import styles from './styles.module.css';
import { Background } from 'components/Common';
import Detail from 'components/Detail';
import Deploy from 'components/Deploy';
import Main from 'components/Main';
// import Problem from 'components/Problem';
// import Data from 'components/Data';
// import Modeling from 'components/Modeling';
import Home from 'components/Home';
import SignIn from 'components/SignIn';
import SignUp from 'components/SignUp';

// const { Create, New, Replace, CreateBackground } = require('components/Create');

export default () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/deploy" component={Deploy} />
    <Route exact path="/test" component={() => 'test/test'} />
    <Route path="/project/:pid" component={Main} />
    <Route path="/deploy/project/:id" component={Detail} />
    <Route path="" render={() => <Redirect to="/" />} />
  </Switch>
);

export class LoginRouter extends Component {
  render() {
    return (
      <div className={styles.warp}>
        <Background />
        <Switch>
          <Route exact path="/" component={SignIn} />
          <Route exact path="/signup" component={SignUp} />
          <Route path="" render={() => <Redirect to="/" />} />
        </Switch>
      </div>
    );
  }
}
