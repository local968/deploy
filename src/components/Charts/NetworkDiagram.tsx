import ReactEcharts from "echarts-for-react";
import React from "react";

interface Interface {
	data:Object
}

export default function NetworkDiagram(props:Interface) {
	const {data:_data} = props;
	const data = Object.keys(_data).map(name=>({
		name,
		symbol:'circle',
		itemStyle:{
			color:'#31C4E9',
		},
		label:{
			color:'#8A8A8A',
		}
	}));
	const links = [];

	Object.entries(_data).forEach(itm=>{
		const [source,value] = itm;
		const keys = Object.keys(value);
		keys.map(target=>{
			const {color,weight} = value[target];
			const [r,g,b,a] = color;
			const _color = `rgba(${r*256},${g*256},${b*256},${a})`;
			links.push({
				source,
				target,
				lineStyle: {
					normal: {
						color:_color,
						width:weight,
					}
				}
			})
		})
	});

	const option  = {
		// title: {
		// 	text: 'Graph 简单示例'
		// },
		// tooltip: {},
		animationDurationUpdate: 1500,
		animationEasingUpdate: 'quinticInOut',
		series : [
			{
				type: 'graph',
				layout: 'circular',
				symbolSize: 22,
				roam: 'move',
				focusNodeAdjacency:true,
				label: {
					normal: {
						show: true
					}
				},
				edgeSymbol: ['circle', 'arrow'],
				edgeSymbolSize: [4, 10],
				circular: {
					rotateLabel: true
				},
				edgeLabel: {
					normal: {
						textStyle: {
							fontSize: 20
						}
					}
				},
				data,
				links,
				lineStyle: {
					normal: {
						opacity: 1,
						width: 1,
						curveness: 0.2
					}
				}
			}
		]
	};

	return <ReactEcharts
		option={option}
		style={{height: '100%', width: '100%'}}
		notMerge={true}
		lazyUpdate={true}
		theme="customed"
	/>
}
