import React from 'react';
import styles from './styles.module.css';
import axios from 'axios';

export default ({ children, className, onChange }) => {
  const id = `uploader-${Math.floor(Math.random() * 1000)}`;

  const _onChange = e => {
    const files = e.target.files;
    if (files.length === 0) return [];
    const file = files[0];
    console.log(file);
    const formData = new FormData();
    formData.append('data', file);
    axios.post('/api/upload', formData);
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
