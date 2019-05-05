import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class ROC extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			x_name:'po Threshold',
			y_name:'true Density',
			point:0.2,
			data:[[0, 10], [0.2, 5], [0.3, 3], [0.4, 1], [0.5, 1],[0.6,6],[0.61,1],[1,1]],
		};
		
		const {x_name,y_name,data,point} = result;
		
		const series = {
			type: 'line',
			data,
		};
		
		return {
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
						width: 0
					},
					
					handle: {
						show: true,
						// color: '#004E52',
						size:1,
						margin:43,
					}
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
				triggerOn: 'click|mousemove',
			},
			series,
			formatter: function (params,ticket,callback){
				console.log(params)
			},
			toolbox: {
				show : true,
				feature : {
					dataZoom: {},
					// brush: {
					// 	type: ['rect', 'clear']
					// },
					// dataView : {show: true, readOnly: false},
					// magicType : {show: true, type: ['line', 'bar']},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			}
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
