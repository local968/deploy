import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'
import {toJS} from "mobx";
import EN from '../../constant/en';
import _ from 'lodash';

interface DataSampleProps {
	x_name:string
	y_name:string
	result:any
	title?:string
	height?:number
	width?:number
  renameVariable:any
}

export default class UnivariantPlots extends PureComponent<DataSampleProps>{
	getOption() {
		const {title='',x_name='',result={},renameVariable} = this.props;

		let {data=[],item=[]} = toJS(result);

		const series = data.map((itm)=>{
			return {
				name:renameVariable[itm.name]||itm.name,
				data:itm.value,
				type:'bar',
				stack: 'sum'
			}
		});
		const nameTextStyle = {
			color:'#000',
		};

		const sum = _.sum(item.map(itm=>itm.count));

		return {
			title : {
				text: title,
			},
			dataZoom:{
				type: 'inside',
				zoomLock:true,
				start: 0,
				end: 100 / item.length * 8
			},
			toolbox:{
				show : item.length>8,
				right:30,
				itemSize:20,
				feature : {
					restore:{
						title:EN.restore,
					},
				},
			},
			tooltip : {
				trigger: 'axis',
				axisPointer : {
					type : 'shadow',
				},
				formatter: params=> {
					const [o,t] = params;
					const k = item.find(itm=>itm.key === o.axisValue);
					const s = k?`${o.axisValue}:${(100*k.count/sum).toFixed(3)}%`:o.axisValue;
					return `
						${s}<br/>
						${o.marker}${o.seriesName}:${o.value}<br/>
						${t.marker}${t.seriesName}:${t.value}<br/>
					`
				},
			},
			legend: {},
			calculable : true,
			xAxis : {
				type : 'category',
				name:x_name,
				data:item.map(itm=>itm.key||itm),
				nameTextStyle,
				nameLocation:'middle',
				nameGap:25,
			},
			yAxis:  {
				type: 'value',
				nameTextStyle,
			},
			series,
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
