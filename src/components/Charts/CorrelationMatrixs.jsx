import React from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'

export default function CorrelationMatrixs(props){
	const {value=[],type=[''],height=400,width=500} = props;

	let data = [];
	value.map((itm,index)=>{
		itm.forEach((it,ind)=>{
			data.push([index,ind,it]);
		})
	});

	data = data.map((item)=> [item[1], item[0], item[2] || '-']);
	
	const len = Math.max(...type.map(itm=>itm.length));
	const nameTextStyle = {
		color:'#000',
	};

	const option = {
		tooltip: {
			position: 'top',
		},
		animation: true,
		grid: {
			x:8 * len + 10,
			y:4 * len+20,
		},
		xAxis: {
			type: 'category',
			data: type,
			position:'top',
			axisLabel:{
				interval:0,
				rotate:30,
			},
			nameTextStyle,
		},
		yAxis: {
			type: 'category',
			data: [...type].reverse(),
			nameTextStyle,
		},
		visualMap: {
			min: -1,
			max: 1,
			calculable: true,
			orient: 'vertical',
			left: 'right',
			bottom: 'center',
			precision:1,
			itemHeight:280,
			inRange: {color: ['#80BDFD','#fff','#B0E39B']},
			align:'bottom',
		},
		series: {
			// name: 'Punch Card',
			type: 'heatmap',
			data,
			itemStyle: {
				emphasis: {
					shadowBlur: 10,
					shadowColor: 'rgba(0, 0, 0, 0.5)',
				},
			},
		},
	}
	return <ReactEcharts
		option={option}
		style={{height:height+6 * len, width:width+6 * len}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
