import React, { Component } from 'react';
import styles from './styles.module.css';
// import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
// import defileIcon from './define.svg';
import axios from 'axios';
import { message } from 'antd';
import { Uploader, ProgressBar, ProcessLoading, Confirm } from 'components/Common';
import config from 'config';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import r2LoadGif from './R2Loading.gif';
import EN from '../../../constant/en';
import { observable, action, computed } from 'mobx';
import { formatNumber } from 'util';
import { Select } from 'antd'

const Option = Select.Option

// const files = {
//   RegressionSample: [
//     {
//       filename: 'regression.house.csv',
//       size: '2.4M',
//       desc: 'house features and price',
//       target: 'price',
//       usecase: 'house features and price',
//     },
//     {
//       filename: 'game.csv',
//       size: '1.6M',
//       desc: 'game sales prediction',
//       target: 'NA_Sales',
//       usecase: 'video game sales',
//     }
//   ],
//   ClassificationSample: [
//     {
//       filename: 'bank.train.csv',
//       size: '366K',
//       desc:
//         'Predict target customers for telemarketing of long term deposits product.',
//       target: 'y',
//       usecase: 'Retail bank telemarketing campaign data',
//     },
//     {
//       filename: 'titanic.train.csv',
//       size: '59K',
//       desc: 'Predict if a passenger on the Titanic boat would survive or not.',
//       target: 'survived',
//       usecase: 'Titanic survival data',
//     },
//     {
//       filename: 'dma1c_dirty.csv',
//       size: '24M',
//       desc: 'Predict diabetic patients blood suger cross control level',
//       target: 'target8',
//       usecase: 'Predict diabetic',
//     },
//     {
//       filename: 'givemecredit_dirty.csv',
//       size: '5.5MB',
//       desc: 'Predict whether or not a loan should be granted',
//       target: 'target',
//       usecase: 'Give me credit',
//     }
//   ]
// };

@inject('userStore', 'socketStore', 'projectStore')
@observer
export default class DataConnect extends Component {
  constructor(props) {
    super(props)
    this.uploadRef = React.createRef()
  }

  @observable sample = false
  @observable sql = false
  @observable file = null
  @observable uploading = false
  @observable process = 0
  @observable isPause = false
  @observable isSql = false
  @observable sqlProgress = 0
  @observable visiable = false
  @observable key = ''

  @computed
  get message() {
    if (this.isPause) return EN.Paused;
    const process = this.props.projectStore.project.etling ? 50 : this.process;
    if (!this.isSql && process === 0) return EN.Preparingforupload;
    if (!this.isSql && process > 0 && process < 50) return EN.Uploadingdata;
    if (process >= 50) return EN.ExtractTransformLoadinprogress;
    if (this.isSql && process === 0) return EN.Perparingfordatabaseconnection;
    if (this.isSql && process > 0 && process < 50) return `${EN.DownloadedData} ${this.sqlProgress}${EN.Rows}`;
  }

  onUpload = ({ pause, resume }) => {
    this.uploading = true
    this.isPause = false
    this.pause = pause
    this.resume = resume
  }

