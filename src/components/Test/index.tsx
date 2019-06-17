import React from 'react'
import esUploader from 'components/Common/EsUploader/upload'

export default () => {
  return <div>hello ts<Uploader /></div>
  // return null
}

const Uploader = () => {
  const onChange = (event) => {
    const file = event.target.files[0]
    const a: any = window
    a.aaa = esUploader(file, { onProgress: console.log })
  }
  return <input type='file' onChange={onChange} />
}
