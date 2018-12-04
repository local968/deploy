import React, { Component } from 'react';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider, observer } from 'mobx-react';
import { observable } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router-dom';
import Layout from 'components/App/Layout';
import Sider from 'components/Layout/Sider';
import Header from 'components/Layout/Header';
import Community from 'components/Community';
import Support from 'components/Support';
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
  <Layout />
</div>;

@observer
class App extends Component {
  @observable hasError = false

  componentDidCatch(error, info) {
    this.hasError = true
    console.log(error, info)
  }

  render() {
    return (
      this.hasError ?
        <div className={styles.error}>some error</div> :
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
    );
  }
}

export default App;
