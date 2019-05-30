import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'

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
				nameGap:25,
				nameLocation:'center',
			},
			yAxis: {
				max:1,
				min:-1,
				name:y_name,
				nameLocation:'center',
				nameGap:16,
			},
			// grid:{
			// 	x:10,
			// },
			title: {
				text: 'The Correlation between PCs and original variables:',
				textStyle:{
					fontSize:11
				}
			},
			polar: {},
			tooltip: {
				trigger: 'axis',
				showContent:true,
				formatter: function (seriesData) {
					if(seriesData[0]){
						const {data,dataIndex} = seriesData[0];
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
				// boundaryGap:[0,0],
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
