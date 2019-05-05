import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class univariantRegressionNumerical extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			value:[
				[10.0, 8.04],
				[8.0, 6.95],
				[13.0, 7.58],
				[9.0, 8.81],
				[11.0, 8.33],
				[14.0, 9.96],
				[6.0, 7.24],
				[4.0, 4.26],
				[12.0, 10.84],
				[7.0, 4.82],
				[5.0, 5.68]
			],
			top:[
				0,0,1,2,3,4,5,6,7,8,9,10,8,7,3,2,1,0,8,5,4,2,1,
				0,0,1,2,3,4,5,6,7,8,9,10,8,7,3,2,1,0,8,5,4,2,1,
				0,0,1,2,3,4,5,6,7,8,9,10,8,7,3,2,1,0,8,5,4,2,1,
			],
			right:[
				0,0,1,2,3,4,5,6,7,8,9,10,8,7,3,2,1,0,8,5,4,2,1,
				0,0,1,2,3,4,5,6,7,8,9,10,8,7,3,2,1,0,8,5,4,2,1,
				0,0,1,2,3,4,5,6,7,8,9,10,8,7,3,2,1,0,8,5,4,2,1,
			],
			x_name:'x_name',
			y_name:'y_name',
			top_max:100,
			title:'title',
		}
		
		const {value,top,right,x_name,y_name,top_max,title} = result;
		
		return{
			// title: {
			// 	text: title,
			// 	x: 'center',
			// 	y: 0
			// },
			grid: [
				{x: '7%', width: '66%', height: '18%'},
				{},
				{x: '7%', y2: '7%', width: '65%', height: '58%'},
				{x2: '7%', y2: '7%', width: '18%', height: '58%'}
			],
			tooltip: {
				formatter: 'Group {a}: ({c})'
			},
			xAxis: [
				{
					gridIndex: 0,
					type: 'category',
					show:false,
				},
				{
					gridIndex: 1,
					show:false,
				},
				{
					gridIndex: 2,
					name:x_name,
					nameLocation:'center',
				},
				{
					gridIndex: 3,
					type: 'value',
					show:false,
					// max:top_max,
				}
			],
			yAxis: [
				{
					gridIndex: 0,
					type: 'value',
					show:false,
					// max:top_max,
				},
				{gridIndex: 1,show:false},
				{
					gridIndex: 2,
					name:y_name,
					nameLocation:'center',
				},
				{
					gridIndex: 3,
					type: 'category',
					show:false,
				}
			],
			series: [
				{
					xAxisIndex: 0,
					yAxisIndex: 0,
					data:top,
					type: 'bar'
				},
				{
					type: 'scatter',
					xAxisIndex: 2,
					yAxisIndex: 2,
					data: value,
				},
				{
					type: 'bar',
					xAxisIndex: 3,
					yAxisIndex: 3,
					data: right,
				}
			]
		};
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 600}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			// onChartReady={this.onChartReadyCallback}
			// onEvents={EventsDict}
			// opts={}
		/>
	}
}
