import React from 'react'
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

export default function PredictionDistributions(props){
	const {x_name='',y_name='',fitIndex,chartData,width=500,height=400} = props;
	const {density} = chartData;
	const {POSITIVE,NEGATIVE,PERCENTAGE} = density;
	const _POSITIVE = Object.values(POSITIVE);
	const _NEGATIVE = Object.values(NEGATIVE);
	const _PERCENTAGE = Object.values(PERCENTAGE);

	const data =  [{
		name:'False',
		value:_.zip(_PERCENTAGE,_NEGATIVE),
	},{
		name:'True',
		value:_.zip(_PERCENTAGE,_POSITIVE),
	}];

	const point = data[0].value[fitIndex][0];

	const series = data.map(itm=>({
		type: 'line',
		areaStyle: {},
		name:itm.name,
		data:itm.value,
		symbol: 'circle',
	}));

	const option = {
		xAxis: {
			name:x_name,
			type: 'value',
			boundaryGap: false,
			min:0,
			max:1,
			axisPointer: {
				value: point,
				snap: true,
				lineStyle: {
					// color: '#004E52',
					opacity: 0.5,
					width: 2,
				},

				handle: {
					show: true,
					// color: '#004E52',
					size:35,
					margin:43,
					// icon:'image://https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/home/img/qrcode/zbios_x2_9d645d9.png'
				},
			},
		},
		yAxis: {
			type: 'value',
			name:y_name,
		},
		grid:{
			x2:140,
			y2:80,
		},
		tooltip:{
			triggerOn: 'none',
		},
		legend: {
			orient: 'vertical',
			top: 40,
			right: 0,
			// data: legend,
		},
		series,
		// toolbox: {
		// 	show : true,
		//
		// 	feature : {
		// 		dataZoom: {},
		// 		restore : {show: true},
		// 		saveAsImage : {show: true},
		// 	},
		// },
	};

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
