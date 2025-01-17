import React, { ReactElement } from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';

interface Interface {
	models:any
	x_name:string
	y_name:string
	height?:number
	width?:number
	mom:any
	x:any
	y:any
	formatter:boolean
	selectAll?:boolean
}

export default function LiftChart(props:Interface):ReactElement{
	const {models,x_name,y_name,height=400,width=950,mom,x,y,formatter=false,selectAll=true} = props;

	const selected = {};

	const data = models.map(itm=>{
		const mother = itm.chartData[mom];
		const _x = Object.values(mother[x]);
		const _y = Object.values(mother[y]);
		selected[itm.modelName] = selectAll;
		return {
			name:itm.modelName,
			value:_.zip(_x,_y),
		}
	});


	const series = data.map(itm=>{
		return {
			name:itm.name,
			symbolSize: 0,
			data:itm.value,
			type: 'line',
		}
	});
	const nameTextStyle = {
		color:'#000',
	};

	const option =  {
		xAxis: {
			name:x_name,
			nameTextStyle,
			axisLabel: {
				formatter: value=>{
					if(formatter){
						return `${value*100}%`
					}
					return value;
				},
			},
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
			height:'90%',
			selected,
			inactiveColor:'rgba(204,204,204,0.5)'
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
