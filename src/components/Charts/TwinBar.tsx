import React from 'react';
import ReactEcharts from 'echarts-for-react';
import { toJS } from 'mobx';
export default function TwinBar(props) {
  const { x, same, diff,x_name,index } = props;
  const x_values = toJS(x);
  const _same = toJS(same);
  const _diff = toJS(diff);

  const option = {
    xAxis: {
      type: typeof x_values[0] === 'number' ? 'value' : 'category',
      data: x_values,
      name:x_name,
      nameLocation:'middle',
      nameGap:20,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: `cluter${index}`,
        type: 'bar',
        data: _same,
        barGap: 0,
      },
      {
        name: 'others',
        type: 'bar',
        data: _diff,
        barGap: 0,
      },
    ],
    legend: {},
    tooltip:{
      trigger: 'axis',
      formatter: function (params) {
        const {axisValue} = params[0];
        let result = axisValue + '<br/>';
        params.forEach(({marker,seriesName,value})=>result+=`${marker}${seriesName}:${value.toFixed(3)}<br/>`);
        return result;
      }
    }
  };

  return (
    <ReactEcharts
      option={option}
      style={{ height: 400, width: 500 }}
      notMerge={true}
      lazyUpdate={true}
      theme="customed"
    />
  );
}
