import React, { Component } from 'react';
import styles from './PredictVActual.module.less';
import { observer } from 'mobx-react';
import RegressionPredictActualChart from 'components/D3Chart/RegressionPredictActualChart';
import { Spin } from 'antd'
import Hint from 'components/Common/Hint'

@observer
export default class PredictVActual extends Component {
  render() {
    const { model, project } = this.props;
    // const { selectedModel, qcutSize, chartLoading } = this.props.approach;
    // if (!selectedModel) return null;
    // const { modelName } = selectedModel;
    return (
      <div className={styles.predictActual}>
        <div className={styles.title} >
          Predicted VS Actual Plot (Sorted)<Hint content={<p>How was the plot created?<br />
            1. Sort the data by the actual target value<br />
            2. From the smallest target variable, group every 100 data points into one group<br />
            3. Calculate the mean value of predicted target values and the actual target values of each group and plot it on the graph<br />
            How do I interprete it?<br />
            We aim to get you a sense of how accurate the model is by comparing the predicted V.S actual value. Also you may find some pattern.</p>} />
        </div>
        <div className={styles.legends} >
          <div className={styles.legend}>
            <span style={{ backgroundColor: 'lightblue' }} className={styles.circle} ></span>
            <span className={styles.legendText} > Predicted Values </span>
          </div>
          <div className={styles.legend}>
            <span style={{ backgroundColor: 'black' }} className={styles.circle}></span>
            <span className={styles.legendText}> Actual Values </span>
          </div>
        </div>
        {model.qcut ? <RegressionPredictActualChart
          width={700}
          project={project}
          className={`PredictVActual-${model.name}`}
          height={200}
          data={model.qcut}
        /> : <div className={styles.loading}><Spin size='large'></Spin></div>}
        {/* {chartLoading ?
          <Loading /> :
        }
        <GroupSize approach={this.props.approach} model={selectedModel} /> */}
      </div>
    );
  }
}
