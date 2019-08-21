import React, { Component } from 'react';
import styles from './styles.module.css';
import axios from 'axios';
import config from 'config'
// import NginxUploader from '../NginxUploader';
import EsUploader from '../EsUploader';
import EN from '../../../constant/en'
const AllowExt = ["csv", "CSV"]

export default class Uploader extends Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

  componentWillReceiveProps(props) {
    const { file, onError, onStart } = props
    if (!file) return
    const checkd = this.check(file)
    if (checkd.err) {
      return onError(new Error(checkd.msg), 1)
    }
    if (onStart && typeof onStart === 'function') onStart({
      pause: this.pause,
      resume: this.resume,
      abort: this.abort
    })
    this.upload(file)
  }

  show() {
    if (this.inputRef.current) this.inputRef.current.click()
  }

  // componentDidUpdate() {
  //   const { file } = this.props;
  //   if (file) {
  //     const { onError, onStart } = this.props;
  //     const checkd = this.check(file)
  //     if (checkd.err) {
  //       return onError(new Error(checkd.msg), 1)
  //     }
  //     if (onStart && typeof onStart === 'function') onStart()
  //     this.upload()
  //   }
  // }

  check = file => {
    const ext = file.name.split('.').pop()
    if (!ext || !AllowExt.includes(ext)) {
      return {
        err: true,
        msg: EN.PleaseUploaafileinoneofthefollowingformats
      };
    }
    return {
      err: false,
      msg: EN.OK
    }
  }

  upload = file => {
    const { params, onProgress, onError, onComplete, charset, afterClose } = this.props;
    axios.post(`/upload/check`, { fileSize: file.size, type: 'modeling', projectId: params.projectId }).then(response => {
      if (response.data.status !== 200) return onError(response.data.message)
      const token = response.data.token
      const host = response.data.host
      this.uploader = EsUploader(file, {
        host,
        onProgress: onProgress,
        onFinished: onComplete,
        onError: this.retry,
        charset,
        params: {
          ...params,
          token,
          fileSize: file.size,
          type: 'modeling'
        },
        afterClose: afterClose
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
        resume: this.resume,
        abort: this.abort
      })
      this.upload(file)
    }
  };

  retry = (error) => {
    const { onError } = this.props;
    // if (times > 3) {
    if (onError && typeof onError === 'function') {
      onError(error, 1);
    }
    return
    // }
    // this.uploader && this.uploader.resume()
  };

  resume = () => {
    this.uploader && this.uploader.resume()
  }

  pause = () => {
    this.uploader && this.uploader.pause()
  }

  abort = () => {
    console.log(this.uploader, "abort")
    this.uploader && this.uploader.abort()
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
          ref={this.inputRef}
        />
      </React.Fragment>
    );
  }
}
