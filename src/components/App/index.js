import React, {Component} from 'react';
import createBrowserHistory from 'history/createBrowserHistory';
import {Provider} from 'mobx-react';
import {RouterStore, syncHistoryWithStore} from 'mobx-react-router';
import {Router} from 'react-router-dom';
import Layout from 'components/App/Layout';
import Sider from 'components/Layout/Sider';
import Header from 'components/Layout/Header';
import Community from 'components/Community';
import Stores from 'stores';
import styles from './styles.module.css';
import {Route, Redirect, Switch} from 'react-router-dom';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingStore);
const stores = {
  ...Stores,
  routing: routingStore
};

const Product = () => <div className={styles.main}>
  <Header/>
  <Layout/>
</div>;

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <Router history={history}>
          <div className={styles.app}>
            <Sider/>
            <Switch>
              <Route exact path="/community" component={Community}/>
              <Route component={() => <Product/>}/>
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
