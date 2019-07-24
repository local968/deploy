import React, {useEffect, useState} from 'react'
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import config from 'config'

const {isEN} = config;

export default function PredictionDistributions(props){
	const {x_name='',y_name='',width=500,height=400,model,isHoldout,metric} = props;
	const {fitIndex,chartData,holdoutChartData} = model;
	const {density} = isHoldout?holdoutChartData:chartData;
	const {POSITIVE,NEGATIVE,PERCENTAGE} = density;
	const {Threshold} = chartData.roc;
	const _POSITIVE = Object.values(POSITIVE);
	const _NEGATIVE = Object.values(NEGATIVE);
	const _PERCENTAGE = Object.values(PERCENTAGE);
	const [point,setPoint] = useState(false);

	useEffect(()=>{
			const s:any = +(Threshold[fitIndex].toFixed(3));
			setPoint(s);
	},[metric]);

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

	const setf = _.debounce((value)=>{
		if(point === value||!value){
			return
		}

		const t = Object.values(Threshold).sort((a:number,b:number)=>{
			return Math.abs(a - value) - Math.abs(b - value)
		})[0];

		setPoint(value);

		const ind = Object.values(Threshold).indexOf(t);
		model.setFitIndex(ind)
	},200);

	const nameTextStyle = {
		color:'#000',
	};

	let option;
	if(point === false){
		option = {
			xAxis:{},
			yAxis:{}
		}
	}else{
		const _Threshold = Object.values(Threshold);
		option = {
			xAxis: {
				name:x_name,
				type: 'value',
				boundaryGap: false,
				min:_.min(_Threshold),
				max:_.max(_Threshold),
				nameTextStyle,
				axisLabel: {
					formatter: value=>(_.floor(100*value)/100).toFixed(2),
				},
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
						size:isHoldout?0:35,
						margin:43,
					},
				},
			},
			yAxis: {
				type: 'value',
				name:y_name,
				nameTextStyle:{
					...nameTextStyle,
					padding:isEN?[0,0,0,10]:0,
				},
			},
			grid:{
				x2:140,
				y2:80,
			},
			tooltip:{
				triggerOn: 'none',
				formatter: function (params) {
					const [data] = params;
					let res = data.dataIndex;

					params.forEach(itm=>{
						if(itm.axisValue  === itm.data[0]){
							res += `
							<br/>
							${itm.marker}${itm.seriesName}:${itm.value[1]}
						`
						}
					});
					return res;
				},
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
