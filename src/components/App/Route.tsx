import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Detail from 'components/Detail';
import Deploy from 'components/Deploy';
import Main from 'components/Main/index';
import Home from 'components/Home';
import Test from 'components/Test';
import ChangePassword from 'components/User/ChangePassword';
import Support from 'components/Support';

export default function Router(){
  return  <Switch>
    <Route exact path="/" component={(props) => <Home {...props} />} />
    <Route exact path="/deploy" component={(props) => <Deploy {...props} />} />
    <Route exact path="/test" component={(props) => <Test {...props} />} />
    <Route path="/project/:pid" component={(props) => <Main {...props} />} />
    <Route path="/deploy/project/:id" component={(props) => <Detail {...props} />} />
    <Route exact path="/changepassword" component={(props) => <ChangePassword {...props} />} />
    <Route exact path="/support" component={(props) => <Support {...props} />} />
    <Redirect to="/" />
  </Switch>
}
