import React, { Component } from 'react';
import { Bread } from 'components/Common';
import { Route, Redirect } from 'react-router-dom';
import { inject } from 'mobx-react';
import classnames from 'classnames';
import deploymentIcon from './icon-tab-deployment.svg';
import operationIcon from './icon-tab-operation.svg';
import performanceIcon from './icon-tab-performance.svg';
import styles from './styles.module.css';

@inject('routing')
export default class Detail extends Component {
  render() {
    const { routing, match, location } = this.props;
    return (
      <div className={styles.detail}>
        <Bread list={['Home']} />
        <div className={styles.tabs}>
          <div
            className={classnames([styles.tab, styles.deployment], {
              [styles.active]: location.pathname.indexOf('deployment') >= 0
            })}
            onClick={() =>
              routing.push(`/project/${match.params.id}/deployment`)
            }
          >
            <img
              className={styles.icon}
              src={deploymentIcon}
              alt="deployment"
            />
            <span className={styles.text}>Deployment</span>
          </div>
          <div
            className={classnames([styles.tab, styles.operation], {
              [styles.active]: location.pathname.indexOf('operation') >= 0
            })}
            onClick={() =>
              routing.push(`/project/${match.params.id}/operation`)
            }
          >
            <img className={styles.icon} src={operationIcon} alt="operation" />
            <span className={styles.text}>Operation Monitor</span>
          </div>
          <div
            className={classnames([styles.tab, styles.performance], {
              [styles.active]: location.pathname.indexOf('performance') >= 0
            })}
            onClick={() =>
              routing.push(`/project/${match.params.id}/performance`)
            }
          >
            <img
              className={styles.icon}
              src={performanceIcon}
              alt="performance"
            />
            <span className={styles.text}>Performance Monitor</span>
          </div>
        </div>
        <div className={styles.content}>
          <Route
            path="/project/:id"
            exact
            render={() => (
              <Redirect to={`/project/${match.params.id}/deployment`} />
            )}
          />
          <Route path="/project/:id/deployment" render={() => 'deployment'} />
          <Route path="/project/:id/operation" render={() => 'operation'} />
          <Route path="/project/:id/performance" render={() => 'performance'} />
        </div>
      </div>
    );
  }
}
