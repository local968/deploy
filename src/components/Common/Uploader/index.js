import React, { Component } from 'react';
import styles from './styles.module.css';
import axios from 'axios';
import config from 'config'
import NginxUploader from '../NginxUploader';

const AllowExt = ["csv", "zip", "rar", "tar", "tgz"]

export default class Uploader extends Component {
  componentDidUpdate() {
    const { file } = this.props;
    if (file) {
      const { onError, onStart } = this.props;
      const checkd = this.check(file)
      if (checkd.err) {
        return onError(new Error(checkd.msg), 1)
      }
      if (onStart && typeof onStart === 'function') onStart()
      this.upload()
    }
  }

  check = file => {
    const ext = file.name.split('.').pop()
    if (!ext || !AllowExt.includes(ext)) {
      return {
        err: true,
        msg: 'extension is not allowed'
      };
    }
    return {
      err: false,
      msg: 'ok'
    }
  }

  upload = file => {
    const { params, onProgress, onError, onComplete } = this.props;
    axios.post(`http://${config.host}:${config.port}/upload/check`, { fileSize: file.size, type: 'modeling', projectId: params.projectId }).then(response => {
      if (response.data.status !== 200) return onError(response.data.message)
      const token = response.data.token
      const host = response.data.host
      this.uploader = NginxUploader(file, {
        host,
        onProgress: onProgress,
        onFinished: onComplete,
        onError: this.retry,
        params: {
          ...params,
          token,
          fileSize: file.size,
          type: 'modeling'
        }
      })
    })
  }

  _onChange = e => {
    const files = [...e.target.files];
    e.target.value = null
    if (files.length === 0) return [];

    const file = files[0];

    if (!!file) {
      const { onError, onStart } = this.props;
      const checkd = this.check(file)
      if (checkd.err) {
        return onError(new Error(checkd.msg), 1)
      }
      if (onStart && typeof onStart === 'function') onStart({
        pause: this.pause,
        resume: this.resume
      })
      this.upload(file)
    }
  };

  retry = (error, times) => {
    const { onError } = this.props;
    if (times > 3) {
      if (onError && typeof onError === 'function') {
        onError(error, times);
      }
      return
    }
    this.uploader && this.uploader.resume()
  };

  resume = () => {
    this.uploader && this.uploader.resume()
  }

  pause = () => {
    this.uploader && this.uploader.pause()
  }

  render() {
    const { className, children } = this.props;
    const id = `uploader-${Math.floor(Math.random() * 1000)}`;
    return (
      <React.Fragment>
        <label className={className} htmlFor={id}>
          {children}
        </label>
        <input
          id={id}
          className={styles.input}
          type="file"
          onChange={this._onChange}
          accept={AllowExt.map(n => "." + n).join(",")}
        />
      </React.Fragment>
    );
  }
}
