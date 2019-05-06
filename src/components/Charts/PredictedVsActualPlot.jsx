import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import request from '../Request';

export default class PredictedVsActualPlot extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			loading:true,
			data:[],
		}
	}

	async componentDidMount() {
		const {url} = this.props;
		const {data} = await request.post({
			url:'/service/graphics/predicted-vs-actual-plot',
			data:{
				url,
			},
		});
		this.setState({
			data,
			loading:false,
		})
	}

	getOption() {
		const {loading,data} = this.state;
		if(loading){
			return {
				xAxis:{},
				yAxis:{},
			}
		}

		const {x_name='',y_name=''} = this.props;
		const series = data.map(itm=>({
			type: 'line',
			data:itm.value,
			name:itm.name,
			symbolSize: 3,
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
				type: 'value',
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
							{itm.name}:{itm.value[index][1]}
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
				// extraCssText:'background-color:#6a6aea;color:#fff;',
			},
			series,
			grid:{
				x2:130,
				y2:80,
			},
		};

	}

	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 800}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
