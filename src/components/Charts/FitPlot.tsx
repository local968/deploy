import React from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'
import './echarts.config'

export default function FitPlot(props){
	const {chartDate={},title='',x_name='',y_name='',width=500,height=300} = props;
	const num:any = [];
	const data = _.map(chartDate.data,itm=>{
		const [x,y] = itm;
		num.push(x,y);
		return [x,y];
	});

	const max:number = _.max(num);
	const min:number = _.min(num);
	const nameTextStyle = {
		color:'#000',
	};

  const _max = (max + Math.abs(max-min)/3).toFixed(1);
  const _min = (min - Math.abs(max-min)/3).toFixed(1);

	const option =  {
		title: {
			text: title,
			x: 'center',
			y: 0,
		},
		grid:{
			x:`${Math.floor((max)+1)}`.length * 10 +20,
		},
		tooltip: {
			formatter: params=>{
				const [x,y] = params.value;
				return `
						${x_name}:${x}<br/>
						${y_name}:${y}
					`;
			}
		},
		xAxis: {
			name:x_name,
			axisLine:{show:false},
			nameLocation:'middle',
			nameGap:25,
			nameTextStyle,
      max:_max,
      min:_min,
		},
		yAxis: {
			name:y_name,
			axisLine:{show:false},
			nameTextStyle,
      max:_max,
      min:_min,
		},
		series: [
			{
				type: 'scatter',
				data,
				symbolSize: 3,
			},
			{
				type:'line',
				data:[[_min,_min],[_max,_max]],
				symbolSize: 0,
			},
		],
	};

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
