import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class SingleLiftCharts extends PureComponent{
	constructor(props){
		super(props);
	}
	
	getOption() {
		const result = {
			x_name:'percentage',
			y_name:'lift',
			data:[[0.1,2.8571428571],[0.2,2.8571428571],[0.3,2.7891156463],[0.4,2.5],[0.5,2],[0.6,1.6666666667],[0.7,1.4285714286],[0.8,1.25],[0.9,1.1111111111],[1,1]]
		};
		const {x_name,y_name,data} = result;
		
		return {
			xAxis: {
				name:x_name,
				axisLabel: {
					formatter: value=> `${value*100}%`
				},
			},
			yAxis: {
				name:y_name,
			},
			series:{
				type: 'line',
				symbolSize: 0,
				data,
				smooth: true
			},
		};
		
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
