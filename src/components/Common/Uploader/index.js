import React from 'react';
import styles from './styles.module.css';
import axios from 'axios';

export default ({
  children,
  className,
  params,
  onChange,
  onProgress,
  onComplete
}) => {
  const id = `uploader-${Math.floor(Math.random() * 1000)}`;
  const blobSlice =
    File.prototype.mozSlice ||
    File.prototype.webkitSlice ||
    File.prototype.slice;
  const chunkSize = 2097152;
  let retryCount = 0;

  const _upload = (file, start = 0, isFirst = true) => {
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    const chunk = blobSlice.call(file, start, end);
    const formData = new FormData();
    formData.append('data', chunk);
    axios
      .post('/api/upload', formData, {
        params: Object.assign(params, {
          start: start,
          filename: file.name,
          size: chunk.size,
          isFirst
        }),
        onUploadProgress: function(progressEvent){
          if(onProgress && typeof onProgress === "function") onProgress(progressEvent);
        }
      })
      .then(
        res => {
          if (res.status !== 200) {
            return retry(
              file,
              start,
              isFirst,
              res.data ? res.data.message : 'upload error'
            );
          }
          retryCount = 0;
          if (file.size === res.data.size) {
            if (onComplete && typeof onComplete === 'function') {
              onComplete(file);
            }
            return;
          }
          _upload(file, res.data.size, res.data.isFirst);
        },
        () => {
          console.log('upload error');
        }
      );
  };

  const _onChange = e => {
    const files = e.target.files;
    if (files.length === 0) return [];

    const file = files[0];
    if (!!file) {
      _upload(file);
      typeof onChange === 'function' && onChange({ file });
    }
  };

  const retry = (file, start, isFirst, message = 'upload error') => {
    retryCount++;
    if (retryCount === 3) {
      return onChange({ err: message });
    }
    setTimeout(_upload(file, start, isFirst), retryCount * 500);
  };

  return (
    <React.Fragment>
      <label className={className} htmlFor={id}>
        {children}
      </label>
      <input
        id={id}
        className={styles.input}
        type="file"
        onChange={_onChange}
      />
    </React.Fragment>
  );
};
