import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class TSEN extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.state = {
			loading:true,
		}
	}
	
	componentDidMount() {
		const chart = this.chart.getEchartsInstance();
		chart.showLoading();
		this.setState({
			loading:false,
		})
	}
	
	getOption() {
		const {x_name,y_name,data=[],title=''} = this.props;
		const {loading} = this.state;
		
		if(data.length&&!loading){
			const chart = this.chart.getEchartsInstance();
			chart.hideLoading();
		}else{
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		
		const series = data.sort((a,b)=>a.name - b.name).map(itm=>{
			return {
				name:itm.name,
				data:itm.value,
				type:'scatter',
				symbolSize:5,
			}
		});
		return {
			title: {
				text: title,
				textStyle:{
					fontSize:11
				}
			},
			grid: {
				left: '6%',
				right: '20%',
				bottom: '4.5%',
				containLabel: true
			},
			dataZoom:[{
				type:"inside"
			}],
			tooltip: {
				showDelay: 0,
				formatter: function (params) {
					if (params.value.length > 1) {
						return params.seriesName + '<br/>'
							+ x_name +':'+ params.value[0].toFixed(3) + '<br/>'
							+ y_name +':'+ params.value[1].toFixed(3);
					} else {
						return params.seriesName + ' :<br/>'
							+ params.name + ' : '
							+ params.value;
					}
				},
				axisPointer:{
					show: true,
					type : 'cross',
					lineStyle: {
						type : 'dashed',
						width : 1
					},
					label:{
						precision:3
					}
				}
			},
			legend: {
				orient: 'vertical',
				top: 40,
				bottom:40,
				right: 0,
				type: 'scroll',
				zlevel:20,
			},
			xAxis: [
				{
					name: x_name,
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: true
					},
					nameLocation:'middle',
					nameGap:25,
				}
			],
			yAxis: [
				{
					name: y_name,
					type: 'value',
					scale: true,
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: true
					},
					nameLocation:'middle',
					nameGap:23,
				}
			],
			series,
			// toolbox: {
			// 	show : true,
			// 	feature : {
			// 		dataZoom: {},
			// 		brush: {
			// 			type: ['rect', 'clear']
			// 		},
			// 		dataView : {show: true, readOnly: false},
			// 		magicType : {show: true, type: ['line', 'bar']},
			// 		restore : {show: true},
			// 		saveAsImage : {show: true}
			// 	}
			// }
		}
	}
	
	render(){
		const {width=550,height=400} = this.props;
		return <ReactEcharts
			option={this.getOption()}
			ref = {chart=>this.chart=chart}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
