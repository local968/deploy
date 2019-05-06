import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {concat} from 'lodash'
import './echarts.config'

export default function FitPlot(props){
	const {chartDate={},title='',x_name='',y_name='',width=500,height=300} = props;
	const {data} = chartDate;
	// @ts-ignore
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
				data:[[min-1,min-1],[max+1,max+1]],
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
