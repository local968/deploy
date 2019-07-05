import React from 'react';
import ReactEcharts from 'echarts-for-react';
// import {concat} from 'lodash'
import EN from "../../constant/en";
import _ from 'lodash';

export default function ResidualPlot(props){
	const {chartDate={},title='',width=500,height=300} = props;
	// const data = chartDate.data.map(itm=>[itm[0],itm[2]]);
	const num:any = [];
	const data = _.map(chartDate.data,itm=>{
		const [y,,x] = itm;
		num.push(x);
		return [x,y];
	});

	const max:number = _.max(num);
	const min:number = _.min(num);

	const _max = (max + Math.abs(max-min)/3).toFixed(1);
	const _min = (min - Math.abs(max-min)/3).toFixed(1);

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
			name:EN.Predictvalue,
			axisLine:{show:false},
			nameLocation:'middle',
			nameGap:25,
			nameTextStyle,
			// max:_max,
			// min:_min,
		},
		yAxis: {
			name:EN.residual,
			axisLine:{show:false},
			nameTextStyle,
			// max:_max,
			// min:_min,
		},
		series: [
			{
				type: 'scatter',
				data,
				symbolSize: 3,
			},
			{
				type:'line',
				data:[[_min,0],[_max,0]],
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
