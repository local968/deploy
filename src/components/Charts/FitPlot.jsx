import React from 'react'
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'

export default function FitPlot(){
	const result = {
		title:'fit plot',
		x_name:'x_name',
		y_name:'y_name',
		data:[
			[10.0, 8.04],
			[8.0, 6.95],
			[13.0, 7.58],
			[9.0, 8.81],
			[11.0, 8.33],
			[14.0, 9.96],
			[6.0, 7.24],
			[4.0, 4.26],
			[12.0, 10.84],
			[7.0, 4.82],
			[6.0, 5.68]
		]
	};
	
	const {data,title} = result;
	
	const num = _.concat(...data);
	
	const max = Math.max(...num);
	const min = Math.min(...num);
	
	const markLineOpt = {
		animation: true,
		label: {
			normal: {
				textStyle: {
					align: 'right'
				}
			}
		},
		lineStyle: {
			normal: {
				type: 'dotted',
			}
		},
		data: [[{
			coord: [min-1,min-1],
			symbol: 'none'
		}, {
			coord: [max+1,max+1],
			symbol: 'none'
		}]]
	};
	
	const option =  {
		title: {
			text: title,
			x: 'center',
			y: 0
		},
		tooltip: {
			formatter: '{c}'
		},
		xAxis: {
			min: 0,
			max: 20,
			name:result.x_name,
			axisLabel: {
				formatter: function (val) {
					return val
				}
			}
		},
		yAxis: {
			min: 0,
			max: 15,
			name:result.y_name,
			axisLabel: {
				formatter: function (val) {
					return val
				}
			}
		},
		series: [
			{
				name: 'I',
				type: 'scatter',
				xAxisIndex: 0,
				yAxisIndex: 0,
				data,
				markLine: markLineOpt
			},
		]
	};
	return <ReactEcharts
		option={option}
		style={{height: 400, width: 1000}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
