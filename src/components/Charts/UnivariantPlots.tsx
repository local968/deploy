import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'
import EN from '../../constant/en';
import {toJS} from "mobx";

/**
 * Univariant Plot
 */
export default class UnivariantPlots extends PureComponent{
	getOption() {
		const {title='',x_name='',y_name='',result={}} = this.props as any;

		let {data=[],item=[]} = toJS(result);

		const series = data.map((itm)=>{
			return {
				name:itm.name,
				data:itm.value,
				type:'bar',
				stack: 'sum',
				markPoint : {
					data : [
						{type : 'max', name: EN.Max},
						{type : 'min', name: EN.Min},
					],
				},
			}
		});

		const nameTextStyle = {
			color:'#000',
		};

		return {
			title : {
				text: title,
			},
			tooltip : {
				trigger: 'axis',
				axisPointer : {
					type : 'shadow',
				},
			},
			legend: {},
			// toolbox: {
			// 	show : true,
			// 	feature : {
			// 		magicType : {show: true, type: ['line', 'bar']},
			// 		restore : {show: true},
			// 		saveAsImage : {show: true},
			// 	},
			// },
			calculable : true,
			xAxis : {
				type : 'category',
				name:x_name,
				data:item,
				nameTextStyle,
			},
			yAxis:  {
				type: 'value',
				nameTextStyle,
				name:y_name,
			},
			series,
		};

	}

	render(){
		const {
			height = 330,
			width = 400,
		} = this.props as any;

		return <ReactEcharts
			option={this.getOption()}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
