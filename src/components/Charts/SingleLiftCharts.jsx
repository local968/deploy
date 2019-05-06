import React from 'react'
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

export default function SingleLiftCharts(props){
	const {x_name='',y_name='',chartData,width=500,height=400} = props;
	const {lift} = chartData;
	const {LIFT,PERCENTAGE} = lift;
	const _LIFT = Object.values(LIFT);
	const _PERCENTAGE = Object.values(PERCENTAGE);

	const data =  _.zip(_PERCENTAGE,_LIFT);

	const option = {
		xAxis: {
			name:x_name,
			axisLabel: {
				formatter: value=> `${value*100}%`,
			},
		},
		yAxis: {
			name:y_name,
		},
		series:{
			type: 'line',
			symbolSize: 0,
			data,
			smooth: true,
		},
	};

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
