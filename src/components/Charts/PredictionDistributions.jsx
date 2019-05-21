import React, {useEffect, useState} from 'react'
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

export default function PredictionDistributions(props){
	const {x_name='',y_name='',width=500,height=400,model} = props;
	const {initialFitIndex,fitIndex,chartData} = model;
	const {density,roc} = chartData;
	const {POSITIVE,NEGATIVE,PERCENTAGE} = density;
	const {Threshold} = roc;
	const _POSITIVE = Object.values(POSITIVE);
	const _NEGATIVE = Object.values(NEGATIVE);
	const _PERCENTAGE = Object.values(PERCENTAGE);
	const [point,setPoint] = useState(false);
	// const [defaultIndex,setDefaultIndex] = useState(false);
	// console.log(props.model)
	
	useEffect(()=>{
		// console.log(787,fitIndex,+(Threshold[fitIndex].toFixed(3)))
		const s = +(Threshold[fitIndex].toFixed(3));
		// console.log(9,s)
		setPoint(s);
		// setDefaultIndex(fitIndex)
	},[]);
	
	// console.log(point)
	
	const data =  [{
		name:'False',
		value:_.zip(_PERCENTAGE,_NEGATIVE),
	},{
		name:'True',
		value:_.zip(_PERCENTAGE,_POSITIVE),
	}];
	const series = data.map(itm=>({
		type: 'line',
		areaStyle: {},
		name:itm.name,
		data:itm.value,
		symbol: 'circle',
	}));
	
	// const point = data[0].value[fitIndex][0];
	// const point = +(Threshold[fitIndex].toFixed(3));
	
	const setf = _.debounce((value)=>{
		
		// initialFitIndex === fitIndex&& defaultIndex !== initialFitIndex
		// console.log( initialFitIndex === fitIndex&& defaultIndex !== initialFitIndex)
		
		if(point === value||!value){
			return
		}
		
		
		// console.log(point,value)
		// if(!point)return;
		const t = Object.values(Threshold).sort((a,b)=>{
			return Math.abs(a - value) - Math.abs(b - value)
		})[0];
		
		setPoint(value)
		
		
		const ind = Object.values(Threshold).indexOf(t);
		// console.log(point,value,ind)
		
		// if(defaultIndex !== fitIndex){
			props.model.setFitIndex(ind)
		// }
		
		// if(pre!==fitIndex){
		
		// }else{
		// 	setPre(true)
		// }
		// props.model.setFitIndex(ind)
	},100);
	
	const nameTextStyle = {
		color:'#000',
	};
	
	let option;
	if(!point){
		option = {
			xAxis:{},
			yAxis:{}
		}
	}else{
		option = {
			xAxis: {
				name:x_name,
				type: 'value',
				boundaryGap: false,
				min:0,
				max:1,
				nameTextStyle,
				axisPointer: {
					value: point,
					snap: true,
					lineStyle: {
						opacity: 0.5,
						width: 2,
					},
					label: {
						show: true,
						formatter: function (params) {
							let {value} = params;
							if(+value === 1){
								value = 0.99;
							}
							setf(value);
							return value.toFixed(2)
						},
						backgroundColor: '#004E52'
					},
					handle: {
						show: true,
						size:35,
						margin:43,
					},
				},
			},
			yAxis: {
				type: 'value',
				name:y_name,
				nameTextStyle,
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
			},
			series,
		};
	}
	
	

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
