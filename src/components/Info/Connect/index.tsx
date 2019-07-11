import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
import { message, Select } from 'antd';
import { Confirm, ProcessLoading, ProgressBar, Uploader } from 'components/Common';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import r2LoadGif from './R2Loading.gif';
import EN from '../../../constant/en';
import { action, computed, observable } from 'mobx';
import { formatNumber } from '../../../util';

const { Option } = Select;

interface Interface {
  projectStore:any
  userStore:any
  socketStore:any
}

@inject('userStore', 'socketStore', 'projectStore')
@observer
export default class DataConnect extends Component<Interface> {
  private readonly uploadRef: React.RefObject<any>;
  private pause: any;
  private resume: any;
  constructor(props) {
    super(props);
    this.uploadRef = React.createRef();
  }

  @observable sample = false;
  @observable sql = false;
  @observable file = null;
  @observable uploading = false;
  @observable process = 0;
  @observable isPause = false;
  @observable isSql = false;
  @observable sqlProgress = 0;
  @observable visiable = false;
  @observable key = '';

  @computed
  get message() {
    if (this.isPause) return EN.Paused;
    const process = this.props.projectStore.project.etling ? 50 : this.process;
    if (!this.isSql && process === 0) return EN.Preparingforupload;
    if (!this.isSql && process > 0 && process < 50) return EN.Uploadingdata;
    if (process >= 50) return EN.ExtractTransformLoadinprogress;
    if (this.isSql && process === 0) return EN.Perparingfordatabaseconnection;
    if (this.isSql && process > 0 && process < 50)
      return `${EN.DownloadedData} ${this.sqlProgress}${EN.Rows}`;
  }

  onUpload = ({ pause, resume }) => {
    this.uploading = true;
    this.isPause = false;
    this.pause = pause;
    this.resume = resume;
  };

  upload = action(data => {
    this.process = 50;
    this.file = null;

    this.props.projectStore.project.fastTrackInit(data).then(() => {
      this.process = 0;
      this.uploading = false;
    });
  });

  onError = action((error, times) => {
    this.file = null;
    this.process = 0;
    this.uploading = false;
    message.error(error.toString());
    console.log(error, times);
  });

  onProgress = action((progress:any) => {
    if (!this.uploading) return;
    const [loaded, size] = progress.split('/');
    try {
      this.process = (parseFloat(loaded) / parseFloat(size)) * 50;
    } catch (e) {}
  });

