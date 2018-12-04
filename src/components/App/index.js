import React, { Component } from 'react';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router-dom';
import Layout from 'components/App/Layout';
import Sider from 'components/Layout/Sider';
import Header from 'components/Layout/Header';
import Community from 'components/Community';
import Support from 'components/Support';
import ErrorBoundary from 'components/Common/ErrorBoundary';
import Stores from 'stores';
import styles from './styles.module.css';
import { Route, Switch } from 'react-router-dom';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingStore);
const stores = {
  ...Stores,
  routing: routingStore
};

const Product = () => <div className={styles.main}>
  <Header />
  <ErrorBoundary>
    <Layout />
  </ErrorBoundary>
</div>;

class App extends Component {
  render() {
    return (
      <ErrorBoundary>
        <Provider {...stores}>
          <Router history={history}>
            <div className={styles.app}>
              <Sider />
              <Switch>
                <Route exact path="/community" component={Community} />
                <Route exact path="/support" component={Support} />
                <Route component={() => <Product />} />
              </Switch>
            </div>
          </Router>
        </Provider>
      </ErrorBoundary>
    );
  }
}

export default App;
