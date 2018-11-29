import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
// import defileIcon from './define.svg';
import axios from 'axios';
import { message, Progress } from 'antd';
import { Uploader } from 'components/Common';
import config from 'config';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import r2LoadGif from './R2Loading.gif';

import { observable, action, computed } from 'mobx';

const files = {
  RegressionSample: [
    {
      filename: 'regression.house.csv',
      size: '2.4M',
      desc: 'house features and price',
      target: 'price',
      usecase: 'house features and price',
    },
    {
      filename: 'game.csv',
      size: '1.6M',
      desc: 'game sales prediction',
      target: 'NA_Sales',
      usecase: 'video game sales',
    }
  ],
  ClassificationSample: [
    {
      filename: 'bank.train.csv',
      size: '366K',
      desc:
        'Predict target customers for telemarketing of long term deposits product.',
      target: 'y',
      usecase: 'Retail bank telemarketing campaign data',
    },
    {
      filename: 'titanic.train.csv',
      size: '59K',
      desc: 'Predict if a passenger on the Titanic boat would survive or not.',
      target: 'survived',
      usecase: 'Titanic survival data',
    },
    {
      filename: 'dma1c_dirty.csv',
      size: '24M',
      desc: 'Predict diabetic patients blood suger cross control level',
      target: 'target8',
      usecase: 'Predict diabetic',
    },
    {
      filename: 'givemecredit_dirty.csv',
      size: '5.5MB',
      desc: 'Predict whether or not a loan should be granted',
      target: 'target',
      usecase: 'Give me credit',
    }
  ]
};

@inject('userStore', 'socketStore')
@observer
export default class DataConnect extends Component {
  @observable sample = false
  @observable sql = false
  @observable file = null
  @observable uploading = false
  @observable process = 0
  @observable isPause = false
  @observable isSql = false
  @observable sqlProgress = 0

  @computed
  get message() {
    if (this.isPause) return 'Paused'
    const process = this.props.project.etling ? 90 : this.process
    if (!this.isSql && process === 0) return 'Perparing for upload...'
    if (!this.isSql && process > 0 && process < 90) return 'Uploading data...'
    if (process >= 90) return 'Extract-Transform-Load in progress...'
    if (this.isSql && process === 0) return 'Perparing for database connection...'
    if (this.isSql && process >= 20 && process < 90) return `Downloaded Data: ${this.sqlProgress} rows`
  }

  onUpload = ({ pause, resume }) => {
    this.uploading = true
    this.pause = pause
    this.resume = resume
  }

  upload = action(data => {
    this.process = 90
    this.file = null

    this.props.project.fastTrackInit(data.fileId);
  })

  onError = action((error, times) => {
    this.file = null
    this.process = 0
    this.uploading = false
    message.error(error.toString())
    console.log(error, times)
  })

  onProgress = action((progress, speed) => {
    if (!this.uploading) return
    const [loaded, size] = progress.split("/")
    try {
      this.process = (parseFloat(loaded) / parseFloat(size)) * 90
    } catch (e) { }
  })

  doEtl = () => {
    this.props.project.etl();
  };

  showSample = action(() => {
    this.sample = true
  })

  hideSample = action(() => {
    this.sample = false
  })

  selectSample = filename => {
    const process = this.props.project.etling ? 90 : this.process
    if (!!process) return false;

    this.uploading = true

    axios.post(`http://${config.host}:${config.port}/upload/sample`, { filename }).then(
      action(data => {
        const { fileId } = data.data
        this.process = 90
        this.props.project.fastTrackInit(fileId);
      }),
      () => {
        message.error('sample file error, please choose again');
      }
    );
    this.hideSample();
  };

  showSql = action(() => {
    this.sql = true;
  })

  hideSql = (() => {
    this.sql = false;
  })

  block = (label, img, onClick) => {
    return (
      <div className={styles.uploadBlock} onClick={onClick}>
        <div className={styles.blockImg}>
          <img src={img} alt={label} />
        </div>
        <div className={styles.blockLabel}>
          <span>{label}</span>
        </div>
      </div>
    );
  };

  handleDrop = action((e) => {
    e.preventDefault();
    const process = this.props.project.etling ? 90 : this.process
    if (process) return false;
    let file = e.dataTransfer.files[0];
    this.file = file
  })

  handleDragOver = (e) => {
    e.preventDefault();
  }

  handleParse = () => {
    if (this.isPause) return
    this.pause && this.pause()
    this.isPause = true
  }

  handleResume = () => {
    if (!this.isPause) return
    this.resume && this.resume()
    this.isPause = false
  }

  closeUpload = () => {
    this.pause && this.pause()
    this.uploading = false
    this.process = 0
    this.file = null
  }

