import React from 'react'
import ReactEcharts from 'echarts-for-react';
// import './echarts.config'

export default function SpeedvsAccuracys(props){
		const {
			models,
			x_name='',
			y_name='',
			height = 400,
			width = 950
		} = props;
		console.log(123,models)

		const data = models.map(itm=>({
			name:itm.modelName,
			value:[itm.executeSpeed,itm.score.trainScore.auc],
		}));
	const lineStyle = {
		normal: {
			type: 'dashed',
		},
	};

	const series = data.map((itm)=>{
		return {
			name:itm.name,
			symbolSize: 20,
			data:[itm.value],
			type: 'scatter',
			markLine : {
				lineStyle,
				symbol:false,
				data:[
					{
						xAxis:itm.value[0],
					},
					{
						type:'min',
					},
				],
			},
		}
	});
	
	const nameTextStyle = {
		color:'#000',
	};

	const option =  {
		xAxis: {
			nameTextStyle,
			name:x_name,
		},
		yAxis: {
			name:y_name,
			nameTextStyle,
		},
		series,
		legend: {
			type:'scroll',
			orient:'vertical',
			left:'right',
			top:'5%',
			width:'auto',
			bottom:'30%',
		},
		grid:{
			x2:300,
			x:30,
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
