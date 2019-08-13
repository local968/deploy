import ReactEcharts from 'echarts-for-react';
import React from 'react';
import _ from 'lodash';

interface Interface {
  data: {
    supports:Array<number>
    confidences:Array<number>
    lifts:Array<number>
  }
}

export default function ScatterPlot(props:Interface) {
  let {supports,confidences,lifts} = props.data;
  let visualMap = false;

  if(lifts){
    lifts = lifts.map(itm=>itm/100);
    visualMap = true;
  }

  const data = _.zip(supports,confidences,lifts);

  const option = {
    visualMap: {
      show:visualMap,
      min: 0,
      max: 1,
      dimension: 2,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['', 'lift'],
      calculable: true,
      inRange: {
        color: ['#f2c31a', '#24b7f2'],
      },
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'cross',
      },
    },
    xAxis: {
      type: 'value',
      name:'support'
    },
    yAxis: {
      type: 'value',
      name : 'confidence'
    },
    series: [{
      type: 'scatter',
      symbolSize: 5,
      data,
    }],
  };
  return <ReactEcharts
    option={option}
    style={{height: '100%', width: '100%'}}
    notMerge={true}
    lazyUpdate={true}
    theme="customed"
  />
}
