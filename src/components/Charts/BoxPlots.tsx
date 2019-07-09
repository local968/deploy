import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
const Echarts = require('echarts');
import 'echarts/dist/extension/dataTool'
import initEcharts from './echarts.config';

initEcharts(Echarts);

interface DataSampleProps {
	x_keys:Array<string>
	value:Array<string>
	height?:number
	width?:number
	title?:string
	x_name?:string
	y_name?:string
}

export default class BoxPlots extends PureComponent<DataSampleProps>{

	getOption() {
		const {value=[],title='',x_name='',y_name='',x_keys = []} = this.props;

		const data = Echarts.dataTool.prepareBoxplotData(value);
		const nameTextStyle = {
			color:'#000',
		};

		const {boxData,outliers} = data;

		const max = Math.max(Math.max(...boxData.map(itm=>Math.max(...itm))),Math.max(...outliers.map(itm=>Math.max(...itm))));

		return {
			title: [
				{
					text: title,
					left: 'center',
				},
			],
			tooltip: {
				trigger: 'item',
				axisPointer: {
					type: 'shadow',
				},
			},
			grid: {
				// left: 200,
				x:`${Math.floor(max+1)}`.length * 10 +20,
				right: '10%',
				bottom: '25%',
			},
			xAxis: {
				name:x_name,
				type: 'category',
				nameTextStyle,
				data:x_keys,
				boundaryGap: true,
				nameGap: 30,
				splitArea: {
					show: false,
				},
				// axisLabel: {
				// 	formatter: 'expr {value}'
				// },
				axisLabel:{
					interval:0,
					rotate:30,
				},
				splitLine: {
					show: false,
				},
			},
			yAxis: {
				type: 'value',
				name: y_name,
				nameTextStyle,
				splitArea: {
					show: true,
				},
			},
			series: [
				{
					// name: 'boxplot',
					type: 'boxplot',
					data: data.boxData,
					tooltip: {
						formatter: function (param) {
							return [
								param.name + ': ',
								'upper: ' + param.data[5],
								'Q3: ' + param.data[4],
								'median: ' + param.data[3],
								'Q1: ' + param.data[2],
								'lower: ' + param.data[1],
							].join('<br/>');
						},
					},
				},
				{
					name: 'outlier',
					type: 'scatter',
					data: data.outliers,
				},
			],
		};

	}

	render(){
		const {
			height = 330,
			width = 400,
		} = this.props;

		return <ReactEcharts
			option={this.getOption()}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
