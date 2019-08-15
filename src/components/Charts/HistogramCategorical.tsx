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
  across?:boolean
}

export default function HistogramCategorical(props:Interface){
  let {
    x_name='',
    y_name='',
    data=[],
    xAxisName = data.map((itm)=>itm.name),
    title = `Feature:${x_name}`,
    across,
  } = props;

  const dt = data.map(itm=>itm.value);

  const max = _.max(dt);
  const sum = _.sum(dt);

  const nameTextStyle = {
    color:'#000',
  };

  const fontSize = 15;

  title = _.chunk([...title],35).map(itm=>itm.join('')).join('\n');

  let _data = data.map((itm)=>itm.value);
  const series = [{
    data: _data,
    type: 'bar',
    label:{
      show:true,
    },
    itemStyle:{},
    barGap:'-100%',
  }];
  const dataZoom = {
    type: 'inside',
    zoomLock:true,
    start: 0,
    end: 100 / data.length * 8,
    orient:"horizontal",
  };

  if(across){
    _data.reverse();
    series[0].data = _data.map((itm,index)=>{
        if(index%2){
          return '-'
        }
        return itm
    });
    series[0].itemStyle={
      normal:{
        color : '#b2bcc4'
      }
    };
    series.push({
      data: _data.map((itm,index)=>{
        if(index%2){
          return itm
        }
        return '-'
      }),
      type: 'bar',
      barGap:'-100%',
      label:{
        show:true,
      },
      itemStyle:{
        normal:{
          color : '#ffcc78'
        }
      }
    });
    /////////////////////////
    dataZoom.orient = "vertical";
    dataZoom.start = 100;
    dataZoom.end = 100 - 100 / data.length * 8;
  }

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
      type: across?"value":'category',
      data: across?null:xAxisName,
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
      type: across?'category':"value",
      data: across?xAxisName.reverse():null,
    },
    dataZoom,
    grid:{
      x:`${Math.floor(+max+1)}`.length * 10 +20,
    },
    series,
  };

  return <ReactEcharts
    option={option}
    style={{height:"100%", width:"100%"}}
    notMerge={true}
    lazyUpdate={true}
    theme="customed"
  />
}
