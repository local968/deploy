import React from 'react';
import { Route } from 'react-router-dom';
import styles from './styles.module.css';
import { Create, New, Replace, CreateBackground } from 'components/Create';
import Detail from 'components/Detail';
import Deploy from 'components/Deploy';
import Project from 'components/Project';
import Problem from 'components/Problem';
import Data from 'components/Data';
import Modeling from 'components/Modeling';
import Home from 'components/Home';
import pj from 'stores/ProjectStore';
import { autorun } from 'mobx';

const TestProblem = (props) => {

  autorun(() => {
    console.log(pj.project);
  })
  return <Problem {...props} />
}

// const { Create, New, Replace, CreateBackground } = require('components/Create');

export default () => (
  <div className={styles.route}>
    <Route exact path="/" component={Home} />
    <Route exact path="/deploy" component={Deploy} />
    <Route exact path="/test" component={() => 'test/test'} />
    <Route path="/project/:pid" component={Project} />
    <Route path="/problem/:pid" component={TestProblem} />
    <Route path="/data/:pid" component={Data} />
    <Route path="/modeling/:pid" component={Modeling} />
    <Route
      path="/deploy/create"
      render={() => (
        <React.Fragment>
          <CreateBackground />
          <Route exact path="/deploy/create/:id" component={Create} />
          <Route exact path="/deploy/create/:id/new" component={New} />
          <Route exact path="/deploy/create/:id/replace" component={Replace} />
        </React.Fragment>
      )}
    />
    <Route path="/deploy/project/:id" component={Detail} />
  </div>
);
