import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import EN from "../../constant/en";
import config from 'config'
const {isEN} = config;

export default class PCS extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	componentDidMount() {
		const chart = this.chart.getEchartsInstance();
		chart.showLoading();
	}
	
	getOption() {
		
		const {data=[],x_name='',y_name='',fields} = this.props;
		
		if(data.length){
			const chart = this.chart.getEchartsInstance();
			chart.hideLoading();
		}else{
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		
		return {
			xAxis: {
				max:1,
				min:-1,
				name:x_name,
				nameGap:5,
				nameLocation:'end',
				axisLine:{
					onZero:false
				},
			},
			yAxis: {
				max:1,
				min:-1,
				name:y_name,
				nameLocation:'end',
				nameGap:16,
				axisLine:{
					onZero:false
				},
			},
			// grid:{
			// 	x:10,
			// },
			title: {
				text: EN.PCSTitle,
				textStyle:{
					fontSize:isEN?11:15,
				},
				left:10,
			},
			polar: {},
			tooltip: {
				trigger: 'item',
				showContent:true,
				triggerOn:'mousemove|click',
				formatter: function (seriesData) {
					if(seriesData){
						const {data,dataIndex} = seriesData;
						return `
									${fields[dataIndex]}<br />
									x:${data[0].toFixed(3)}<br />
									y:${data[1].toFixed(3)}
							`
					}
					return null;
				}
			},
			angleAxis: {
				type: 'value',
				startAngle: 0,
				show: true,
				max:1,
				min:-1,
				axisLabel:{
					show:false,
				},
				splitLine:{
					show:false
				}
			},
			radiusAxis: {
			},
			series: [{
				coordinateSystem: 'polar',
				type: 'scatter',
			},{
				type: 'scatter',
				data: data
			}]
		};
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			ref = {chart=>this.chart=chart}
			style={{height: 360, width: 300}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
