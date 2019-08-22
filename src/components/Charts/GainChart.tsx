import React from 'react'
import ReactEcharts from 'echarts-for-react';

interface Interface {
	x_name:string
	y_name:string
	width?:number
	height?:number
	model:any
	isHoldout:boolean
}

export default function GainChart(props:Interface){
	const {x_name='',y_name='',width=600,height=400,model,isHoldout} = props;
	const {holdoutChartData,chartData} = model;
	const {lift={}} = isHoldout?holdoutChartData:chartData;

	const data =  Object.values(lift.GAIN||{})
		.map((itm,index)=>[(index+1)*10,itm]);

	data.unshift([0,0]);

	const option = {
		xAxis: {
			name:x_name,
			axisLabel:{
				formatter: '{value}%'
			}
		},
		yAxis: {
			name:y_name,
			axisLabel:{
				formatter: '{value}%'
			}
		},
		series:{
			type: 'line',
			symbolSize: 0,
			data,
			smooth: false,
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
