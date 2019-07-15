import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from '../styles.module.css';
import EN from '../../../../constant/en';
import PredictedProgress from './PredictedProgress'
import classnames from 'classnames'
interface Interface {
  model:any
  yes:any
  no:any
}
@observer
export default class Predicted extends Component<Interface> {
  render() {
    const { model, yes, no } = this.props;
    return (
      <div className={styles.progressBox}>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[0]}
            width={3.5}
            label={no}
            type={'success'}
            failType={'fail'}
          />
        </div>
        <div className={styles.progressBlock}>
          <PredictedProgress
            predicted={model.predicted[1]}
            width={3.5}
            label={yes}
            type={'predicted'}
            failType={'failPredicted'}
          />
        </div>
        <div className={styles.progressMeans}>
          <div className={styles.progressMean}>
            <div
              className={classnames(styles.progressSquare, styles.success)}
            />
            <div
              className={styles.progressMeanText}
              title={`${EN.Actual}: ${no} ${EN.Predicted}: ${no}`}
            >
              <span>
                {EN.Actual}: {no}
              </span>
              <span>
                {EN.Predicted}: {no}
              </span>
            </div>
          </div>
          <div className={styles.progressMean}>
            <div
              className={classnames(styles.progressSquare, styles.predicted)}
            />
            <div
              className={styles.progressMeanText}
              title={`${EN.Actual}: ${yes} ${EN.Predicted}: ${yes}`}
            >
              <span>
                {EN.Actual}: {yes}
              </span>
              <span>
                {EN.Predicted}: {yes}
              </span>
            </div>
          </div>

          <div className={styles.progressMean}>
            <div className={classnames(styles.progressSquare, styles.fail)} />
            <div
              className={styles.progressMeanText}
              title={`${EN.Actual}: ${no} ${EN.Predicted}: ${yes}`}
            >
              <span>
                {EN.Actual}: {no}
              </span>
              <span>
                {EN.Predicted}: {yes}
              </span>
            </div>
          </div>

          <div className={styles.progressMean}>
            <div
              className={classnames(
                styles.progressSquare,
                styles.failPredicted,
              )}
            />
            <div
              className={styles.progressMeanText}
              title={`${EN.Actual}: ${yes} ${EN.Predicted}: ${no}`}
            >
              <span>
                {EN.Actual}: {yes}
              </span>
              <span>
                {EN.Predicted}: {no}
              </span>
            </div>
          </div>

          {/*<div className={styles.progressMean}>*/}
          {/*  <div className={classnames(styles.progressSquare, styles.different)} />*/}
          {/*  <div className={styles.progressMeanText} title={`${EN.Actual} & ${EN.Predicted} ${EN.Different}`}><span>{EN.Actual} &</span><span>{EN.Predicted}</span><span>{EN.Different}</span></div>*/}
          {/*</div>*/}
        </div>
      </div>
    );
  }
}
