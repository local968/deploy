import ReactEcharts from "echarts-for-react";
import React, { ReactElement } from 'react';

interface Interface {
	data:Object
}

export default function NetworkDiagram(props:Interface):ReactElement {
	const {data:_data} = props;
	const data = Object.keys(_data).map(name=>{
		const color = name.match(/^R\d+$/)?'yellow':'#31C4E9';
		return {
			name,
			symbol:'circle',
			itemStyle:{
				color,
			},
			label:{
				color:'#8A8A8A',
			}
		}
	});
	const links = [];

	let edgeSymbolSize = 10;

	Object.entries(_data).forEach(itm=>{
		const [source,value] = itm;
		const keys = Object.keys(value);
		keys.map(target=>{
			const {color,weight} = value[target];
			const [r,g,b,a] = color;
			const _color = `rgba(${r*255},${g*255},${b*255},${a})`;
			edgeSymbolSize = Math.max(edgeSymbolSize,2*weight);
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
		animationDurationUpdate: 1500,
		animationEasingUpdate: 'quinticInOut',
		series : [
			{
				type: 'graph',
				layout: 'circular',
				symbolSize: 22,
				roam: false,
				focusNodeAdjacency:true,
				label: {
					normal: {
						show: true
					}
				},
				edgeSymbol: ['', 'arrow'],
				edgeSymbolSize,
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
