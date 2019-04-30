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
			[[0.99,0.499],[0.98,0.498],[0.97,0.497],[0.96,0.496],[0.95,0.495]],
			[[0.89,0.399],[0.88,0.398],[0.87,0.397],[0.86,0.396],[0.85,0.395]],
			[[0.79,0.299],[0.78,0.298],[0.77,0.297],[0.76,0.296],[0.75,0.295]],
			[[0.69,0.199],[0.68,0.198],[0.67,0.197],[0.66,0.196],[0.65,0.195]],
		];
		
		const series = [{
			type: 'line',
			data: [[0.8,0], [0.8,0.5]],
			lineStyle:{
				type:'dotted'
			}
		}];
		data.forEach(itm=>{
			const color = `#${Math.random().toString(16).substring(2,8)}`;
			itm.map(it=>{
				series.push({
					data: [[0,it[1]],[it[0],it[1]]],
					type: 'line',
					lineStyle:{
						color,
					},
					symbolSize:0,
				})
			})
		});
		
		return {
			title: {
				text:'Cluster Label',
			},
			xAxis: {
				name:'The Silhouette Coefficient Values',
				min:-0.1,
			},
			yAxis: {
				min:0,
			},
			series,
			grid:{
				x2:210,
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
