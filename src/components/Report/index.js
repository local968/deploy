import React, { Component ,Fragment} from 'react'
import styles from './styles.module.css'
import { observer, inject } from 'mobx-react';
import j from '../../stores/classification'
import HistogramCategorical from "../Charts/HistogramCategorical";
import HistogramNumerical from "../Charts/HistogramNumerical";
import UnivariantPlots from "../Charts/UnivariantPlots";
import CorrelationMatrixs from "../Charts/CorrelationMatrixs";
import TSENOne from "../Charts/TSENOne";
import BoxPlots from "../Charts/BoxPlots";
import EN from "../../constant/en";
import PredictedVsActualPlot from "../Charts/PredictedVsActualPlot";
@inject('projectStore')
@observer
class Report extends Component {
  
  charts(itm){
    const {name,data} = itm;
    let chart;
    switch(name){
      case 'histogram-categorical':
        chart = <HistogramCategorical
            x_name={'value'}
            y_name={'count'}
            title={`Feature:value`}
            data={data}
        />;
        break;
      case 'histogram-numerical':
        chart = <HistogramNumerical
            x_name={'value'}
            y_name={'count'}
            title={`Feature:value`}
            data={data}
        />;
        break;
      // case 'classification-categorical':
      //   chart = <TSENOne
      //       x_name={'message.x'}
      //       y_name={'message.y'}
      //       result={data}
      //   />;
      //   break;
      case 'classification-numerical':
        chart = <UnivariantPlots
            x_name={'message.x'}
            y_name={'message.y'}
            result={data}
        />;
        break;
      case 'correlation-matrix':
        chart = <CorrelationMatrixs
            value={data.value}
            type={data.type}
        />;
        break;
      case 'regression-numerical':
        chart = <TSENOne
            x_name={'message.x'}
            y_name={'message.y'}
            data={data}
        />;
        break;
      case 'regression-categorical':
        chart = <BoxPlots
            x_keys={data.x_keys}
            value={data.value}
        />;
        break;
      case 'predicted-vs-actual-plot':
        chart = <PredictedVsActualPlot
            x_name = {EN.PointNumber}
            y_name = {'project.target' + '的组内平均值'}
            data={data.data}
        />;
        break;
    }
    return chart
  }

  render() {
    return <div className={styles.report}>
      {
          j.map((itm,ind)=>{
            return <Fragment key={ind}>{this.charts(itm)}</Fragment>
          })
      }
    </div>
  }
}

export default Report
