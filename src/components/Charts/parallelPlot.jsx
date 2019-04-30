import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
const result = require('../d3d2');

export default class ParallelPlot extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	componentDidMount() {
		fetch('../d3d2.json').then(data=>data.json())
			.then(result=>{
				this.setState({
					result,
				})
			})
	}
	
	getOption() {
		// const {result} = this.state;
		
		// if(!result){
		// 	return {
		// 		xAxis:{},
		// 		yAxis:{},
		// 	}
		// }
		
		
		// const result = {
		// 	title:'title',
		// 	schema : ['var1','var2','var3','var4','var5','var6'],
		// 	data:[{
		// 		name:'math',
		// 		value:[
		// 			[55,9,56,0.46,18,6],
		// 			[25,11,21,0.65,34,9],
		// 			[56,7,63,0.3,14,5],
		// 		],
		// 	},{
		// 		name:'english',
		// 		value:[
		// 			[1,2,3,0.16,8,61],
		// 			[1,3,5,0.05,4,92],
		// 			[1,4,6,0.3,4,53],
		// 		],
		// 	}],
		// };
		
		let {title='',schema=[],data=[]} = result;
		let len = 0;
		
		data.forEach(itm=>{
			len+=itm.value.length;
		});
		
		const skip = Math.floor(len/1000);
		
		if(skip>1){
			data = data.map(itm=>{
				const value = itm.value.filter((it,index)=>!(index%skip));
				return {
					name:itm.name,
					value,
				}
			})
		}
		
		console.log(data)
		
		// const legendName = data.map((itm)=>itm.name);
		//
		// console.log(legendName.length)
		
		// let parallelAxis = [{
		// 	dim:0,
		// 	type: 'category',
		// 	data: []
		// }];
		let parallelAxis = [];
		
		schema.forEach((itm,index)=>{
			parallelAxis.push({
				dim:index+1,
				nameLocation:'start',
				name:itm,
			})
		});
		
		const lineStyle = {
			normal: {
				width: 1,
				opacity: 0.5
			}
		};
		const series = data.map(itm=>({
			name:itm.name,
			type: 'parallel',
			lineStyle,
			data:itm.value
			// data:itm.value.map(itm=>{
			// 	itm.unshift(undefined);
			// 	return itm
			// }),
		}));

		// 使用刚指定的配置项和数据显示图表。
		// myChart.setOption(option);
		return {
			title: {
				text: title,
			},
			legend: {
				orient: 'vertical',
				top: 20,
				right: 0,
				// data: legendName,
				itemGap: 20,
				itemWidth: 50,
				itemHeight: 3,
			},
			parallelAxis,
			parallel: {
				left: '5%',
				right: '13%',
				bottom: '10%',
				top: '20%',
				parallelAxisDefault: {
					type: 'value',
					name: 'Parallel Plot',
					nameLocation: 'end',
					nameGap: 20,
					nameTextStyle: {
						fontSize: 12
					}
				}
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
