import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class LiftCharts extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			x_name:'percentage',
			y_name:'lift',
			data:[{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd',
				value:[[0,0],[100,2]],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd2',
				value:[[0,1],[2,0],[100,2.1]],
			}]
		}
		const {x_name,y_name,data} = result;
		
		const series = data.map(itm=>{
			return {
				name:itm.name,
				symbolSize: 0,
				data:itm.value,
				type: 'line',
			}
		});
		
		return {
			xAxis: {
				name:x_name,
				axisLabel: {
					formatter: '{value}%'
				},
			},
			yAxis: {
				name:y_name,
			},
			series,
			legend: {
				type:'scroll',
				orient:'vertical',
				left:'right',height:'90%',
			},
			grid:{
				x2:300,
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
		/>
	}
}
