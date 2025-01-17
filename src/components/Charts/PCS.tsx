import React, { useContext } from 'react';
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import EN from "../../constant/en";
import config from 'config'
import { MobXProviderContext } from 'mobx-react';
const {isEN} = config;

interface Interface {
	data:any
	x_name:string
	y_name:string
	fields:any
}

export default function PCS(props:Interface) {
	const {data=[],x_name='',y_name='',fields} = props;
	const {projectStore:{project:{mapHeader}}} = useContext(MobXProviderContext);

	let option:any = {
		xAxis:{},
		yAxis:{},
	};

	if(data.length){
		option =  {
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
									${mapHeader[fields[dataIndex]]}<br />
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

	return <ReactEcharts
		option={option}
		style={{height: 360, width: 300}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
