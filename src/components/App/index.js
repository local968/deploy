import React, { Component } from 'react';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import Route from 'components/App/Route';
import Stores from 'stores';

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
          <Route />
        </Router>
      </Provider>
    );
  }
}

export default App;
