import React, { Component } from 'react';
import styles from './styles.module.css';
// import axios from 'axios';
import NginxUploader from '../NginxUploader';

export default class Uploader extends Component {
  componentDidUpdate() {
    const { file } = this.props;
    if (file) {
      const { onError } = this.props;
      const checkd = this.check(file)
      if (checkd.err) {
        return onError(new Error(checkd.msg), 1)
      }
      this.upload()
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

  upload = file => {
    const { params, onProgress, onComplete } = this.props;
    this.uploader = NginxUploader(file, {
      onProgress: onProgress,
      onFinished: onComplete.bind(null, file),
      onError: this.retry,
      params
    })
  }

  _onChange = e => {
    const files = e.target.files;
    if (files.length === 0) return [];

    const file = files[0];
    // console.log('file change')
    // const { params, onProgress, onComplete } = this.props;
    // const uploader = NginxUploader(file, {
    //   onProgress: console.log,
    //   onError: console.log,
    //   onFinished: console.log,
    //   params: params
    // })
    // return

    if (!!file) {
      const { onError } = this.props;
      const checkd = this.check(file)
      if (checkd.err) {
        return onError(new Error(checkd.msg), 1)
      }
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
        />
      </React.Fragment>
    );
  }
}
