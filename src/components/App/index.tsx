import React, { Component } from 'react';
import { createBrowserHistory, createHashHistory } from 'history';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router-dom';
import Layout from 'components/App/Layout';
import Sider from 'components/Layout/Sider';
import Header from 'components/Layout/Header';
import Report from 'components/Report'
import ErrorBoundary from 'components/Common/ErrorBoundary';
import Stores from 'stores';
import styles from './styles.module.css';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import config from 'config'

const {isEN} = config;
const r2Report = (window as any).r2Report;
const browserHistory = r2Report ? createHashHistory() : createBrowserHistory();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingStore);
const stores = {
  ...Stores,
  routing: routingStore
};

class App extends Component {

  render() {
    return (
      <ErrorBoundary>
        {
          isEN ?
            <ConfigProvider >
              <Provider {...stores}>
                {r2Report ? <Report /> : <Router history={history}>
                  <div className={styles.app}>
                    <Sider />
                    <div className={styles.main}>
                      <Header />
                      <ErrorBoundary>
                        <Layout />
                      </ErrorBoundary>
                      {/*<Test/>*/}
                    </div>
                  </div>
                </Router>}
              </Provider>
            </ConfigProvider> :
            <ConfigProvider locale={zh_CN}>
              <Provider {...stores}>
                {r2Report ? <Report /> : <Router history={history}>
                  <div className={styles.app}>
                    <Sider />
                    <div className={styles.main}>
                      <Header />
                      <ErrorBoundary>
                        <Layout />
                      </ErrorBoundary>
                    </div>
                  </div>
                </Router>}
              </Provider>
            </ConfigProvider>
        }

      </ErrorBoundary>
    );
  }
}

export default App;
