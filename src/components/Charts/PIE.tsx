import React from 'react';
import ReactEcharts from 'echarts-for-react';
import EN from "../../constant/en";

export default function PIE(props){
		const {width=120,height=120,RowsWillBeFixed,RowsWillBeDeleted,CleanData} = props;
		const option = {
			tooltip : {
				trigger: 'item',
				formatter: "{b} : {d}%",
			},
			series : [
				{
					type: 'pie',
					// radius : '55%',
					// center: ['50%', '45%'],
					data:[
						{
							value:RowsWillBeFixed,
							name:EN.RowsWillBeFixed,
							itemStyle:{
								color:'#9cebff'
							}
						},
						{
							value:RowsWillBeDeleted,
							name:EN.RowsWillBeDeleted,
							itemStyle:{
								color:'#c4cbd7'
							}
						},
						{
							value:CleanData,
							name:EN.CleanData,
							itemStyle:{
								color:'#00c855'
							}
						},
					],
					label: {
						normal: {
							show: false,
							position: 'center'
						},
					},
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
				},
			],
		};

	return <ReactEcharts
		option={option}
		style={{height, width}}
		notMerge={true}
		lazyUpdate={true}
	/>
}
