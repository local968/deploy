import React, { Component } from 'react'
import axios from 'axios'
import NginxUploader from 'components/Common/NginxUploader'

export default class Uploader extends React.Component {
  onChange = (event) => {
    typeof this.props.onStart === 'function' && this.props.onStart()
    const file = event.target.files[0]
    axios.post('/upload/check', { fileSize: file.size }).then(response => {
      this.props.params.token = response.data.token
      this.props.params.fileSize = file.size
      const nu = new NginxUploader(file, this.props)
      this.props.operator(nu)
    })

  }
  render() {
    const { children, className = 'uploader' } = this.props
    const id = `uploader-${Math.floor(Math.random() * 1000)}`;
    return <React.Fragment>
      <label className={className} htmlFor={id}>{children}</label>
      <input type='file' id={id} style={{ display: 'none' }} onChange={this.onChange} />
    </React.Fragment>
  }
}
