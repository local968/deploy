import React from 'react';
import styles from './styles.module.css';
import axios from 'axios';
import {message} from 'antd';

export default ({ children, className, params, onChange, onProgress }) => {
  const id = `uploader-${Math.floor(Math.random() * 1000)}`;

  const _onChange = e => {
    const files = e.target.files;
    if (files.length === 0) return [];
    const file = files[0];
    const formData = new FormData();
    formData.append('data', file);
    axios.post('/api/upload', formData, {
      params: params,
      onUploadProgress: function(progressEvent){
        if(onProgress && typeof onProgress === "function") onProgress(progressEvent);
      }
    }).then(res => {
      if(res.status === 500){
        message(res.data.message);
        return onChange({err:res.data.message});
      }
      onChange(Object.assign({},res.data,{file}));
    });
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