  onChecks = action((file:any) => {
    console.log(
      this.props.userStore.currentLever,
      'this.props.userStore.currentLever',
    );

    if (this.props.userStore.currentLever === '0') {
      return {
        err: true,
        msg: EN.NoAuthority,
      };
    } else if (
      (+this.props.userStore.currentLever === 1 &&
        file.size > 50 * 1024 * 1024) ||
      (this.props.userStore.currentLever == '2' && file.size > 50 * 1024 * 1024)
    ) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 50M.',
      };
    } else if (
      +this.props.userStore.currentLever === 3 &&
      file.size > 200 * 1024 * 1024
    ) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 200M.',
      };
    }
    return {
      err: false,
      msg: 'ok',
    };
  });

  hideSample = action(() => {
    this.sample = false;
  });

  selectSample = data => {
    const process = this.props.projectStore.project.etling ? 50 : this.process;
    if (!!process) return false;

    this.uploading = true;
    this.process = 50;
    this.props.projectStore.project.fastTrackInit(data).then(() => {
      this.process = 0;
      this.uploading = false;
    });
    this.hideSample();
  };

  hideSql = () => {
    this.sql = false;
  };

  onClick = (key: 'sample' | 'upload' | 'sql',onUse) => {
    if(!onUse)return;
    const { project } = this.props.projectStore;
    if (this.uploading || project.etling) return;
    this.key = key;
    if ((project || {}).train2ing || !!((project || {}).models || []).length)
      return (this.visiable = true);
    this.onConfirm();
  };

  onConfirm = () => {
    if (!this.key) return;
    this.onClose();
    if (this.key === 'upload') return this.uploadRef.current.show();
    this[this.key] = true;
  };

  onClose = () => {
    this.visiable = false;
  };

  block = (label: string, img: string, key: string,onUse=true) => {
    return (
      <div
        className={styles.uploadBlock}
        onClick={this.onClick.bind(null, key,onUse)}
      >
        <div className={styles.blockImg}>
          <img src={img} alt={label} />
        </div>
        <div
          style={{display:(onUse?'':'none')}}
          className={styles.blockLabel}>
          <span>{label}</span>
        </div>
      </div>
    );
  };

  handleDrop = action((e:any) => {
    e.preventDefault();
    const process = this.props.projectStore.project.etling ? 50 : this.process;
    if (process) return false;
    this.file = e.dataTransfer.files[0];
  });

  handleDragOver = e => {
    e.preventDefault();
  };

  handleParse = () => {
    if (this.isPause) return;
    this.pause && this.pause();
    this.isPause = true;
  };

  handleResume = () => {
    if (!this.isPause) return;
    this.resume && this.resume();
    this.isPause = false;
  };

  closeUpload = () => {
    this.pause && this.pause();
    this.uploading = false;
    this.process = 0;
    this.file = null;
  };

  render() {
    const {
      projectStore: { project },
      userStore,
      socketStore,
    } = this.props;
    const { etlProgress, etling, charset } = project;
    const process = etling ? 50 : this.process;
    const charsetChange = action(charset => {
      project.updateProject({ charset });
    });
    (window as any).cn = this;
    const {connect_FromR2L_UN=true,connect_FromComp_UN=true,connect_FromSQL_UN=true} = userStore.info.role;

    return (
      <div
        className={styles.connect}
        onDrop={this.handleDrop}
        onDragOver={this.handleDragOver}
      >
        <div className={styles.schemaInfo}>
          <div className={styles.schemaI}>
            <span>i</span>
          </div>
          <div className={styles.schemaText}>
            <span>{EN.Ifyourdatadoesnothaveaheader}</span>
          </div>
        </div>
        <div className={styles.title}>
          <span>{EN.Pleasechooseadata}</span>
          <label className={styles.chooseCharset}>{EN.choosecharset}</label>
          <Select
            style={{ width: '8rem' }}
            value={charset}
            onChange={charsetChange}
          >
            <Option value="utf-8">{EN.UTF_8}</Option>
            <Option value="gbk">{EN.GBK}</Option>
            <Option value="big5">{EN.BIG5}</Option>
          </Select>
        </div>
        <div className={styles.uploadRow}>
          {this.block(EN.FromR2L, sampleIcon, 'sample',connect_FromR2L_UN)}
          {this.block(EN.FromComp, localFileIcon, 'upload',connect_FromComp_UN)}
          {this.block(EN.FromSQL, sqlIcon, 'sql',connect_FromSQL_UN)}
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
        </div>
        {
          <DataSample
            project={project}
            onClose={this.hideSample}
            selectSample={this.selectSample}
            visible={this.sample}/>
        }
        {!!(this.uploading || etling) && (
          <div className={styles.sample}>
            <div className={styles.cover} />
            <div className={styles.progressBlock}>
              <div className={styles.progressTitle}>
                <span>{EN.DataImport}</span>
                {
                  <div className={styles.close} onClick={this.closeUpload}>
                    <span>X</span>
                  </div>
                }
              </div>
              <div className={styles.progressContent}>
                <div className={styles.progressLoad}>
                  <img src={r2LoadGif} alt="loading" />
                </div>
                <div className={styles.progressing}>
                  <ProgressBar progress={process + (etlProgress || 0) / 2} />
                </div>
                <div className={styles.progressText}>
                  <span>{this.message}</span>
                  {process < 50 && process > 0 && !this.isSql && (
                    <div className={styles.progressButton}>
                      {!this.isPause ? (
                        <span onClick={this.handleParse}>{EN.Paused}</span>
                      ) : (
                        <span onClick={this.handleResume}>{EN.Resume}</span>
                      )}
                    </div>
                  )}
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
            this.isSql = true;
            this.uploading = true;
            // let processInterval;
            const api = await socketStore.ready();
            this.process = 0;
            const resp = await api.downloadFromDatabase(
              { ...options, type: 'modeling', projectId: project.id },
              action(res => {
                if (this.process < 49.9) this.process += 0.1;
                if (res.count) this.sqlProgress = res.count;
              }),
            );
            // clearInterval(processInterval);
            if (resp.status !== 200) {
              this.process = 0;
              this.uploading = false;
              return message.error(resp.message);
            }
            this.process = 50;
            project
              .fastTrackInit({
                originalIndex: resp.originalIndex,
                totalRawLines: this.sqlProgress,
                fileName: options.sqlTable,
                rawHeader: resp.rawHeader,
              })
              .then(() => {
                this.process = 0;
                this.uploading = false;
              });
          })}
        />
        {
          <Confirm
            width={'6em'}
            visible={this.visiable}
            title={EN.Warning}
            content={EN.Thisactionmaywipeoutallofyourprevious}
            onClose={this.onClose}
            onConfirm={this.onConfirm}
            confirmText={EN.Continue}
            closeText={EN.CANCEL}
          />
        }
      </div>
    );
  }
}

interface DataSampleInterface {
  project:any
  selectSample:any
  onClose:any
  visible:any
}
@observer
class DataSample extends Component<DataSampleInterface> {
  files:any;
  constructor(props) {
    super(props);
    this.init();
  }

  @observable select = -1;
  @observable loading = true;

  onSelect = action((index:any) => {
    this.select = index;
  });

  init = () => {
    this.props.project.getSample().then(list => {
      this.files = list;
      this.loading = false;
    });
  };

  submit = () => {
    const { selectSample } = this.props;
    const file = (this.files || [])[this.select];
    if (!file) return;
    selectSample({
      rawHeader: file.header,
      totalRawLines: file.lines,
      originalIndex: file.index,
      fileName: file.name,
    });
  };

  formatSize = size => {
    let { size: s, n } = this.getSize(size);
    if (n < 0) n = 1;
    const unit =
      (n === 1 && 'b') ||
      (n === 2 && 'Kb') ||
      (n === 3 && 'Mb') ||
      (n === 4 && 'Gb') ||
      'Tb';
    return parseInt(String(s * 100), 10) / 100 + ' ' + unit;
  };

  getSize = (size, n = 1) => {
    if (n >= 5) return { size, n };
    const s = size / 1024;
    if (s > 1) return this.getSize(s, ++n);
    return { size, n };
  };

  render() {
    const { onClose, visible } = this.props;
    if (!visible) return null;
    // const sample = this.files[project.problemType + 'Sample'];
    return this.loading ? (
      <ProcessLoading style={{ position: 'fixed' }} />
    ) : (
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
            <span>{EN.SelectSampleData}</span>
          </div>
          <div className={styles.sampleTable}>
            <div className={styles.sampleHeader}>
              <div className={styles.sampleCell}>
                <span>{EN.Name}</span>
              </div>
              <div className={styles.sampleCell}>
                <span>{EN.FileName}</span>
              </div>
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
                  <div className={styles.sampleCell} title={row.filename}>
                    <span>{row.name}</span>
                  </div>
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
    );
  }
}
