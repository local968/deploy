import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class PredictionDistribution extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}

	getOption() {
		const result = {
			x_name:'Probability Threshold',
			y_name:'Probability Density',
			point:0.2,
			data:[
				{
					name:'00',
					value:[[0, 10], [0.2, 5], [0.3, 3], [0.4, 1], [0.5, 1],[0.6,6],[0.61,1],[1,1]],
				},
				{
					name:'aaa',
					value:[[0, 1], [0.2, 2], [0.3, 1], [0.4, 4], [0.5, 1],[0.6,6],[0.61,1],[1,0.7]],
				}
			]
		}
		
		const {x_name,y_name,data,point} = result;
		
		const series = data.map(itm=>({
			type: 'line',
			areaStyle: {},
			name:itm.name,
			data:itm.value,
			symbol: 'circle',
		}));
		
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
						width: 2
					},
					
					handle: {
						show: true,
						// color: '#004E52',
						size:35,
						margin:43,
						// icon:'image://https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/home/img/qrcode/zbios_x2_9d645d9.png'
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
				triggerOn: 'none',
			},
			legend: {
				orient: 'vertical',
				top: 40,
				right: 0,
				// data: legend,
			},
			series,
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
