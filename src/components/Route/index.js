import React from 'react';
import { Route } from 'react-router';

export default () => (
  <div>
    <Route exact path="/" component={() => 'test'} />
    <Route exact path="/test" component={() => 'test/test'} />
  </div>
);
