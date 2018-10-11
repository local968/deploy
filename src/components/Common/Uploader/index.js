import React, { Component } from 'react';
import styles from './styles.module.css';
import axios from 'axios';
import NginxUploader from '../NginxUploader';

export default class Uploader extends Component {
  constructor(props) {
    super(props);
    this.id = `uploader-${Math.floor(Math.random() * 1000)}`;
    this.blobSlice =
      File.prototype.mozSlice ||
      File.prototype.webkitSlice ||
      File.prototype.slice;
    this.chunkSize = 2097152;
    this.retryCount = 0;
  }

  componentDidUpdate() {
    const { file, onChange } = this.props;
    if (file) {
      const checkd = this.check(file)
      if (onChange && typeof onChange === 'function') {
        onChange({ file, checkd })
      }
      if (!checkd.err) {
        this._upload(file);
      }
      return null;
    }
  }

  check = file => {
    if (file.name.split('.').slice(-1)[0] !== 'csv') {
      console.error('extension is not csv');
      return {
        err: true,
        msg: 'extension is not csv'
      };
    }
    return {
      err: false,
      msg: 'ok'
    }
  }

  _upload = (file, start = 0, isFirst = true) => {
    const { params, onProgress, onComplete } = this.props;
    const end = start + this.chunkSize >= file.size ? file.size : start + this.chunkSize;
    const chunk = this.blobSlice.call(file, start, end);
    const formData = new FormData();
    formData.append('data', chunk);
    axios
      .post('/api/upload', formData, {
        params: Object.assign(params, {
          start: start,
          filename: file.name,
          size: chunk.size,
          isFirst
        })
      })
      .then(
        res => {
          if (res.status !== 200) {
            return this.retry(
              file,
              start,
              isFirst,
              res.data ? res.data.message : 'upload error'
            );
          }
          this.retryCount = 0;
          if (onProgress && typeof onProgress === 'function') {
            onProgress(res.data.size, file.size)
          }
          if (file.size === res.data.size) {
            if (onComplete && typeof onComplete === 'function') {
              onComplete(file);
            }
            return;
          }
          this._upload(file, res.data.size, res.data.isFirst);
        },
        () => {
          console.log('upload error');
        }
      );
  }

  _onChange = e => {
    const files = e.target.files;
    if (files.length === 0) return [];

    const { onChange } = this.props;
    const file = files[0];
    const { params, onProgress, onComplete } = this.props;

    axios.post('/upload/check', { fileSize: file.size }).then(response => {
      const token = response.data.token
      const uploader = NginxUploader(file, {
        onProgress: console.log,
        onError: console.log,
        onFinished: console.log,
        params: {
          ...params,
          userId: '95b1e501-3ada-4571-a33a-28e230ed8b63',
          token
        }
      })
    })
    return

    if (!!file) {
      const checkd = this.check(file)
      if (onChange && typeof onChange === 'function') {
        onChange({ file, checkd })
      }
      if (!checkd.err) {
        this._upload(file);
      }
    }
  };

  retry = (file, start, isFirst, message = 'upload error') => {
    const { onChange } = this.props;
    this.retryCount++;
    if (this.retryCount === 3) {
      if (onChange && typeof onChange === 'function') {
        onChange({ err: message });
      }
      return
    }
    setTimeout(this._upload.bind(null, file, start, isFirst), this.retryCount * 500);
  };

  render() {
    const { className, children } = this.props;
    return (
      <React.Fragment>
        <label className={className} htmlFor={this.id}>
          {children}
        </label>
        <input
          id={this.id}
          className={styles.input}
          type="file"
          onChange={this._onChange}
        />
      </React.Fragment>
    );
  }
}
