import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'

export default class PCS extends PureComponent{
	constructor(props){
		super(props);
	}
	
	getOption() {
		const {data=[],x_name='',y_name=''} = this.props;
		
		return {
			xAxis: {
				max:1,
				min:-1,
				name:x_name,
				nameGap:5,
				// nameLocation:'middle'
			},
			yAxis: {
				max:1,
				min:-1,
				name:y_name,
			},
			grid:{
				// x2:150
			},
			title: {
				text: 'The Correlation between PCs and original variables:',
				textStyle:{
					fontSize:11
				}
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
			style={{height: 360, width: 300}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
