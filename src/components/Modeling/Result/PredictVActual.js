import React, { Component } from 'react';
import styles from './PredictVActual.module.less';
import { observer } from 'mobx-react';
import RegressionPredictActualChart from 'components/D3Chart/RegressionPredictActualChart';

@observer
export default class PredictVActual extends Component {
  componentWillMount() {
    this.props.project.pointToShow();
  }
  render() {
    const {model, project} = this.props;
    // const { selectedModel, qcutSize, chartLoading } = this.props.approach;
    // if (!selectedModel) return null;
    // const { modelName } = selectedModel;
    return (
      <div className={styles.predictActual}>
        <div className={styles.title} >
          Predicted VS Actual Plot (Sorted)
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
        <RegressionPredictActualChart
          width={700}
          project={project}
          className={`PredictVActual-${model.name}`}
          height={200}
          data={model.qcut}
        />
        {/* {chartLoading ?
          <Loading /> :
        }
        <GroupSize approach={this.props.approach} model={selectedModel} /> */}
      </div>
    );
  }
}