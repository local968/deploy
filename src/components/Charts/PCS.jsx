import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'

export default class Silhoutte extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const data = [
			[-0.5, 0.8],
			[0.8, 0.3],
		];
		
		return {
			xAxis: {
				max:1,
				min:-1,
			},
			yAxis: {
				max:1,
				min:-1,
			},
			title: {
				text: '1'
			},
			// legend: {
			//     data: ['line']
			// },
			polar: {},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross'
				}
			},
			angleAxis: {
				type: 'value',
				startAngle: 0,
				show: true,
				max:1,
				min:-1,
				axisLabel:{
					show:false,
				},
				// boundaryGap:[0,0],
			},
			radiusAxis: {
			},
			series: [{
				coordinateSystem: 'polar',
				name: 'line',
				type: 'scatter',
			},{
				name: 'line',
				type: 'scatter',
				data: data
			}]
		};
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 600, width: 600}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			// onChartReady={this.onChartReadyCallback}
			// onEvents={EventsDict}
			// opts={}
		/>
	}
}
