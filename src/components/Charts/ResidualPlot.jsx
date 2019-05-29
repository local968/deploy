import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {concat} from 'lodash'

export default function ResidualPlot(props){
	const {chartDate={},title='',x_name='',y_name='',width=500,height=300} = props;
	const {data=[]} = chartDate;
	const num = concat(...data);

	const max = Math.max(...num);
	const min = Math.min(...num);

	const option =  {
		title: {
			text: title,
			x: 'center',
			y: 0,
		},
		tooltip: {
			formatter: '{c}',
		},
		grid:{
			x:`${Math.floor(max+1)}`.length * 10 +20,
		},
		xAxis: {
			name:x_name,
			axisLine:{show:false},
			nameLocation:'middle',
			nameGap:25,
		},
		yAxis: {
			name:y_name,
			axisLine:{show:false},
		},
		series: [
			{
				type: 'scatter',
				data,
				symbolSize: 3,
			},
			{
				type:'line',
				data:[[min-1,0],[max+1,0]],
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