  upload = action(data => {

    this.process = 50
    this.file = null

    this.props.projectStore.project.fastTrackInit(data).then(() => {
      this.process = 0
      this.uploading = false
    });
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
      this.process = (parseFloat(loaded) / parseFloat(size)) * 50
    } catch (e) { }
  })

  onChecks = action(file => {
    // if(this.props.userStore.uploadSize < file.size) return {
    //   err: true,
    //   msg: 'File Error: File must not exceed 50M.'
    // }

    console.log(this.props.userStore.currentLever, 'this.props.userStore.currentLever')

    if (this.props.userStore.currentLever === '0') {
      return {
        err: true,
        msg: EN.NoAuthority,
      };
    } else if ((+this.props.userStore.currentLever === 1 && file.size > 50 * 1024 * 1024) || (this.props.userStore.currentLever == '2' && file.size > 50 * 1024 * 1024)) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 50M.',
      };
    } else if (+this.props.userStore.currentLever === 3 && file.size > 200 * 1024 * 1024) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 200M.',
      };
    }
    return {
      err: false,
      msg: 'ok'
    }

  })

  showSample = action(() => {
    this.sample = true
  })

  hideSample = action(() => {
    this.sample = false
  })

  selectSample = data => {
    const process = this.props.projectStore.project.etling ? 50 : this.process
    if (!!process) return false;

    this.uploading = true

    // axios.post(`http://${config.host}:${config.port}/upload/sample`, { filename }).then(
    //   action(data => {
    //     const { fileId } = data.data
    this.process = 50
    this.props.projectStore.project.fastTrackInit(data).then(() => {
      this.process = 0
      this.uploading = false
    });
    //   }),
    //   () => {
    //     message.error(EN.Samplefileerror);
    //   }
    // );
    this.hideSample();
  };

  showSql = action(() => {
    this.sql = true;
  })

  hideSql = (() => {
    this.sql = false;
  })

  onClick = key => {
    const { project } = this.props.projectStore
    if (this.uploading || project.etling) return
    this.key = key
    if ((project || {}).train2ing || !!((project || {}).models || []).length) return this.visiable = true
    this.onConfirm()
  }

  onConfirm = () => {
    if (!this.key) return
    this.onClose()
    if (this.key === 'upload') return this.uploadRef.current.show()
    this[this.key] = true
  }

  onClose = () => {
    this.visiable = false
  }

  block = (label, img, key) => {
    return (
      <div className={styles.uploadBlock} onClick={this.onClick.bind(null, key)}>
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
    const process = this.props.projectStore.project.etling ? 50 : this.process
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
    const { projectStore: { project }, userStore, socketStore } = this.props;
    const { etlProgress, etling, charset } = project
    const process = etling ? 50 : this.process
    const charsetChange = action((charset) => {
      project.updateProject({ charset })
    })
    window.cn = this
    return (
      <div className={styles.connect} onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
        <div className={styles.title}>
          <span>{EN.Pleasechooseadata}</span>
          <label className={styles.chooseCharset}>{EN.choosecharset}</label>
          <Select style={{ width: '8rem' }} value={charset} onChange={charsetChange}>
            <Option value='utf-8'>{EN.UTF_8}</Option>
            <Option value='gbk'>{EN.GBK}</Option>
            <Option value='big5'>{EN.BIG5}</Option>
          </Select>
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
          {this.block(EN.FromR2L, sampleIcon, 'sample')}
          {this.block(EN.FromComp, localFileIcon, 'upload')}
          {this.block(EN.FromSQL, sqlIcon, 'sql')}
          <Uploader
            charset={charset}
            onStart={this.onUpload}
            onComplete={this.upload}
            onError={this.onError}
            params={{ userId: userStore.info.id, projectId: project.id }}
            onProgress={this.onProgress}
            onCheck={this.onChecks}
            file={this.file}
            ref={this.uploadRef}
          />
          {/* {this.block('From R2 Learn', sampleIcon, this.showSample)}
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
                onCheck={this.onChecks}
                file={this.file}
              />
            )} */}
          {/*{this.block('From SQL', sqlIcon, this.showSql)}*/}
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
        {<DataSample
          project={project}
          onClose={this.hideSample}
          selectSample={this.selectSample}
          visible={this.sample}
        />}
        {!!(this.uploading || etling) && (
          <div className={styles.sample}>
            <div className={styles.cover} />
            <div className={styles.progressBlock}>
              <div className={styles.progressTitle}>
                <span>{EN.DataImport}</span>
                {<div className={styles.close} onClick={this.closeUpload}><span>X</span></div>}
              </div>
              <div className={styles.progressContent}>
                <div className={styles.progressLoad}>
                  <img src={r2LoadGif} alt="loading" />
                </div>
                <div className={styles.progressing}>
                  <ProgressBar
                    progress={process + (etlProgress || 0) / 2}
                  />
                </div>
                <div className={styles.progressText}>
                  <span>{this.message}</span>
                  {(process < 50 && process > 0 && !this.isSql) &&
                    <div className={styles.progressButton}>{!this.isPause ?
                      <span onClick={this.handleParse}>{EN.Paused}</span> :
                      <span onClick={this.handleResume}>{EN.Resume}</span>}</div>}
                </div>
              </div>
            </div>
          </div>
        )}
        <DatabaseConfig
          options={{}}
          visible={this.sql}
          onClose={this.hideSql}
          title={EN.DataSourceDatabase}
          projectId={project.id}
          onSubmit={action(async options => {
            this.hideSql();
            this.isSql = true
            this.uploading = true
            let processInterval;
            const api = await socketStore.ready()
            this.process = 0
            const resp = await api.downloadFromDatabase({ ...options, type: 'modeling', projectId: project.id }, action(res => {
              if (this.process < 49.9) this.process += 0.1
              if (res.count) this.sqlProgress = res.count
            }))
            clearInterval(processInterval)
            if (resp.status !== 200) {
              this.process = 0
              this.uploading = false
              return message.error(resp.message)
            }
            this.process = 50
            project.fastTrackInit({
              originalIndex: resp.originalIndex,
              totalRawLines: this.sqlProgress,
              fileName: options.sqlTable,
              rawHeader: resp.rawHeader
            }).then(() => {
              this.process = 0
              this.uploading = false
            })
          })}
        />
        {<Confirm width={'6em'} visible={this.visiable} title={EN.Warning}
          content={EN.Thisactionmaywipeoutallofyourprevious} onClose={this.onClose} onConfirm={this.onConfirm}
          confirmText={EN.Continue} closeText={EN.CANCEL} />}
      </div>
    );
  }
}

