import React, { Component } from 'react';
import { Bread,Show} from 'components/Common';
import { Route, Redirect, Switch } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { runInAction } from 'mobx';
import classnames from 'classnames';
import deploymentIcon from './icon-tab-deployment.svg';
import operationIcon from './icon-tab-operation.svg';
import performanceIcon from './icon-tab-performance.svg';
import statusIcon from './icon-tab-performance.svg';
import Deployment from './Deployment';
import Operation from './Operation';
import Performance from './Performance';
import Status from './Status';
import styles from './styles.module.css';
import EN from '../../constant/en';

interface Interface {
  routing:any
  match:any
  location:any
  deploymentStore:any
  userStore?:any
}

@inject('routing', 'deploymentStore','userStore')
@observer
export default class Detail extends Component<Interface> {
  render() {
    const { routing, match, location, deploymentStore,userStore:{info:{role:{deployment=true,performance=true}}} } = this.props;
    runInAction(() => (deploymentStore.currentId = match.params.id));
    const cd = deploymentStore.currentDeployment || {};
    const isUnsupervised = ['Clustering', 'Outlier'].includes(cd.modelType);

    return (
      <div className={styles.detail}>
        <Bread list={[EN.Home]} />
        <div className={styles.tabs}>
          {!isUnsupervised && (
            <div style={{ display: 'flex' }}>
              <Show
                name = 'deployment'
              >
                <div
                  className={classnames([styles.tab, styles.deployment], {
                    [styles.active]: location.pathname.indexOf('deployment') >= 0,
                  })}
                  onClick={() =>
                    routing.push(`/deploy/project/${match.params.id}/deployment`)
                  }
                >
                  <img
                    className={styles.icon}
                    src={deploymentIcon}
                    alt="deployment"
                  />
                  <span className={styles.text}>{EN.Deployments}</span>
                </div>
              </Show>

              <div
                className={classnames([styles.tab, styles.operation], {
                  [styles.active]: location.pathname.indexOf('operation') >= 0,
                })}
                onClick={() =>
                  routing.push(`/deploy/project/${match.params.id}/operation`)
                }
              >
                <img
                  className={styles.icon}
                  src={operationIcon}
                  alt="operation"
                />
                <span className={styles.text}>{EN.OperationMonitor}</span>
              </div>

              <Show
                name = 'performance'
              >
                <div
                  className={classnames([styles.tab, styles.performance], {
                    [styles.active]:
                    location.pathname.indexOf('performance') >= 0,
                  })}
                  onClick={() =>
                    routing.push(`/deploy/project/${match.params.id}/performance`)
                  }
                >
                  <img
                    className={styles.icon}
                    src={performanceIcon}
                    alt="performance"
                  />
                  <span className={styles.text}>{EN.PerformanceMonitor}</span>
                </div>
              </Show>
              <div
                className={classnames([styles.tab, styles.status], {
                  [styles.active]: location.pathname.indexOf('status') >= 0,
                })}
                onClick={() =>
                  routing.push(`/deploy/project/${match.params.id}/status`)
                }
              >
                <img className={styles.icon} src={statusIcon} alt="status" />
                <span className={styles.text}>{EN.PerformanceStatus}</span>
              </div>
            </div>
          )}

          {isUnsupervised && (
            <div style={{ display: 'flex' }}>
              <Show
                name = 'performance'
              >
                <div
                  className={classnames([styles.tab, styles.performance], {
                    [styles.active]:
                      location.pathname.indexOf('performance') >= 0,
                  })}
                  onClick={() =>
                    routing.push(`/deploy/project/${match.params.id}/performance`)
                  }
                >
                  <img
                    className={styles.icon}
                    src={performanceIcon}
                    alt="performance"
                  />
                  <span className={styles.text}>{EN.Deployment}</span>
                </div>
              </Show>
              <div
                className={classnames([styles.tab, styles.status], {
                  [styles.active]: location.pathname.indexOf('status') >= 0,
                })}
                onClick={() =>
                  routing.push(`/deploy/project/${match.params.id}/status`)
                }
              >
                <img className={styles.icon} src={statusIcon} alt="status" />
                <span className={styles.text}>{EN.PerformanceMonitors}</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <Switch>
            {!isUnsupervised && deployment && (
                <Route
                  path="/deploy/project/:id/deployment"
                  component={props => <Deployment {...props} />}
                />
            )}

            {!isUnsupervised && (
              <Route
                path="/deploy/project/:id/operation"
                component={props => <Operation {...props} />}
              />
            )}

            {performance&&<Route
              path="/deploy/project/:id/performance"
              component={props => <Performance {...props} />}
            />}
            <Route
              path="/deploy/project/:id/status"
              component={props => <Status {...props} />}
            />
            <Route
              render={() => (
                <Redirect
                  to={`/deploy/project/${match.params.id}/${
                    !isUnsupervised ? (deployment?'deployment':'operation') : (performance?'performance':"status")
                  }`}
                />
              )}
            />
          </Switch>
        </div>
      </div>
    );
  }
}
