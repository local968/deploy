import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'

/**
 * Histogram-Categorical
 */

export default function HistogramCategorical(props){
  const {
    x_name='',
    y_name='',
    data=[],
    title='',
    height = 330,
    width = 500,
  } = props;

  const option = {
    title: {
      text: title,
      x: 'center',
    },
    xAxis: {
      name:x_name,
      type: 'category',
      data: data.map((itm)=>itm.name),
      nameLocation:'middle',
      nameGap:25,
    },
    yAxis: {
      name:y_name,
      type: 'value',
    },
    series: [{
      data: data.map((itm)=>itm.value),
      type: 'bar',
      label:{
        show:true,
      },
    }],
  };

  return <ReactEcharts
    option={option}
    style={{height, width}}
    notMerge={true}
    lazyUpdate={true}
    theme="customed"
  />
}
