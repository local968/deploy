import React, {Component} from 'react';
import {createBrowserHistory, createHashHistory} from 'history';
import {Provider} from 'mobx-react';
import {RouterStore, syncHistoryWithStore} from 'mobx-react-router';
import {Router} from 'react-router-dom';
import Layout from 'components/App/Layout';
import Sider from 'components/Layout/Sider';
import Header from 'components/Layout/Header';
import Report from 'components/Report'
import Test from 'components/Test';
import ErrorBoundary from 'components/Common/ErrorBoundary';
import Stores from 'stores';
import styles from './styles.module.css';
import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import config from 'config'

const isEN = config.isEN;
const browserHistory = window.r2Report ? createHashHistory() : createBrowserHistory();
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
            <LocaleProvider >
              <Provider {...stores}>
                {window.r2Report ? <Report/> : <Router history={history}>
                  <div className={styles.app}>
                    <Sider/>
                    <div className={styles.main}>
                      <Header/>
                      <ErrorBoundary>
                        <Layout/>
                      </ErrorBoundary>
                      <Test/>
                    </div>
                  </div>
                </Router>}
              </Provider>
            </LocaleProvider> :
            <LocaleProvider locale={zh_CN}>
              <Provider {...stores}>
                {window.r2Report ? <Report/> : <Router history={history}>
                  <div className={styles.app}>
                    <Sider/>
                    <div className={styles.main}>
                      <Header/>
                      <ErrorBoundary>
                        <Layout/>
                      </ErrorBoundary>
                      <Test/>
                    </div>
                  </div>
                </Router>}
              </Provider>
            </LocaleProvider>
        }

      </ErrorBoundary>
    );
  }
}

export default App;
