import React from 'react'
import axios from 'axios'
import config from 'config'
import EsUploader from 'components/Common/EsUploader'
import { message } from 'antd';
import EN from '../../constant/en';
const AllowExt = ["csv", "CSV"]

export default class Uploader extends React.Component {

  check = file => {
    const ext = file.name.split('.').pop()
    return (!ext || !AllowExt.includes(ext)) ? false : true
  }

  onChange = (event) => {
    const file = event.target.files[0]
    if (!this.check(file)) return message.error(EN.Pleaseuploadafileintheformatofcsv)
    typeof this.props.onStart === 'function' && this.props.onStart()
    axios.post(`/upload/check`, { fileSize: file.size, type: 'deploy', projectId: this.props.params.projectId }).then(response => {
      this.props.params.token = response.data.token
      this.props.params.fileSize = file.size
      const nu = new EsUploader(file, { ...this.props, host: response.data.host })
      this.props.operator(nu)
    })

  }
  render() {
    const { children, className = 'uploader' } = this.props
    const id = `uploader-${Math.floor(Math.random() * 1000)}`;
    return <React.Fragment>
      <label className={className} htmlFor={id}>{children}</label>
      <input type='file' id={id} style={{ display: 'none' }} onChange={this.onChange} accept={AllowExt.map(n => "." + n).join(",")} />
    </React.Fragment>
  }
}
