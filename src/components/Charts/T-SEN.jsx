import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class ParallelPlot extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const {x_name,y_name,data} = this.props;
		
		const series = data.sort((a,b)=>a.name - b.name).map(itm=>{
			return {
				name:itm.name,
				data:itm.value,
				type:'scatter',
				symbolSize:5,
			}
		});
		return {
			title: {
				text: '',
				subtext: ''
			},
			grid: {
				left: '6%',
				right: '10%',
				bottom: '4%',
				containLabel: true
			},
			tooltip: {
				showDelay: 0,
				formatter: function (params) {
					if (params.value.length > 1) {
						return params.seriesName + '<br/>'
							+ x_name +':'+ params.value[0].toFixed(3) + '<br/>'
							+ y_name +':'+ params.value[1].toFixed(3);
					} else {
						return params.seriesName + ' :<br/>'
							+ params.name + ' : '
							+ params.value;
					}
				},
				axisPointer:{
					show: true,
					type : 'cross',
					lineStyle: {
						type : 'dashed',
						width : 1
					}
				}
			},
			legend: {
				orient: 'vertical',
				top: 40,
				bottom:40,
				right: 0,
				type: 'scroll',
			},
			xAxis: [
				{
					name: x_name,
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: true
					},
					nameLocation:'middle',
					nameGap:25,
				}
			],
			yAxis: [
				{
					name: y_name,
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: true
					},
					nameLocation:'middle',
					nameGap:25,
				}
			],
			series,
			// toolbox: {
			// 	show : true,
			// 	feature : {
			// 		dataZoom: {},
			// 		brush: {
			// 			type: ['rect', 'clear']
			// 		},
			// 		dataView : {show: true, readOnly: false},
			// 		magicType : {show: true, type: ['line', 'bar']},
			// 		restore : {show: true},
			// 		saveAsImage : {show: true}
			// 	}
			// }
		}
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 550}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
