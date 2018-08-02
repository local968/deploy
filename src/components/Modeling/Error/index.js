import React, { Component } from 'react';
import styles from './styles.module.css';
// import classnames from 'classnames';
// import { observer, inject } from 'mobx-react';


export default class ModelError extends Component {
    render() {
        return (
            <div className={styles.error}>
                <span>Training Failed</span>
            </div>
        );
    }
}