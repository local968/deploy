import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { inject } from "mobx-react";
import Detail from 'components/Detail';
import Deploy from 'components/Deploy';
import Main from 'components/Main/index';
import Home from 'components/Home';
import Test from 'components/Test';
import ChangePassword from 'components/User/ChangePassword';
import Support from 'components/Support';

@inject('socketStore')
class defaultRouter extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={(props) => <Home {...props} />} />
        <Route exact path="/deploy" component={(props) => <Deploy {...props} />} />
        <Route exact path="/test" component={(props) => <Test {...props} />} />
        <Route path="/project/:pid" component={(props) => <Main {...props} />} />
        <Route path="/deploy/project/:id" component={(props) => <Detail {...props} />} />
        <Route exact path="/changepassword" component={(props) => <ChangePassword {...props} />} />
        <Route exact path="/support" component={(props) => <Support {...props} />} />
        <Redirect to="/" />
      </Switch>
    )
  }
}
{/* <Route exact path="/community" component={Community} /> */ }
export default defaultRouter
