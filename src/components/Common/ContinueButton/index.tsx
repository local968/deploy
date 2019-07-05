import React from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';

export default function ContinueButton(props){
    const {disabled, onClick, text, width} = props;
    return <div className={styles.button} style={{width: width || "1.1em"}}>
        <button disabled={disabled} onClick={onClick} className={classnames(styles.continue,{
            [styles.disabled]: disabled
        })}>{text}</button>
    </div>
}
