import React, { Component } from 'react';
import styles from './PredictVActual.module.css';
import { observer } from 'mobx-react';
import Hint from 'components/Common/Hint'
import EN from '../../../constant/en';

@observer
export default class PredictVActual extends Component {
  render() {
    return (
      <div className={styles.predictActual}>
        <div className={styles.title}>
          {EN.PredictedVSActualPlotSorted}<Hint content={<p>{EN.Howwastheplotcreate}<br/>
          {EN.Sortthedatabythe}<br/>
          {EN.Dividealldatapoints}<br/>
          {EN.Calculatethemeanvalue}<br/>
          {EN.HowdoIinterprete}<br/>
          {EN.Weaimtogetyouasense}</p>}/>
        </div>
      </div>
    );
  }
}
