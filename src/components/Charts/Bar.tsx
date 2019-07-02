import React from 'react'
import ReactEcharts from 'echarts-for-react';

export default function Bar(){
		const result = {
			x_name:'x_name',
			y_name:'y_name',
			title:'title',
			data:[{
				name:'0',
				value:100,
			},{
				name:'1',
				value:200,
			},{
				name:'2',
				value:50,
			}]
		};

		const {x_name,y_name,data,title} = result;
		const nameTextStyle = {
			color:'#000',
		};

		const option = {
			title: {
				text: title,
				subtext: ''
			},
			xAxis: {
				name:x_name,
				type: 'category',
				nameTextStyle,
				data: data.map(itm=>itm.name),
			},
			yAxis: {
				name:y_name,
				nameTextStyle,
				type: 'value'
			},
			series: [{
				data: data.map(itm=>itm.value),
				type: 'bar',
				label:{
					show:true,
				},
			}]
		};

	return <ReactEcharts
		option={option}
		style={{height: 400, width: 1000}}
		notMerge={true}
		lazyUpdate={true}
		theme="customed"
	/>
}
