import React from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'
import './echarts.config'

export default function FitPlot(props){
	const {chartDate={},title='',x_name='',y_name='',width=500,height=300} = props;
	const num:any = [];
	const data = _.map(chartDate.data,itm=>{
		const [x,y] = itm;
		num.push(x,y);
		return [x,y];
	});
	// @ts-ignore
	// const num = _.concat(...data);

	const max:number = _.max(num);
	const min:number = _.min(num);
	const nameTextStyle = {
		color:'#000',
	};

	const option =  {
		title: {
			text: title,
			x: 'center',
			y: 0,
		},
		grid:{
			x:`${Math.floor((max)+1)}`.length * 10 +20,
		},
		tooltip: {
			formatter: '{c}',
		},
		xAxis: {
			name:x_name,
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
