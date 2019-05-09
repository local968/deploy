import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'

export default class ThreeVariable extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const symbolSize = 5;
		const {x_name='',y_name='',z_name='',data=[]} = this.props;
		
		const series = data.sort((a,b)=>a.name - b.name).map(itm=>{
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
			animation:false,
			legend: {
				orient: 'vertical',
				top: 40,
				bottom:40,
				right:0,
				align: 'left',
				type: 'scroll',
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
			style={{height: 400, width: 550}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
