import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {concat} from 'lodash'
import EN from "../../constant/en";

export default function ResidualPlot(props){
	const {chartDate={},title='',y_name='',width=500,height=300} = props;
	const data = chartDate.data.map(itm=>[itm[0],itm[2]]);
	// @ts-ignore
	const num = concat(...data);

	const max = Math.max(...num);
	const min = Math.min(...num);

	const nameTextStyle = {
		color:'#000',
	};

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
			name:EN.residual,
			axisLine:{show:false},
			nameLocation:'middle',
			nameGap:25,
			nameTextStyle,
		},
		yAxis: {
			name:y_name,
			axisLine:{show:false},
			nameTextStyle,
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
