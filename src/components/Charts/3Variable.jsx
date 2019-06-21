import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import EN from "../../constant/en";

export default class ThreeVariable extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const symbolSize = 5;
		const {x_name='',y_name='',z_name='',data=[]} = this.props;
		
		const series = data.sort((a,b)=>a.name - b.name).map(itm=>{
			return {
				name:itm.name,
				type: 'scatter3D',
				symbolSize,
				data:itm.value,
				emphasis:{
					label:{
						show:false
					}
				}
			}
		});
		
		series.forEach(({data,name})=>{
			const mean = _.unzip(data).map(itm=>_.mean(itm));
			series.push({
				name:name + EN.NewAverage,
				symbolSize:1.5*symbolSize,
				type: 'scatter3D',
				data:[mean],
				symbol:'triangle',
				emphasis:{
					label:{
						show:false
					}
				}
			})
		})
		
		return {
			tooltip: {
				formatter: function (params, ticket, callback) {
					const {seriesName,value,marker} = params;
					return `
						${marker}${seriesName}<br/>
						${x_name}:${value[0].toFixed(3)}<br/>
						${y_name}:${value[1].toFixed(3)}<br/>
						${z_name}:${value[2].toFixed(3)}
					`
				},
				// axisPointer:{
				// 	label:{
				// 		precision:3
				// 	}
				// }
			},
			grid3D: {},
			temporalSuperSampling:{
				enable:true,
			},
			animation:false,
			legend: {
				orient: 'vertical',
				top: 40,
				bottom:40,
				right:0,
				align: 'right',
				type: 'scroll',
				zlevel:20,
				animationDurationUpdate:100,
				inactiveColor:'rgba(204,204,204,0.5)'
			},
			xAxis3D: {
				name:x_name
			},
			yAxis3D: {
				name:y_name
			},
			zAxis3D: {
				name:z_name
			},
			series,
		};
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 450}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
