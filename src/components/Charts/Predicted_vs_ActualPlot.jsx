import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class Predicted_vs_ActualPlot extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			x_name:'Point Number',
			y_name:'Average price',
			data:[
				{
					name:'a',
					value:[[0, 10], [2, 5], [3, 20], [4, 100], [5, 55]],
				},
				{
					name:'b',
					value:[[0, 1], [2, 2], [3, 3], [4, 4], [5, 5]],
				}
			]
		};
		
		const {data,x_name,y_name} =result;
		const series = data.map(itm=>({
			type: 'line',
			data:itm.value,
			name:itm.name,
		}));
		
		// 指定图表的配置项和数据
		return {
			// title: {
			// 	text: 'Within Group Sum of Squares'
			// },
			xAxis: {
				name:x_name,
				type: 'value',
			},
			yAxis: {
				name: y_name,
				type: 'value'
			},
			legend: {
				// orient: 'vertical',
				// top: 20,
				// right:0,
				data: data.map(itm=>itm.name),
				// itemGap: 20,
				// itemWidth:50,
				// itemHeight:3,
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params) {
					const result = data.map((itm,index)=> {
						return <dd>
							{itm.name}:{params[0].data[index]}
						</dd>;
					});
					return `
						Group Number:${params[0].axisValue}
						${result.map(itm=>('<br/>' + itm.props.children.join('')))}
					`
				// 	return `
				//     Group Number:${params[0].axisValue}
				//     <br/>
				//     Within Groups SS:${params[0].data}
				// `
				},
				extraCssText:'background-color:#6a6aea;color:#fff;'
			},
			series,
			grid:{
				x2:130,
				y2:80,
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
