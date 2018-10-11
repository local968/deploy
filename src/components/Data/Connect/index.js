import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import Papa from 'papaparse';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
import defileIcon from './define.svg';
import axios from 'axios';
import { message, Progress } from 'antd';
import { Uploader } from 'components/Common';
import DatabaseConfig from 'components/Common/DatabaseConfig';

import r2LoadGif from './R2Loading.gif';

// sample data
import bankSmall from 'sample/classification/bank.train.csv';
import titanic from 'sample/classification/titanic.train.csv';
import houseSmall from 'sample/regression/regression.house.csv';
import gameSmall from 'sample/regression/game.csv';
import dma1cSmall from 'sample/classification/dma1c_dirty.csv';
import givemecreditSmall from 'sample/classification/givemecredit_dirty.csv';
import { observable, action } from 'mobx';

const fileMap = {
  'titanic.train.csv': titanic,
  'bank.train.csv': bankSmall,
  'regression.house.csv': houseSmall,
  'game.csv': gameSmall,
  'dma1c_dirty.csv': dma1cSmall,
  'givemecredit_dirty.csv': givemecreditSmall
};

const files = {
  RegressionSample: [
    {
      filename: 'regression.house.csv',
      size: '2.4M',
      desc: 'house features and price',
      target: 'price',
      usecase: 'house features and price'
    },
    {
      filename: 'game.csv',
      size: '1.6M',
      desc: 'game sales prediction',
      target: 'NA_Sales',
      usecase: 'video game sales'
    }
  ],
  ClassificationSample: [
    {
      filename: 'bank.train.csv',
      size: '366K',
      desc:
        'Predict target customers for telemarketing of long term deposits product.',
      target: 'y',
      usecase: 'Retail bank telemarketing campaign data'
    },
    {
      filename: 'titanic.train.csv',
      size: '59K',
      desc: 'Predict if a passenger on the Titanic boat would survive or not.',
      target: 'survived',
      usecase: 'Titanic survival data'
    },
    {
      filename: 'dma1c_dirty.csv',
      size: '24M',
      desc: 'Predict diabetic patients blood suger cross control level',
      target: 'target8',
      usecase: 'Predict diabetic'
    },
    {
      filename: 'givemecredit_dirty.csv',
      size: '5.5MB',
      desc: 'Predict whether or not a loan should be granted',
      target: 'target',
      usecase: 'Give me credit'
    }
  ]
};

@inject('userStore')
@observer
export default class DataConnect extends Component {
  @observable sample = false
  @observable sql = false
  @observable file = null
  @observable process = 0

  upload = action((file, data) => {
    this.process = 90
    this.file = null

    this.props.project.fastTrackInit(data.fileId);

    const reader = new FileReader();
    reader.onload = e => {
      const result = Papa.parse(e.target.result, {
        header: false,
        preview: 100
      });
      if (result.errors.length !== 0) {
        console.error('parse error: ', result.errors[0].message);
        return;
      }
      this.props.project.newFileInit(result.data);
    };
    const blob = file.slice(0, 5000000);
    reader.readAsText(blob);
  })

  onError = action((error, times) => {
    this.file = null
    this.process = 0
    console.log(error, times)
  })

  onProgress = action((progress, speed) => {
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
    if (!!this.process) return false;
    const { userStore, project } = this.props;

    axios('/api/sample', {
      method: 'post',
      params: {
        userId: userStore.info.id,
        projectId: project.id,
        type: project.problemType.toLowerCase(),
        filename: filename
      }
    }).then(
      action(() => {
        this.process = 90
        this.props.project.fastTrackInit(filename);

        Papa.parse(fileMap[filename], {
          download: true,
          preview: 100,
          complete: result => {
            if (result.errors.length !== 0) {
              console.error('parse error: ', result.errors[0].message);
              return;
            }
            this.props.project.newFileInit(result.data);
          }
        });
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
    if (this.process) return false;
    let file = e.dataTransfer.files[0];
    this.file = file
  })

  handleDragOver = (e) => {
    e.preventDefault();
  }

  render() {
    const { project, userStore } = this.props;
    return (
      <div className={styles.connect} onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
        <div className={styles.title}>
          <span>If your data is ready, choose a data source to connect.</span>
        </div>
        <div className={styles.maxRow}>
          <span>Maximum Data Size</span>
          <div className={styles.mark}>
            <span>?</span>
          </div>
          <span> : 50000 (rows) </span>
          <a>Edit</a>
        </div>
        <div className={styles.uploadRow}>
          {this.block('From Mr.One', sampleIcon, this.showSample)}
          {!!this.process ? (
            this.block('From Computer', localFileIcon)
          ) : (
              <Uploader
                children={this.block('From Computer', localFileIcon)}
                // onChange={this.upload}
                onComplete={this.upload}
                params={{ userId: userStore.info.id, projectId: project.id }}
                onProgress={this.onProgress}
                file={this.file}
              />
            )}
          {this.block('From SQL', sqlIcon, this.showSql)}
        </div>
        <div className={styles.cutoff}>
          <div className={styles.line} />
          <div className={styles.or}>
            <span>or</span>
          </div>
          <div className={styles.line} />
        </div>
        <div className={styles.title}>
          <span>
            If you need to define what training data to collect, please proceed
						here.
          </span>
        </div>
        <div className={styles.uploadRow}>
          {this.block('From Mr.One', defileIcon)}
        </div>
        {this.sample && (
          <DataSample
            project={project}
            onClose={this.hideSample}
            selectSample={this.selectSample}
          />
        )}
        {!!this.process && (
          <div className={styles.sample}>
            <div className={styles.cover} />
            <div className={styles.progressBlock}>
              <div className={styles.progressTitle}>
                <span>Connect Data File</span>
              </div>
              <div className={styles.progressContent}>
                <div className={styles.progressLoad}>
                  <img src={r2LoadGif} alt="loading" />
                </div>
                <div className={styles.progressing}>
                  <Progress
                    percent={this.process}
                    status="active"
                    strokeWidth={12}
                    showInfo={false}
                  />
                </div>
                <div className={styles.progressText}>
                  <span>Load modeling data and detect data type…</span>
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
          onSubmit={action(options => {
            const csvLocation = options.result.result.csvLocation;
            project.fastTrackInit(csvLocation);

            Papa.parse(`/api/download?csvLocation=${csvLocation}&userId=${userStore.info.id}&projectId=${project.id}`, {
              download: true,
              preview: 100,
              complete: result => {
                if (result.errors.length !== 0) {
                  console.error('parse error: ', result.errors[0].message);
                  return;
                }
                project.newFileInit(result.data);
              }
            });

            this.process = 90

            this.hideSql();
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
