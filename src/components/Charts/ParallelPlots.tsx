import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import request from '../Request';
import EN from "../../constant/en";
import { inject } from 'mobx-react';

@inject('projectStore')
export default class ParallelPlot extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			ready:false,
		}
	}

	async componentDidMount() {
		const {url} = this.props as any;
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
		const {result,ready} = this.state as any;

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

		const {projectStore} = this.props as any;

		schema.forEach((itm,index)=>{
			const name = projectStore.project.mapHeader[itm];
			parallelAxis.push({
				dim:index+1,
				nameLocation:'start',
				name,
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
			// data:itm.value,
			data:itm.value.map(itm=>{
				itm.unshift(undefined);
				return itm
			}),
		}));

		return {
			title: {
				text: title,
			},
			grid:{},
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
				inactiveColor:'rgba(204,204,204,0.5)'
			},
			silent:true,
			progressiveChunkMode:'mod',
			parallelAxis,
			parallel: {
				left: '5%',
				right: '13%',
				bottom: '10%',
				top: '20%',
				parallelAxisDefault: {
					type: 'value',
					// name: 'Parallel Plot',
					nameLocation: 'end',
					nameGap: 20,
					nameTextStyle: {
						fontSize: 12,
					},
				},
			},
			series,
			toolbox: {
				right:40,
				feature: {
					restore:{
						title:EN.restore,
					},
				},
				z: 202
			},
		};
	}

	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 310, width: 710}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}