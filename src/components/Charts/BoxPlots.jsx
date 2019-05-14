import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
const Echarts = require('echarts');
import 'echarts/dist/extension/dataTool'
import './echarts.config'

export default class BoxPlots extends PureComponent{

	getOption() {
		const {value=[],title='',x_name='',y_name='',x_keys = []} = this.props;

		const data = Echarts.dataTool.prepareBoxplotData(value);

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
				left: '10%',
				right: '10%',
				bottom: '25%',
			},
			xAxis: {
				name:x_name,
				type: 'category',
				// data: data.axisData,
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
				splitArea: {
					show: true,
				},
			},
			series: [
				{
					name: 'boxplot',
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
			height = 400,
			width = 1000,
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
