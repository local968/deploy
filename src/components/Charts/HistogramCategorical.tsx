import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'
import _ from 'lodash';
import EN from '../../constant/en';

/**
 * Histogram-Categorical
 */

interface Interface {
  title?:string
  data:Array<any>
  x_name?:string
  y_name?:string
  height?:number
  width?:number
  xAxisName?:Array<string>
}

export default function HistogramCategorical(props:Interface){
  let {
    x_name='',
    y_name='',
    data=[],
    xAxisName = data.map((itm)=>itm.name),
    title = `Feature:${x_name}`,
  } = props;

  const dt = data.map(itm=>itm.value);

  const max = _.max(dt);
  const sum = _.sum(dt);

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
    tooltip: {
      showDelay: 0,
      formatter: function (params) {
        const {name,value} = params;
        return `${name}:${(100*value/sum).toFixed(3)}%`
      }
    },
    toolbox:{
      show : data.length>8,
      right:30,
      itemSize:20,
      feature : {
        restore:{
          title:EN.restore,
        },
      },
    },
    xAxis: {
      name:x_name,
      type: 'category',
      data: xAxisName,
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
    dataZoom:{
      type: 'inside',
      zoomLock:true,
      start: 0,
      end: 100 / data.length * 8
    },
    grid:{
      x:`${Math.floor(+max+1)}`.length * 10 +20,
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
    style={{height:"100%", width:"100%"}}
    notMerge={true}
    lazyUpdate={true}
    theme="customed"
  />
}
