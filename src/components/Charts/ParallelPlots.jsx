import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import request from '../Request';

export default class ParallelPlot extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			ready:false,
		}
	}

	async componentDidMount() {
		const { url} = this.props;
		const result = await request.post({
			url: '/graphics/parallel-coordinate-map',
			data: {
				url,
			},
		});

		this.setState({
				result,
				ready:true
			})
	}

	getOption() {
		const {result,ready} = this.state;

		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}



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

		let parallelAxis = [];
		
		const nameTextStyle = {
			color:'#000',
		};

		schema.forEach((itm,index)=>{
			parallelAxis.push({
				dim:index+1,
				nameLocation:'start',
				name:itm,
				nameTextStyle,
			})
		});

		const lineStyle = {
			normal: {
				width: 1,
				opacity: 0.5,
			},
		};
		const series = data.map(itm=>({
			name:itm.name,
			type: 'parallel',
			lineStyle,
			data:itm.value,
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
			// grid:{
			// 	x2:100,
			// },
			legend: {
				orient: 'vertical',
				type:'scroll',
				top: 50,
				bottom:50,
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
						fontSize: 12,
					},
				},
			},
			series,
		};
	}

	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 300, width: 710}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
