import React from 'react'
import ReactEcharts from 'echarts-for-react';

export default function CorrelationMatrix(){
	const result = {
		"type": [
			"BMI.double",
			"trig_change.double",
			"ldl.double",
			"bmi_change.double"
		],
		"value": [
			[
				-0.11154355915147275,
				0.0064306520281370814,
				-0.010170787152819343,
				1
			],
			[
				0.021829812258474076,
				-0.039504157889957675,
				1,
				-0.010170787152819343
			],
			[
				0.007532592472904852,
				1,
				-0.039504157889957675,
				0.0064306520281370814
			],
			[
				1,
				0.007532592472904852,
				0.021829812258474076,
				-0.11154355915147275
			]
		]
	};
	
	const {value,type} = result;
	
	let data = [];
	value.map((itm,index)=>{
		itm.forEach((it,ind)=>{
			data.push([index,ind,it]);
		})
	});
	
	data = data.map(function (item) {
		return [item[1], item[0], item[2] || '-'];
	});
	
	const option =  {
		tooltip: {
			position: 'top'
		},
		animation: true,
		grid: {
			x:200,
		},
		xAxis: {
			type: 'category',
			data: type,
			position:'top'
		},
		yAxis: {
			type: 'category',
			data: [...type].reverse(),
		},
		visualMap: {
			min: -1,
			max: 1,
			calculable: true,
			orient: 'vertical',
			left: 'right',
			bottom: 'center',
			precision:1,
			itemHeight:280,
			inRange: {color: ['#80BDFD','#fff','#B0E39B']},
			align:'bottom',
		},
		series: {
			name: 'Punch Card',
			type: 'heatmap',
			data,
			itemStyle: {
				emphasis: {
					shadowBlur: 10,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			}
		}
	};
	
	return <ReactEcharts
		option={option}
		style={{height: 400, width: 600}}
		notMerge={true}
		lazyUpdate={true}
		theme='customed'
	/>
}
