import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'

export default function TSENOne(props){
	const {x_name='',y_name='',data={},width=400,height=400} = props;
	const option = {
		title: {
			text: '',
			subtext: '',
		},
		grid: {
			left: '6%',
			// right: '10%',
			// bottom: '4%',
			containLabel: true,
		},
		tooltip: {
			showDelay: 0,
			formatter: function (params) {
				if (params.value.length > 1) {
					return params.seriesName + ' :<br/>'
						+ params.value[0]
						+ params.value[1];
				} else {
					return params.seriesName + ' :<br/>'
						+ params.name + ' : '
						+ params.value;
				}
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
				scale: true,
				axisLabel: {
					formatter: '{value}',
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
				axisLabel: {
					formatter: '{value}',
				},
				splitLine: {
					show: true,
				},
				nameLocation:'middle',
				nameGap:25,
			},
		],
		series:{
			data:Object.values(data),
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
