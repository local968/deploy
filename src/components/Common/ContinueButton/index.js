import React from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';

export default ({disabled, onClick, text, width,show=true}) => {
    return <div className={styles.button}
                style={{
                    width: width || "1.1em",
                    display:(show?'':'none'),
                }}
    >
        <button disabled={disabled} onClick={onClick} className={classnames(styles.continue,{
            [styles.disabled]: disabled
        })}>{text}</button>
    </div>
}
