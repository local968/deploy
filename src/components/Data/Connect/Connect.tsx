import React, { useState, createRef, useMemo, DragEvent } from 'react';
import styles from './styles.module.css';
// import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import sampleIcon from './sample.svg';
import localFileIcon from './local-file.svg';
import sqlIcon from './sql.svg';
// import defileIcon from './define.svg';
import axios from 'axios';
import { message as antdMessage } from 'antd';
import { Uploader, ProgressBar, Confirm } from 'components/Common';
import config from 'config';
import DatabaseConfig from 'components/Common/DatabaseConfig';
import r2LoadGif from './R2Loading.gif';
import EN from '../../../constant/en';
import DataSample from './Sample'
import DataUploading from './Uploading'

interface DataConnectProps {
  userStore: any,
  socketStore: any,
  projectStore: any
}

interface DataConnectState {
  sample: boolean,
  sql: boolean,
  file: File | null,
  uploading: boolean,
  isPause: boolean,
  isSql: boolean,
  sqlProgress: number,
  visiable: boolean,
  key: string,
  pause?: () => void,
  resume?: () => void
}

function DataConnect(props: DataConnectProps) {
  const { projectStore: { project }, userStore, socketStore } = props;
  const uploadRef = createRef<Uploader>()
  const initState = {
    sample: false,
    sql: false,
    file: null,
    uploading: false,
    isPause: false,
    isSql: false,
    sqlProgress: 0,
    visiable: false,
    key: '',
  } as DataConnectState
  const [state, setState] = useState(initState)
  const [process, setProcess] = useState(project.etling ? 50 : 0)

  const onUpload = ({ pause, resume }) => {
    setState({
      ...state,
      uploading: true,
      isPause: false,
      pause,
      resume,
    })
  }

  const upload = (data: any) => {
    setState({
      ...state,
      file: null,
    })
    setProcess(50)

    project.fastTrackInit(data).then(() => {
      setState({
        ...state,
        uploading: false,
      })
      setProcess(0)
    });
  }

  const onError = (error: Error, times: any) => {
    setState({
      ...state,
      file: null,
      uploading: false,
    })
    setProcess(0)

    antdMessage.destroy();
    antdMessage.error(error.toString())
    console.log(error, times)
  }

  const onProgress = (progress: string, speed: string) => {
    if (!state.uploading) return
    const [loaded, size] = progress.split("/")
    try {
      const process: number = (parseFloat(loaded) / parseFloat(size)) * 50
      setProcess(process)
    } catch (e) { }
  }

  const onChecks = (file: { size: number; }) => {
    if (userStore.currentLever === '0') {
      return {
        err: true,
        msg: EN.NoAuthority,
      };
    } else if ((+userStore.currentLever === 1 && file.size > 50 * 1024 * 1024) || (userStore.currentLever == '2' && file.size > 50 * 1024 * 1024)) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 50M.',
      };
    } else if (+userStore.currentLever === 3 && file.size > 200 * 1024 * 1024) {
      return {
        err: true,
        msg: EN.FileMustNotExceed + ' 200M.',
      };
    }
    return {
      err: false,
      msg: 'ok'
    }
  }

  const hideSample = () => {
    setState({
      ...state,
      sample: false,
    })
  }

  const selectSample = (filename: string) => {
    if (!!process) return false;

    setState({
      ...state,
      uploading: true,
    })

    axios.post(`http://${config.host}:${config.port}/upload/sample`, { filename }).then(
      data => {
        const { fileId } = data.data
        setProcess(50)
        project.fastTrackInit(fileId).then(() => {
          setState({
            ...state,
            uploading: false
          })
          setProcess(50)
        });
      },
      () => {
        antdMessage.destroy();
        antdMessage.error(EN.Samplefileerror);
      }
    );
    hideSample();
  };

  const hideSql = () => {
    setState({
      ...state,
      sql: false,
    })
  }

  const onClick = (key: string) => () => {
    if (state.uploading || project.etling) return
    if (project.train2ing || !!project.models.length) return setState({
      ...state,
      key,
      visiable: true
    })
    setState({
      ...state,
      key
    })
    onConfirm(key)
  }

  const onConfirm = (key: string = '') => {
    const _key = key || state.key
    if (!_key) return
    onClose()
    if (_key === 'upload') return uploadRef.current && uploadRef.current.show()
    setState({
      ...state,
      [_key]: true
    })
  }

  const onClose = () => {
    setState({
      ...state,
      visiable: false
    })
  }

  const block = (label: React.ReactNode, img: string, key: string) => {
    return (
      <div className={styles.uploadBlock} onClick={onClick(key)}>
        <div className={styles.blockImg}>
          <img src={img} alt={key} />
        </div>
        <div className={styles.blockLabel}>
          <span>{label}</span>
        </div>
      </div>
    );
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!!process) return false;
    let file = e.dataTransfer && e.dataTransfer.files[0];
    setState({
      ...state,
      file
    })
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const closeUpload = () => {
    if (process >= 50) project.abortEtl()
    state.pause && state.pause()
    setState({
      ...state,
      uploading: false,
      file: null
    })
    setProcess(0)
  }

  const databaseSubmit = async (options: any) => {
    hideSql();
    setState({
      ...state,
      isSql: true,
      uploading: true,
    })
    setProcess(0)
    // let processInterval: NodeJS.Timeout;
    const api = await socketStore.ready();
    const resp = await api.downloadFromDatabase({ ...options, type: 'modeling', projectId: project.id }, (res: {
      count: any;
    }) => {
      if (process < 49.9)
        setProcess(process + 0.1)
      if (res.count)
        setState({
          ...state,
          sqlProgress: res.count
        })
    });
    // clearInterval(processInterval);
    if (resp.status !== 200) {
      setState({
        ...state,
        uploading: false
      })
      setProcess(0)
      antdMessage.destroy();
      antdMessage.error(resp.message);
      return
    }
    setProcess(50)
    await project.fastTrackInit({
      originalIndex: resp.originalIndex,
      totalRawLines: state.sqlProgress,
      fileName: options.sqlTable,
      rawHeader: resp.rawHeader
    })
    setState({
      ...state,
      uploading: false
    })
    setProcess(0)
  }

  return (
    <div className={styles.connect} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className={styles.title}>
        <span>{EN.Pleasechooseadata}</span>
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
        {block(EN.FromR2L, sampleIcon, 'sample')}
        {block(EN.FromComp, localFileIcon, 'upload')}
        {block(EN.FromSQL, sqlIcon, 'sql')}
        <Uploader
          onStart={onUpload}
          onComplete={upload}
          onError={onError}
          params={{ userId: userStore.info.id, projectId: project.id }}
          onProgress={onProgress}
          onCheck={onChecks}
          file={state.file}
          ref={uploadRef}
        />
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
        onClose={hideSample}
        selectSample={selectSample}
        visible={state.sample}
      />}
      <DataUploading
        etling={project.etling}
        closeUpload={closeUpload}
        etlProgress={project.etlProgress}
        pause={state.pause}
        resume={state.resume}
        visiable={state.uploading || project.etling}
        isSql={state.isSql}
        process={process}
        sqlProgress={state.sqlProgress} />
      {/* {!!(state.uploading || project.etling) && (
        <div className={styles.sample}>
          <div className={styles.cover} />
          <div className={styles.progressBlock}>
            <div className={styles.progressTitle}>
              <span>{EN.DataImport}</span>
              {<div className={styles.close} onClick={closeUpload}><span>X</span></div>}
            </div>
            <div className={styles.progressContent}>
              <div className={styles.progressLoad}>
                <img src={r2LoadGif} alt="loading" />
              </div>
              <div className={styles.progressing}>
                <ProgressBar
                  progress={process + (project.etlProgress || 0) / 2}
                />
              </div>
              <div className={styles.progressText}>
                <span>{message}</span>
                {(process < 50 && process > 0 && !state.isSql) &&
                  <div className={styles.progressButton}>{!state.isPause ?
                    <span onClick={handleParse}>{EN.Paused}</span> :
                    <span onClick={handleResume}>{EN.Resume}</span>}</div>}
              </div>
            </div>
          </div>
        </div>
      )} */}
      <DatabaseConfig
        options={{}}
        visible={state.sql}
        onClose={hideSql}
        title={EN.DataSourceDatabase}
        projectId={project.id}
        onSubmit={databaseSubmit}
      />
      {<Confirm width={'6em'} visible={state.visiable} title={EN.Warning}
        content={EN.Thisactionmaywipeoutallofyourprevious} onClose={onClose} onConfirm={onConfirm}
        confirmText={EN.Continue} closeText={EN.CANCEL} />}
    </div>
  );
}

export default inject('userStore', 'socketStore', 'projectStore')(observer(DataConnect))
