import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'
import _ from 'lodash';

/**
 * Histogram-Categorical
 */

export default function HistogramCategorical(props){
  let {
    x_name='',
    y_name='',
    data=[],
    title='',
    height = 330,
    width = 500,
  } = props;

  const max = Math.max(...data.map(itm=>itm[1]));

  const nameTextStyle = {
    color:'#000',
  };

  const fontSize = 15;

  title = _.chunk([...title],35).map(itm=>itm.join('')).join('\n');
  const option = {
    title: {
      text: title,
      x: 'center',
      textStyle:{
        fontSize,
      }
    },
    xAxis: {
      name:x_name,
      type: 'category',
      data: data.map((itm)=>itm.name),
      nameLocation:'middle',
      nameTextStyle,
      nameGap:25,
      axisLabel:{
        interval:0,
        rotate:30,
      },
    },
    yAxis: {
      name:y_name,
      nameTextStyle,
      type: 'value',
    },
    grid:{
      x:`${Math.floor(max+1)}`.length * 10 +20,
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
