import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class ParallelPlot extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			title:'fit plot',
			x_name:'x_name',
			y_name:'y_name',
			data:[[2,1,2],[1,1,6],[1.1,3,4]]
		};
		const {data} = result;
		
		const series = data.map(itm=>({
			symbolSize:itm.pop()*10,
			data:[itm],
			type: 'scatter',
			color:'red',
		}));
		return {
			xAxis: {},
			yAxis: {},
			series
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
