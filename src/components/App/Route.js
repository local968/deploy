import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { inject } from "mobx-react";
import Detail from 'components/Detail';
import Deploy from 'components/Deploy';
import Main from 'components/Main/index.tsx';
import Home from 'components/Home';
import ChangePassword from 'components/User/ChangePassword';
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
