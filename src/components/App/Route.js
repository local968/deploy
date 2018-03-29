import React from 'react';
import { Route } from 'react-router-dom';
import styles from './styles.module.css';
import { Create, New, Replace, CreateBackground } from 'components/Create';
import Detail from 'components/Detail';
import Home from 'components/Home';

// const { Create, New, Replace, CreateBackground } = require('components/Create');

export default () => (
  <div className={styles.route}>
    <Route exact path="/" component={Home} />
    <Route exact path="/test" component={() => 'test/test'} />
    <Route
      path="/create"
      render={() => (
        <React.Fragment>
          <CreateBackground />
          <Route exact path="/create" component={Create} />
          <Route exact path="/create/new" component={New} />
          <Route exact path="/create/replace" component={Replace} />
        </React.Fragment>
      )}
    />
    <Route path="/project/:id" component={Detail} />
  </div>
);