@observer
class DataSample extends Component {
  constructor(props) {
    super(props)
    this.init()
  }

  @observable select = -1
  @observable loading = true

  onSelect = action(index => {
    this.select = index
  })

  init = () => {
    this.props.project.getSample().then(list => {
      this.files = list
      this.loading = false
    })
  }

  submit = () => {
    const { selectSample } = this.props;
    // const sample = this.files[project.problemType + 'Sample'];
    const file = (this.files || [])[this.select];
    if (!file) return;
    selectSample({
      rawHeader: file.header,
      totalRawLines: file.lines,
      originalIndex: file.index,
      fileName: file.name
    });
  };

  formatSize = size => {
    let { size: s, n } = this.getSize(size)
    if (n < 0) n = 1
    const unit = (n === 1 && 'b') || (n === 2 && 'Kb') || (n === 3 && 'Mb') || (n === 4 && 'Gb') || 'Tb'
    return (parseInt(s * 100, 10) / 100) + ' ' + unit
  }

  getSize = (size, n = 1) => {
    if (n >= 5) return { size, n }
    const s = size / 1024
    if (s > 1) return this.getSize(s, ++n)
    return { size, n }
  }

  render() {
    const { onClose, visible } = this.props;
    if (!visible) return null
    // const sample = this.files[project.problemType + 'Sample'];
    return this.loading ?
      <ProcessLoading style={{ position: 'fixed' }} /> :
      <div className={styles.sample}>
        <div className={styles.cover} onClick={onClose} />
        <div className={styles.sampleBlock}>
          <div className={styles.sampleTitle}>
            <span>{EN.ChooseSampleD}</span>
            <div className={styles.close} onClick={onClose}>
              <span>X</span>
            </div>
          </div>
          <div className={styles.sampleTop}>
            <span>
              {EN.SelectSampleData}
            </span>
          </div>
          <div className={styles.sampleTable}>
            <div className={styles.sampleHeader}>
              <div className={styles.sampleCell}>
                <span>{EN.Name}</span>
              </div>
              {/* <div className={classnames(styles.sampleCell, styles.sampleDesc)}>
                <span>Description</span>
              </div> */}
              <div className={styles.sampleCell}>
                <span>{EN.FileName}</span>
              </div>
              {/* <div className={styles.sampleCell}>
                <span>{EN.TargetVariable}</span>
              </div> */}
              <div className={styles.sampleCell}>
                <span>{EN.DataLines}</span>
              </div>
              <div className={styles.sampleCell}>
                <span>{EN.DataSize}</span>
              </div>
            </div>
            {(this.files || []).map((row, index) => {
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
                    <span>{row.name}</span>
                  </div>
                  {/* <div
                    className={classnames(styles.sampleCell, styles.sampleDesc)}
                    title={row.desc}
                  >
                    <span>{row.desc}</span>
                  </div> */}
                  <div className={styles.sampleCell} title={row.filename}>
                    <span>{row.name}</span>
                  </div>
                  {/* <div className={styles.sampleCell} title={row.target}>
                    <span>{row.target}</span>
                  </div> */}
                  <div className={styles.sampleCell}>
                    <span>{formatNumber(row.lines)}</span>
                  </div>
                  <div className={styles.sampleCell} title={row.size}>
                    <span>{this.formatSize(row.size)}</span>
                  </div>
                </div>
              );
            })}
            <div className={styles.sampleButton}>
              <button onClick={this.submit} className={styles.submit}>
                <span>{EN.LoadSampleData}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  }
}
