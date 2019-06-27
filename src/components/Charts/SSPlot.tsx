import React,{useState} from 'react'
import ReactEcharts from 'echarts-for-react';
import EN from "../../constant/en";
import { Spin } from 'antd';
import _ from 'lodash';

export default function GainChart(props){
	const {width=600,height=400,project} = props;
	const [ssPlot,upSsPlot] = useState(project.ssPlot);
	let max = 1;
	let option = {
		xAxis:{},
		yAxis:{},
	};
	if(!ssPlot){
		project.getSsPlot().then(()=>{
			upSsPlot(project.ssPlot);
		});
	}else{
		const {x,y} = ssPlot;
		const data = _.zip(x,y);
		max = _.max(y);


		option = {
			xAxis: {
				name:EN.NumberofClusters,
			},
			yAxis: {
				name:EN.WithinGroupSsSquares,
			},
			// @ts-ignore
			series:{
				type: 'line',
				symbolSize: 0,
				data,
				smooth: false,
			},
			grid:{
				x:`${parseInt(String(max))}`.length * 10,
				x2:150
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params) {
					if(params[0]&&params[0].value){
						const [x,y] = params[0].value;

						return `
							${EN.NumberofClusters}:${x}<br/>
							${EN.WithinGroupsSs}:${y}<br/>
						`
					}
				},
			},
		};
	}

	return <Spin spinning={!ssPlot}>
		<ReactEcharts
			option={option}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	</Spin>
}
