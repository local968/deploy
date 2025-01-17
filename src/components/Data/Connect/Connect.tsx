import React, { Component, DragEvent } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
import { message } from 'antd';
import { Uploader, ProgressBar, Confirm, Show } from 'components/Common';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import r2LoadGif from './R2Loading.gif';
import EN from '../../../constant/en';
import { observable, action, computed } from 'mobx';
import { Select } from 'antd'
import DataSample from './Sample'
import { ProjectStore } from 'stores/ProjectStore';
import { UserStore } from 'stores/UserStore';
import { SocketStore } from 'stores/SocketStore';
import { UploadProps } from 'stores/Project';

const { Option } = Select;

interface DataConnectProps {
  projectStore: ProjectStore,
  userStore: UserStore,
  socketStore: SocketStore
}

@inject('userStore', 'socketStore', 'projectStore')
@observer
export default class DataConnect extends Component<DataConnectProps> {
  constructor(props: DataConnectProps) {
    super(props);
    this.uploadRef = React.createRef();
  }
  uploadRef: React.RefObject<Uploader>;
  pause: () => void;
  resume: () => void;
  abort: () => void
  @observable sample: boolean = false;
  @observable sql: boolean = false;
  @observable file: File | null = null;
  @observable uploading: boolean = false;
  @observable process: number = 0;
  @observable isPause: boolean = false;
  @observable isSql: boolean = false;
  @observable sqlProgress: number = 0;
  @observable visiable: boolean = false;
  @observable key: 'sample' | 'upload' | 'sql' | '' = '';

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

  onUpload = ({ pause, resume, abort }: { pause: () => void; resume: () => void, abort: () => void }) => {
    this.file = null;
    this.uploading = true;
    this.isPause = false;
    this.pause = pause;
    this.resume = resume;
    this.abort = abort
  };

  upload = action((data: UploadProps) => {
    this.process = 50;
    // this.file = null;

    this.props.projectStore.project.fastTrackInit(data).then(() => {
      this.process = 0;
      this.uploading = false;
    });
  });

  onError = action((error: Error, times: number) => {
    this.file = null;
    this.process = 0;
    this.uploading = false;
    window.alert(error.toString())
    // message.destroy();
    // message.error(error.toString());
    console.log(error, times);
  });

  onProgress = action((progress: string, speed: string) => {
    if (!this.uploading) return;
    const [loaded, size] = progress.split('/');
    try {
      this.process = (parseFloat(loaded) / parseFloat(size)) * 50;
    } catch (e) { }
  });

  onChecks = action((file: File) => {
    // if(this.props.userStore.uploadSize < file.size) return {
    //   err: true,
    //   msg: 'File Error: File must not exceed 50M.'
    // }

    // console.log(this.props.userStore.info.level, 'this.props.userStore.currentLever')

    if (+this.props.userStore.info.level === 0) {
      return {
        err: true,
        msg: EN.NoAuthority,
      };
    } else if (
      (+this.props.userStore.info.level === 1 &&
        file.size > 50 * 1024 * 1024) ||
      (+this.props.userStore.info.level == 2 && file.size > 50 * 1024 * 1024)
    ) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 50M.',
      };
    } else if (
      +this.props.userStore.info.level === 3 &&
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

  showSample = action(() => {
    this.sample = true;
  });

  hideSample = action(() => {
    this.sample = false;
  });

  selectSample = (data: UploadProps) => {
    const process = this.props.projectStore.project.etling ? 50 : this.process;
    if (!!process) return false;

    this.uploading = true;

    // axios.post(`http://${config.host}:${config.port}/upload/sample`, { filename }).then(
    //   action(data => {
    //     const { fileId } = data.data
    this.process = 50;
    this.props.projectStore.project.fastTrackInit(data).then(() => {
      this.process = 0;
      this.uploading = false;
    });
    //   }),
    //   () => {

    //     message.destroy();
    //     message.error(EN.Samplefileerror);
    //   }
    // );
    this.hideSample();
  };

  showSql = action(() => {
    this.sql = true;
  });

  hideSql = () => {
    this.sql = false;
  };

  onClick = (key: any) => {
    const { project } = this.props.projectStore;
    if (this.uploading || project.etling) return;
    this.key = key;
    if (project.train2ing || !!project.models.length)
      return (this.visiable = true);
    this.onConfirm();
  };

  onConfirm = () => {
    if (!this.key) return;
    this.onClose();
    if (this.key === 'upload') return this.uploadRef.current.show();
    this[this.key] = true;
    // Reflect.defineProperty(this, this.key, { value: true })
  };

  onClose = () => {
    this.visiable = false;
  };

  block = (label: string, img: string, key: string, name) => {
    const btn = (
      <Show name={name}>
        <div className={styles.blockLabel}>
          <span>{label}</span>
        </div>
      </Show>
    );

    return (
      <div
        className={styles.uploadBlock}
        onClick={() => {
          if (this.props.userStore.info.role[name] !== false) {
            this.onClick(key)
          }
        }}
      >
        <div className={styles.blockImg}>
          <img src={img} alt={label} />
        </div>
        {btn}
      </div>
    );
  };

  handleDrop = action((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const process = this.props.projectStore.project.etling ? 50 : this.process;
    if (process) return false;
    let file = e.dataTransfer.files[0];
    this.file = file;
  });

  handleDragOver = (e: DragEvent<HTMLDivElement>) => {
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
    this.abort && this.abort();
    this.uploading = false;
    this.process = 0;
    // this.file = null;
  };

  afterClose = (index: string) => {
    this.props.projectStore.project.deleteIndex(index)
  }

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
    return (
      <div className={styles.connect} onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
        <div className={styles.schemaInfo}>
          <div className={styles.schemaI}><span>i</span></div>
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
          {this.block(EN.FromR2L, sampleIcon, 'sample', 'connect_FromR2L')}
          {this.block(EN.FromComp, localFileIcon, 'upload', 'connect_FromComp')}
          {this.block(EN.FromSQL, sqlIcon, 'sql', 'connect_FromSQL')}
          <Uploader
            onStart={this.onUpload}
            onComplete={this.upload}
            onError={this.onError}
            params={{ userId: userStore.info.id, projectId: project.id }}
            onProgress={this.onProgress}
            // onCheck={this.onChecks}
            file={this.file}
            ref={this.uploadRef}
            charset={charset}
            afterClose={this.afterClose}
          />
        </div>
        {
          <DataSample
            project={project}
            onClose={this.hideSample}
            selectSample={this.selectSample}
            visible={this.sample}
          />
        }
        {!!(this.uploading || etling) && (
          <div className={styles.sample}>
            <div className={styles.cover} />
            <div className={styles.progressBlock}>
              <div className={styles.progressTitle}>
                <span>{EN.DataImport}</span>
                {<div className={styles.close} onClick={this.closeUpload}>
                  <span>X</span>
                </div>}
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
          onSubmit={action(async (options: { sqlTable: string }) => {
            this.hideSql();
            this.isSql = true;
            this.uploading = true;
            const api = await socketStore.ready();
            this.process = 0;
            const resp = await api.downloadFromDatabase(
              { ...options, type: 'modeling', projectId: project.id },
              action((res: { count: number }) => {
                if (this.process < 49.9) this.process += 0.1;
                if (res.count) this.sqlProgress = res.count;
              }),
            );
            if (resp.status !== 200) {
              this.process = 0;
              this.uploading = false;
              window.alert(resp.message)
              return
              // message.destroy();
              // return message.error(resp.message);
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
      </div>
    );
  }
}
