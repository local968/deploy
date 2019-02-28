import React, { Component } from 'react';
import styles from './api.module.css';
import { observer } from 'mobx-react';
import { observable, action, computed } from 'mobx';

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
            <h1>Introduction</h1>
            <p>What does our API do?</p>
            <p>The API serves as an http interface of pre-trained models for user to make predictions. After models are successfully trained, user can consider these model as APIs and make predictions by calling them.   </p>
            <h1>Request</h1>
            <ul><li>URL: /api/deploy</li><li>HTTP Method: POST (x-www-form-urlencoded)</li><li>Data parameters:<ol><li>deploymentId</li><li>token</li><li>data(JSON string)</li></ol></li></ul>
            <p>Deployment page will provide <code>deploymentId</code> and <code>token</code> parameter</p>
            <h1>Response</h1>
            <h2>Parameters:</h2>
            <ol><li>result: predict result</li><li>code: error code, 10000 if success</li><li>message: humen readable information</li><li>error: original error information, this field only exist if some error appear</li></ol>
            <h2>Response Sample:</h2>
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
            <h1>Authentication</h1>
            <p>For each API call, we use an auto-generated token for the authentication. For each deployment of each project a unique token is generated. After an API call using the token corresponding usage will be counted .</p>
            <h1>Error Codes</h1>
            <ul><li>10001: &#39;deployment not found&#39;,</li><li>10002: &#39;data not found&#39;,</li><li>10003: &#39;token not found&#39;,</li><li>10004: &#39;data is not a valid JSON string&#39;,</li><li>10005: &#39;data is empty or not a valid array&#39;,</li><li>10006: &#39;file upload error&#39;,</li><li>10007: &#39;file upload failed&#39;,</li><li>10008: &#39;predict error&#39;,</li><li>10009: &#39;predict failed&#39;,</li><li>10010: &#39;invalid token&#39;,</li><li>10011: &#39;exceed prediction usage limit&#39;,</li><li>10012: &#39;exceed prediction api limit&#39;,</li><li>10013: &#39;download predict result failed&#39;,</li><li>10014: &#39;predict result is empty&#39;</li></ul>
            <h1>Rate limit</h1>
            <p>As different limitations are applied to accounts of different levels, when the number/concurency of API calls of user has reached the max allowed amount, subsequent requests will be placed into a request queue as a waiting list. A time-out may be caused if this queue is too long.</p>
          </div>
          <div className={styles.block}>
            <span className={styles.title}>Parameters:</span>
            <div className={styles.parameter}>
              <span className={styles.label}>deploymentId:</span>
              <span className={styles.value}>{deployment.id}</span>
            </div>
            <div className={styles.parameter}>
              <span className={styles.label}>token:</span>
              {this.token ? <span className={styles.value}>{this.token}</span> : <a className={styles.showToken} onClick={this.showToken}>show token</a>}
            </div>
          </div>
          <div className={styles.block}>
            <span className={styles.title}>cURL Sample:</span>
            <textarea className={styles.dataText} cols='60' rows='10' placeholder='Your csv data' value={this.csvData} onChange={this.onDataChange} />
            <p className={styles.sampleContent}>curl -X POST --data "token={this.token || '*YOUR DEPLOYMENT TOKEN*'}&deploymentId={deployment.id}&data={this.jsonData && this.jsonData.length > 2 ? this.jsonData.replace(/"/g, '\\"') : '*YOUT JSON FORMAT DATA*'}" {window.location.origin}/api/deploy</p>
          </div>
        </div>
      </div>
    )
  }
}

