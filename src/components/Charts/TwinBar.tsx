import React from 'react';
import ReactEcharts from 'echarts-for-react';
import { toJS } from 'mobx';
export default function TwinBar(props) {
  const { x, same, diff,x_name,index } = props;
  const x_values = toJS(x);
  const _same = toJS(same);
  const _diff = toJS(diff);

  const type = x_values.length > _same.length ? 'category':'value';

  const _x_values = [];

  if(type === 'category'){
    x_values.sort((a,b)=>{
      if(!isNaN(a)&&!String(a).includes('e')){
        a = Number(a).toFixed(3);
      }
      if(!isNaN(b)&&!String(b).includes('e')){
        b = Number(b).toFixed(3);
      }
      _x_values.push(`[${b},${a})`);
      return true
    })
  }

  const option = {
    xAxis: {
      type: typeof x_values[0] === 'number' ? type : 'category',
      data: _x_values.length?_x_values:x_values,
      name:x_name,
      nameLocation:'middle',
      nameGap:20,
      axisLabel: {
        // interval:2,
        formatter: value=>{
          if(!isNaN(value)&&!String(value).includes('e')){
            return Number(value).toFixed(3);
          }
          return value;
        },
      },
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
