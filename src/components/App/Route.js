import React from 'react';
import { Route } from 'react-router';
import styles from './styles.module.css';
import { Create, New, Replace, CreateBackground } from 'components/Create';

// const { Create, New, Replace, CreateBackground } = require('components/Create');

console.log(CreateBackground);

export default () => (
  <div className={styles.route}>
    <Route exact path="/" component={() => 'test'} />
    <Route exact path="/test" component={() => 'test/test'} />
    <Route
      path="/create"
      render={() => (
        <CreateBackground>
          <Route exact path="/create" component={Create} />
          <Route exact path="/create/new" component={New} />
          <Route exact path="/create/replace" component={Replace} />
        </CreateBackground>
      )}
    />
  </div>
);
