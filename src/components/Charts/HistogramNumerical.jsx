import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'

export default function HistogramNumerical(props){
	const {
		data=[],
		x_name='',
		y_name='',
		title='',
		height = 330,
		width = 500,
	} = props;
	const nameTextStyle = {
		color:'#000',
	};
	const option = {
		title: {
			text: title,
			x: 'center',
		},
		xAxis: {
			type: 'category',
			name:x_name,
			nameLocation:'middle',
			nameGap:25,
			nameTextStyle,
	        axisLabel:{
	            interval:Math.floor((data.length/5)),
	            formatter: (value)=>value.toFixed(2),
	        },
		},
		yAxis: {
			type: 'value',
			name:y_name,
			nameTextStyle,
		},
		series: [{
			data,
			type: 'bar',
		}],
	};

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
