import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class BarMany extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			x_name:'x_name',
			y_name:'y_name',
			title:'title',
			data:[
				[
					-40,
					2
				],
				[
					-35,
					4
				],
				[
					-30,
					5
				],
				[
					-25,
					24
				],
				[
					-20,
					81
				],
				[
					-15,
					103
				],
				[
					-10,
					450
				],
				[
					-5,
					39986
				],
				[
					0,
					49417
				],
				[
					5,
					323
				],
				[
					10,
					82
				],
				[
					15,
					62
				],
				[
					20,
					6
				],
				[
					25,
					4
				],
				[
					30,
					0
				],
				[
					35,
					1
				],
				[
					40,
					0
				],
				[
					45,
					0
				],
				[
					50,
					1
				]
			]
		};
		
		const {data,x_name,y_name,title} = result;
		
		return {
			title: {
				text: title,
				x: 'center',
			},
			xAxis: {
				type: 'category',
				name:x_name,
			},
			yAxis: {
				type: 'value',
				name:y_name,
			},
			series: [{
				data,
				type: 'bar',
			}]
		};
		
		
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			// onChartReady={this.onChartReadyCallback}
			// onEvents={EventsDict}
			// opts={}
		/>
	}
}
