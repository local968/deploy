import React, { Component } from 'react';
import styles from './api.module.css';
import { observer } from 'mobx-react';
import { observable, action, computed } from 'mobx';
import EN from '../../../constant/en';
function csv2array(csv) {
  const headers = csv.substring(0, csv.indexOf('\n')).split(',')
  const datas = csv.split('\n').slice(1).map(line => line.split(','))
  return datas.map(line => line.reduce((prev, curr, index) => {
    if (curr && curr.length > 0) prev[headers[index]] = curr
    return prev
  }, {}))
}

@observer
export default class extends Component {
  @observable token = false
  @observable csvData = ''

  @computed
  get jsonData() {
    let result
    try {
      result = JSON.stringify(csv2array(this.csvData))
    } catch (e) { }
    return result
  }

  showToken = action(async () => this.token = await this.props.deployment.getDeploymentToken())
  onDataChange = action((e) => this.csvData = e.target.value)
  render() {
    const { deployment } = this.props
    return (
      <div className={styles.row}>
        {/* <span className={styles.holder} /> */}
        <div className={styles.apiInstruction}>
          <div className={styles.mdStyle}>
            <h1>{EN.Introduction}</h1>
            <p>{EN.WhatDoesOurAPIDo}</p>
            <p>{EN.WhatDoesOurAPIDoAnswer}</p>
            <h1>{EN.Request}</h1>
            <ul><li>URL: /api/deploy</li><li>HTTP Method: POST (x-www-form-urlencoded)</li><li>Data parameters:<ol><li>deploymentId</li><li>token</li><li>data(JSON string)</li></ol></li></ul>
            <p>{EN.DeploymentpagewillprovidedeploymentIdandtokenparameter}</p>
            <h1>{EN.Response}</h1>
            <h2>{EN.Parameters}:</h2>
            <ol><li>{EN.predictresult}</li><li>{EN.errorcodeifsuccess}</li><li>{EN.humenreadableinformation}</li><li>{EN.originalerrorinformation}</li></ol>
            <h2>{EN.ResponseSample}:</h2>
            <code>
              {'{'}
              &quot; result&quot;:[
                {'{'}
              &quot; age&quot;:&quot;300.0&quot;,
              &quot;job&quot;:&quot;unemployed&quot;,
              &quot;marital&quot;:&quot;married&quot;,
              &quot;education&quot;:&quot;primary&quot;,
              &quot;default&quot;:&quot;no&quot;,
              &quot;balance&quot;:&quot;1787&quot;,
              &quot;housing&quot;:&quot;no&quot;,
              &quot;loan&quot;:&quot;no&quot;,
              &quot;contact&quot;:&quot;cellular&quot;,
              &quot;day&quot;:&quot;19&quot;,
              &quot;month&quot;:&quot;oct&quot;,
              &quot;duration&quot;:&quot;79&quot;,
              &quot;campaign&quot;:&quot;1&quot;,
              &quot;pdays&quot;:&quot;100&quot;,
              &quot;previous&quot;:&quot;3&quot;,
              &quot;poutcome&quot;:&quot;unknown&quot;,
              &quot;y&quot;:&quot;no&quot;,
              &quot;ypredict&quot;:&quot;0&quot;,
              &quot;yprobability_1&quot;:&quot;0.013476189619787587&quot;
                },
              ],
            &quot;code&quot;:10000,
            &quot;message&quot;:&quot;ok&quot;
          }
            </code>
            <br /><br /><br />
            <h1>{EN.Authentication}</h1>
            <p>{EN.DeploymentAuthentication}</p>
            <h1>{EN.ErrorCodes}</h1>
            <ul><li>10001: &#39;{EN.DeploymentNotFound}&#39;,</li><li>10002: &#39;{EN.DataNotFound}&#39;,</li><li>10003: &#39;{EN.TokenNotFound}&#39;,</li><li>10004: &#39;{EN.dataisnotavalidJSONstring}&#39;,</li><li>10005: &#39;{EN.dataisemptyor}&#39;,</li><li>10006: &#39;{EN.fileuploaderror}&#39;,</li><li>10007: &#39;{EN.fileuploaFrror}&#39;,</li><li>10008: &#39;{EN.predicterror}&#39;,</li><li>10009: &#39;{EN.predictf}&#39;,</li><li>10010: &#39;{EN.invalidtoken}&#39;,</li><li>10011: &#39;{EN.exceedpredictionusageimit}&#39;,</li><li>10012: &#39;{EN.exceedpredictionapiimit}&#39;,</li><li>10013: &#39;{EN.downloadpredictesultfailed}&#39;,</li><li>10014: &#39;{EN.predictresultisempty}&#39;</li></ul>
            <h1>{EN.RateLimit}</h1>
            <p>{EN.DeploymentRateLimit}</p>
          </div>
          <div className={styles.block}>
            <span className={styles.title}>{EN.Parameters}:</span>
            <div className={styles.parameter}>
              <span className={styles.label}>{EN.DeploymentId}:</span>
              <span className={styles.value}>{deployment.id}</span>
            </div>
            <div className={styles.parameter}>
              <span className={styles.label}>{EN.Token}:</span>
              {this.token ? <span className={styles.value}>{this.token}</span> : <a className={styles.showToken} onClick={this.showToken}>{EN.Showtoken}</a>}
            </div>
          </div>
          <div className={styles.block}>
            <span className={styles.title}>{EN.CURLSample}:</span>
            <textarea className={styles.dataText} cols='60' rows='10' placeholder={EN.Yourcsvdata} value={this.csvData} onChange={this.onDataChange} />
            <p className={styles.sampleContent}>curl -X POST --data "token={this.token || '*YOUR DEPLOYMENT TOKEN*'}&deploymentId={deployment.id}&data={this.jsonData && this.jsonData.length > 2 ? this.jsonData.replace(/"/g, '\\"') : '*YOUR JSON FORMAT DATA*'}" {window.location.origin}/api/deploy</p>
          </div>
        </div>
      </div>
    )
  }
}

