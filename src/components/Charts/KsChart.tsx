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

export default function KsChart(props:Interface){
	const {x_name='',y_name='',width=600,height=400,model,isHoldout} = props;
	const {holdoutChartData,chartData} = model;
	const {lift={}} = isHoldout?holdoutChartData:chartData;
	const {KS_FPR,KS_TPR} = lift;


	const FPR = Object.values(KS_FPR);
	const TPR = Object.values(KS_TPR);

	const series = [TPR,FPR].map(itm=>{
		const data =  itm.map((it,index)=>[(index+1)*10,it]);
		data.unshift([0,0]);

		return {
			type: 'line',
			symbolSize: 0,
			data,
			smooth: false,
		}
	});

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
				formatter: (value)=>`${value*100}%`
			}
		},
		series,
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
