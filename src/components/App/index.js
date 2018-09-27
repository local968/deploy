import React, { Component } from 'react';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router-dom';
import Layout from 'components/App/Layout';
import Sider from 'components/Layout/Sider';
import Header from 'components/Layout/Header';
import Stores from 'stores';
import styles from './styles.module.css';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingStore);
const stores = {
  ...Stores,
  routing: routingStore
};

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <Router history={history}>
          <div className={styles.app}>
            <Sider history={history} />
            <div className={styles.main}>
              <Header history={history} />
              <Layout history={history} />
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
