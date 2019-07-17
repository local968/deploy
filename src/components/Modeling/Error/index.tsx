import React, { Component } from 'react';
import styles from './styles.module.css';
// import classnames from 'classnames';
// import { observer, inject } from 'mobx-react';
import EN from '../../../constant/en';

export default class ModelError extends Component {
    render() {
        return (
            <div className={styles.error}>
                <span>{EN.TrainingFailed}</span>
            </div>
        );
    }
}