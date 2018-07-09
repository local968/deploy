import React from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';

export default ({disabled, onClick, text}) => {
    return <div className={styles.button}>
        <button disabled={disabled} onClick={onClick} className={classnames(styles.continue,{
            [styles.disabled]: disabled
        })}>{text}</button>
    </div>
}