import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'
import {toJS} from "mobx";

export default function TSENOne(props){
	const {x_name='',y_name='',data={},width=400,height=350} = props;
	const nameTextStyle = {
		color:'#000',
	};
	const option = {
		title: {
			text: '',
			subtext: '',
		},
		grid: {
			left: '6%',
			top:'25%',
			containLabel: true,
		},
		tooltip: {
			showDelay: 0,
			formatter: function (params) {
				return `${x_name}:${params.value[0].toFixed(3)}
						<br/>
					${y_name}:${params.value[1].toFixed(3)}
				`;
			},
			axisPointer:{
				show: true,
				type : 'cross',
				lineStyle: {
					type : 'dashed',
					width : 1,
				},
			},
		},
		xAxis: [
			{
				name: x_name,
				type: 'value',
				nameTextStyle,
				scale: true,
				axisLabel: {
					formatter: '{value}',
					interval:0,
					rotate:30,
				},
				splitLine: {
					show: true,
				},
				nameLocation:'middle',
				nameGap:25,
			},
		],
		yAxis: [
			{
				name: y_name,
				type: 'value',
				scale: true,
				nameTextStyle,
				axisLabel: {
					formatter: '{value}',
				},
				splitLine: {
					show: true,
				},
				nameLocation:'end',
				nameGap:25,
				axisLine:{
					onZero:false
				},
			},
		],
		series:{
			data:Object.values(toJS(data)),
			type:'scatter',
			symbolSize:5,
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