  render() {
    const { project, userStore, socketStore } = this.props;
    const { etlProgress, etling } = project
    const process = etling ? 90 : this.process
    window.cn = this
    return (
      <div className={styles.connect} onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
        <div className={styles.title}>
          <span>If your data is ready, choose a data source to connect.</span>
        </div>
        {/* <div className={styles.maxRow}>
          <span>Maximum Data Size</span>
          <Popover content="By default, we will load maximum X,000,000 rows of data. You can modify the data size as needed.">
            <div className={styles.mark}>
              <span>?</span>
            </div>
          </Popover>
          <span> : 50000 (rows) </span>
          <a>Edit</a>
        </div> */}
        <div className={styles.uploadRow}>
          {this.block('From R2 Learn', sampleIcon, this.showSample)}
          {!!(this.uploading || etling) ? (
            this.block('From Computer', localFileIcon)
          ) : (
              <Uploader
                children={this.block('From Computer', localFileIcon)}
                onStart={this.onUpload}
                onComplete={this.upload}
                onError={this.onError}
                params={{ userId: userStore.info.id, projectId: project.id }}
                onProgress={this.onProgress}
                file={this.file}
              />
            )}
          {this.block('From SQL', sqlIcon, this.showSql)}
        </div>
        {/* <div className={styles.cutoff}>
          <div className={styles.line} />
          <div className={styles.or}>
            <span>or</span>
          </div>
          <div className={styles.line} />
        </div> */}
        {/* <div className={styles.title}>
          <span>
            If you need to define what training data to collect, please proceed
						here.
          </span>
        </div>
        <div className={styles.uploadRow}>
          {this.block('From R2 Learn', defileIcon)}
        </div> */}
        {this.sample && (
          <DataSample
            project={project}
            onClose={this.hideSample}
            selectSample={this.selectSample}
          />
        )}
        {!!(this.uploading || etling) && (
          <div className={styles.sample}>
            <div className={styles.cover} />
            <div className={styles.progressBlock}>
              <div className={styles.progressTitle}>
                <span>Data Import</span>
                {process < 90 && <div className={styles.close} onClick={this.closeUpload}><span>X</span></div>}
              </div>
              <div className={styles.progressContent}>
                <div className={styles.progressLoad}>
                  <img src={r2LoadGif} alt="loading" />
                </div>
                <div className={styles.progressing}>
                  <Progress
                    percent={process + (etlProgress || 0) / 10}
                    status="active"
                    strokeWidth={12}
                    showInfo={false}
                  />
                </div>
                <div className={styles.progressText}>
                  <span>{this.message}</span>
                  {(process < 90 && process > 0 && !this.isSql) && <div className={styles.progressButton}>{!this.isPause ? <span onClick={this.handleParse}>pause</span> : <span onClick={this.handleResume}>resume</span>}</div>}
                </div>
              </div>
            </div>
          </div>
        )}
        <DatabaseConfig
          options={{}}
          visible={this.sql}
          onClose={this.hideSql}
          title="Data Source - Database"
          projectId={project.id}
          onSubmit={action(async options => {
            this.hideSql();
            this.uploading = true
            this.process = 0
            let processInterval;
            const api = await socketStore.ready()
            const resp = await api.downloadFromDatabase({ ...options, type: 'modeling', projectId: project.id }, action(res => {
              const result = res.result
              if (result.value === 0) {
                this.process = 20
                processInterval = setInterval(() => {
                  if (this.process && this.process < 90) this.process++
                }, 1000)
              }
              if (result.value) this.sqlProgress = result.value
            }))
            clearInterval(processInterval)
            if (resp.status !== 200) return message.error(resp.message)
            const fileId = resp.fileId
            project.fastTrackInit(fileId);
            this.process = 90
          })}
        />
      </div>
    );
  }
}

@observer
class DataSample extends Component {
  @observable select = -1

  onSelect = action(index => {
    this.select = index
  })

  submit = () => {
    const { project, selectSample } = this.props;
    const sample = files[project.problemType + 'Sample'];
    const file = sample[this.select];
    if (!file) return;
    selectSample(file.filename);
  };

  render() {
    const { project, onClose } = this.props;
    const sample = files[project.problemType + 'Sample'];
    return (
      <div className={styles.sample}>
        <div className={styles.cover} onClick={onClose} />
        <div className={styles.sampleBlock}>
          <div className={styles.sampleTitle}>
            <span>Choose Sample Data</span>
            <div className={styles.close} onClick={onClose}>
              <span>X</span>
            </div>
          </div>
          <div className={styles.sampleTop}>
            <span>
              Select a sample data if you don’t have a dataset yet and want to
							try out the application.
            		</span>
          </div>
          <div className={styles.sampleTable}>
            <div className={styles.sampleHeader}>
              <div className={styles.sampleCell}>
                <span>Use Case Name</span>
              </div>
              <div className={classnames(styles.sampleCell, styles.sampleDesc)}>
                <span>Description</span>
              </div>
              <div className={styles.sampleCell}>
                <span>File Name</span>
              </div>
              <div className={styles.sampleCell}>
                <span>Target Variable</span>
              </div>
              <div className={styles.sampleCell}>
                <span>Data Size</span>
              </div>
            </div>
            {sample.map((row, index) => {
              return (
                <div
                  className={styles.sampleRow}
                  key={index}
                  onClick={this.onSelect.bind(null, index)}
                >
                  <div className={styles.sampleRadio}>
                    <input
                      type="radio"
                      name="sampleSelect"
                      checked={this.select === index}
                      onChange={this.onSelect.bind(null, index)}
                    />
                  </div>
                  <div className={styles.sampleCell} title={row.usecase}>
                    <span>{row.usecase}</span>
                  </div>
                  <div
                    className={classnames(styles.sampleCell, styles.sampleDesc)}
                    title={row.desc}
                  >
                    <span>{row.desc}</span>
                  </div>
                  <div className={styles.sampleCell} title={row.filename}>
                    <span>{row.filename}</span>
                  </div>
                  <div className={styles.sampleCell} title={row.target}>
                    <span>{row.target}</span>
                  </div>
                  <div className={styles.sampleCell} title={row.size}>
                    <span>{row.size}</span>
                  </div>
                </div>
              );
            })}
            <div className={styles.sampleButton}>
              <button onClick={this.submit} className={styles.submit}>
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
