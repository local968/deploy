import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
// import 'echarts-gl'

export default class ThreeVariable extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const symbolSize = 5;
		
		const {x_name='',y_name='',z_name='',data=[]} = this.props;
		
		// const result = {
		// 	data:[
		// 		{
		// 			name:'math',
		// 			value:[[12, 14, 10], [34, 50, 15], [56, 30, 20], [10, 15, 12], [23, 10, 14]],
		// 		},{
		// 			name:'chinese',
		// 			value:[[1,2,3]],
		// 		}
		// 	],
		// };
		//
		// const {data=[]} = result;
		
		// const keys = data.map(itm=>itm.name);
		
		const series = data.map(itm=>{
			return {
				name:itm.name,
				type: 'scatter3D',
				symbolSize,
				data:itm.value,
			}
		});
		
		return {
			tooltip: {},
			grid3D: {},
			legend: {
				orient: 'vertical',
				top: 20,
				right:0,
				// data: keys,
				align: 'left',
			},
			xAxis3D: {
				name:x_name
			},
			yAxis3D: {
				name:y_name
			},
			zAxis3D: {
				name:z_name
			},
			series,
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
