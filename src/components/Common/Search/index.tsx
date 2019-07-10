import React from 'react';
import styles from './styles.module.css';
import searchButton from './search-icon.svg';
import EN from '../../../constant/en';

export default function Search(props) {
  const { value, onChange, onClick } = props;
  const change = e => {
    onChange(e.target.value);
  };

  const click = e => {
    const cb = onClick || onChange;
    cb(e.target.previousSibling.value);
  };

  return (
    <div className={styles.search}>
      <input
        placeholder={EN.SearchProject}
        type="text"
        className={styles.searchName}
        value={value}
        onChange={change}
      />
      <a className={styles.submit} onClick={click}>
        <img src={searchButton} alt="search" />
      </a>
    </div>
  );
}
