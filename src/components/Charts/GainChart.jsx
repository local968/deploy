import React from 'react'
import ReactEcharts from 'echarts-for-react';

export default function GainChart(props){
	const {x_name='',y_name='',width=600,height=400,model,isHoldout} = props;
	const {holdoutChartData,chartData} = model;
	const {lift={}} = isHoldout?holdoutChartData:chartData;

	const data =  Object.values(lift.GAIN||{})
		.map((itm,index)=>[(index+1)/10,itm]);
	
	// data.unshift([0,0]);

	const option = {
		xAxis: {
			name:x_name,
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
		grid:{
			x2:150
		}
	};

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
