import React from 'react';
import styles from './styles.module.css';
import searchButton from './search-icon.svg';

export default ({ value, onChange, onClick }) => {
    const change = (e) => {
        onChange(e.target.value);
    }

    const click = (e) => {
        const cb = onClick || onChange;
        cb(e.target.previousSibling.value);
    }

    return <div className={styles.search}>
        <input
            placeholder = "Search your project"
            type="text"
            className={styles.searchName}
            value={value}
            onChange={change}
        />
        <a className={styles.submit} onClick={click}>
            <img
            src={searchButton}
            alt="search"
            />
        </a>
    </div>
}