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

  constructor(props) {
    super(props)
  }
  showToken = action(async () => this.token = await this.props.deployment.getDeploymentToken())
  onDataChange = action((e) => this.csvData = e.target.value)
  render() {
    const { deployment } = this.props
    return (
      <div className={styles.row}>
        {/* <span className={styles.holder} /> */}
        <div className={styles.apiInstruction}>
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
            <p className={styles.sampleContent}>curl -X POST --data "token={this.token || '*YOUR DEPLOYMENT TOKEN*'}&deploymentId={deployment.id}&data={this.jsonData && this.jsonData.length > 2 ? this.jsonData.replace(/"/g, '\\"') : '*YOUT JSON FORMAT DATA*'}" {window.location.hostname}:{window.location.port}/api/deploy</p>
          </div>
        </div>
      </div>
    )
  }
}

