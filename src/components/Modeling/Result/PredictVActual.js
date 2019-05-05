import React, { Component } from 'react';
import styles from './PredictVActual.module.css';
import { observer } from 'mobx-react';
import RegressionPredictActualChart from 'components/D3Chart/RegressionPredictActualChart';
import { Spin } from 'antd'
import Hint from 'components/Common/Hint'
import EN from '../../../constant/en';

@observer
export default class PredictVActual extends Component {
  render() {
    const { model, project } = this.props;
    // const { selectedModel, qcutSize, chartLoading } = this.props.approach;
    // if (!selectedModel) return null;
    // const { modelName } = selectedModel;
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
        <div className={styles.legends}>
          <div className={styles.legend}>
            <span style={{ backgroundColor: 'lightblue' }} className={styles.circle}/>
            <span className={styles.legendText}> {EN.PredictedValues} </span>
          </div>
          <div className={styles.legend}>
            <span style={{ backgroundColor: 'black' }} className={styles.circle}/>
            <span className={styles.legendText}> {EN.ActualValues} </span>
          </div>
        </div>
        {model.qcut ? <RegressionPredictActualChart
          width={700}
          project={project}
          className={`PredictVActual-${model.modelName}`}
          height={200}
          data={model.qcut}
        /> : <div className={styles.loading}><Spin size='large'/></div>}
      </div>
    );
  }
}
