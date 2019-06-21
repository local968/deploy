import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import { ProgressBar } from 'components/Common';
import r2LoadGif from './R2Loading.gif';
import EN from '../../../constant/en';

interface DataUploadingProps {
  etling: boolean,
  closeUpload: () => void,
  etlProgress: number,
  pause?: () => void,
  resume?: () => void,
  visiable: boolean,
  isSql: boolean,
  process: number,
  sqlProgress: number
};

function DataUploading(props: DataUploadingProps) {
  const { etling, closeUpload, etlProgress, pause, resume, visiable, isSql, process, sqlProgress } = props
  const [isPause, setPause] = React.useState(false);

  const handleParse = () => {
    if (isPause) return
    pause && pause()
    setPause(true)
  }

  const handleResume = () => {
    if (!isPause) return
    resume && resume()
    setPause(false)
  }

  const message = useMemo(() => {
    if (isPause) return EN.Paused;
    if (!isSql && process === 0) return EN.Preparingforupload;
    if (!isSql && process > 0 && process < 50) return EN.Uploadingdata;
    if (process >= 50) return EN.ExtractTransformLoadinprogress;
    if (isSql && process === 0) return EN.Perparingfordatabaseconnection;
    if (isSql && process > 0 && process < 50) return `${EN.DownloadedData} ${sqlProgress}${EN.Rows}`;
  }, [isPause, process, isSql, sqlProgress, etling])

  return visiable ? <div className={styles.sample}>
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
            progress={process + (etlProgress || 0) / 2}
          />
        </div>
        <div className={styles.progressText}>
          <span>{message}</span>
          {(process < 50 && process > 0 && !isSql) &&
            <div className={styles.progressButton}>{!isPause ?
              <span onClick={handleParse}>{EN.Paused}</span> :
              <span onClick={handleResume}>{EN.Resume}</span>}</div>}
        </div>
      </div>
    </div>
  </div> : null
}

export default DataUploading