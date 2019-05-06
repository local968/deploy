import React, { Component } from "react";
import { Bread } from "components/Common";
import { Route, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { runInAction } from "mobx";
import classnames from "classnames";
import deploymentIcon from "./icon-tab-deployment.svg";
import operationIcon from "./icon-tab-operation.svg";
import performanceIcon from "./icon-tab-performance.svg";
import statusIcon from "./icon-tab-performance.svg";
import Deployment from "./Deployment";
import Operation from "./Operation";
import Performance from "./Performance";
import Status from "./Status";
import styles from "./styles.module.css";

import EN from '../../constant/en';
@inject("routing", "deploymentStore")
@observer
export default class Detail extends Component {
  render() {
    const { routing, match, location, deploymentStore } = this.props;
    runInAction(() => (deploymentStore.currentId = match.params.id));
    const cd = deploymentStore.currentDeployment || {};
    const isUnsupervised = ["Clustering", "Outlier"].includes(cd.modelType);
    return (
      <div className={styles.detail}>
        <Bread list={[EN.Home]} />
        <div className={styles.tabs}>
          <div
            className={classnames([styles.tab, styles.deployment], {
              [styles.active]: location.pathname.indexOf("deployment") >= 0
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
          <div
            className={classnames([styles.tab, styles.operation], {
              [styles.active]: location.pathname.indexOf("operation") >= 0
            })}
            onClick={() =>
              routing.push(`/deploy/project/${match.params.id}/operation`)
            }
          >
            <img className={styles.icon} src={operationIcon} alt="operation" />
            <span className={styles.text}>{EN.OperationMonitor}</span>
          </div>
          {!isUnsupervised && (
            <div
              className={classnames([styles.tab, styles.performance], {
                [styles.active]: location.pathname.indexOf("performance") >= 0
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
          )}

          {!isUnsupervised && (
            <div
              className={classnames([styles.tab, styles.status], {
                [styles.active]: location.pathname.indexOf("status") >= 0
              })}
              onClick={() =>
                routing.push(`/deploy/project/${match.params.id}/status`)
              }
            >
              <img className={styles.icon} src={statusIcon} alt="status" />
              <span className={styles.text}>{EN.PerformanceStatus}</span>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <Route
            path="/deploy/project/:id"
            exact
            render={() => (
              <Redirect to={`/deploy/project/${match.params.id}/deployment`} />
            )}
          />
          <Route path="/deploy/project/:id/deployment" component={(props) => <Deployment {...Deployment} />} />
          <Route path="/deploy/project/:id/operation" component={(props) => <Operation {...Deployment} />} />
          {!isUnsupervised && (<Route path="/deploy/project/:id/performance" component={(props) => <Performance {...Deployment} />} />)}
          {!isUnsupervised && (<Route path="/deploy/project/:id/status" component={(props) => <Status {...Deployment} />} />)}
        </div>
        {/* <div className={styles.enableWrap}>
          <span className={styles.enableText}>Enable</span>
          <span className={styles.enable}>
            <Switch
              checked={cd.enable}
              onChange={() => {
                deploymentStore.toggleEnable(cd.id);
              }}
            />
          </span>
          <span className={styles.enableText}>{cd.enable ? 'On' : 'Off'}</span>
        </div> */}
      </div>
    );
  }
}
