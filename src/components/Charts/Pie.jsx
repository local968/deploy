import React, {useState,useEffect} from 'react'
import ReactEcharts from 'echarts-for-react';

export default function Pie(){
	const [option, setOption] = useState({
		xAxis:{},
		yAxis:{},
	});
	
	useEffect(()=>{
		const used = 5;
		const remain = 6;
		const startAngle = 90 + used/(remain+used)*180;
		
		setOption({
			title : {
				text: '预测行数',
				subtext: '0 / 20000',
				x:'center',
				bottom: 20,
			},
			tooltip : {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c} ({d}%)"
			},
			series : [
				{
					name: '预测行数',
					type: 'pie',
					// radius : '55%',
					center: ['50%', '60%'],
					startAngle,
					data:[
						{value:used, name:'使用'},
						{value:remain, name:'剩余'},
					],
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		});
	});
	
	return <ReactEcharts
		option={option}
		style={{height: 400, width: 1000}}
		notMerge={true}
		lazyUpdate={true}
		theme="customed"
	/>
}
