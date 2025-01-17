import React, { useContext, useMemo, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import request from '../Request';
import EN from "../../constant/en";
import { MobXProviderContext } from 'mobx-react';

interface Interface {
	url:string
}

export default function ParallelPlot(props:Interface){
	const { projectStore:{project:{mapHeader}} } = useContext(MobXProviderContext);
	const [ready,upReady] = useState(false);
	const [result,upResult] = useState({} as any);

	useMemo(()=>{
		const {url} = props;
		request.post({
			url: '/graphics/parallel-coordinate-map',
			data: {
				url,
			},
		}).then(result=>{
			upReady(true);
			upResult(result)
		});
	},[]);
	let option:any = {
		xAxis:{},
		yAxis:{},
	};
	if(ready){
		let {title='',schema=[],data=[]} = result;
		let len = 0;

		data.forEach(itm=>{
			len+=itm.value.length;
		});

		const skip = Math.floor(len/1000);

		if(skip>1){
			data = data.map(itm=>{
				const value = itm.value.filter((it,index)=>!(index%skip));
				return {
					name:itm.name,
					value,
				}
			})
		}

		let parallelAxis = [];

		const nameTextStyle = {
			color:'#000',
		};

		schema.forEach((itm,index)=>{
			const name = (mapHeader[itm]||itm).split('').map((itm,index)=>(!index||index%15)?itm:`${itm}\n`).join('');
			parallelAxis.push({
				dim:index+1,
				nameLocation:'start',
				name,
				nameTextStyle,
				nameRotate:15,
			})
		});

		const lineStyle = {
			normal: {
				width: 1,
				opacity: 0.5,
			},
		};
		const series = data.map(itm=>({
			name:itm.name,
			type: 'parallel',
			lineStyle,
			// data:itm.value,
			data:itm.value.map(itm=>{
				itm.unshift(undefined);
				return itm
			}),
		}));

		option = {
			title: {
				text: title,
			},
			grid:{
			},
			legend: {
				orient: 'vertical',
				type:'scroll',
				top: 50,
				bottom:50,
				right: 0,
				itemGap: 20,
				itemWidth: 50,
				itemHeight: 3,
				inactiveColor:'rgba(204,204,204,0.5)'
			},
			silent:true,
			progressiveChunkMode:'mod',
			parallelAxis,
			parallel: {
				left: '15%',
				right: '15%',
				bottom: '20%',
				top: '10%',
				parallelAxisDefault: {
					type: 'value',
					nameLocation: 'end',
					nameGap: 20,
					nameTextStyle: {
						fontSize: 12,
					},
				},
			},
			series,
			toolbox: {
				right:40,
				feature: {
					restore:{
						title:EN.restore,
					},
				},
				z: 202
			},
		};
	}

		return <ReactEcharts
			option={option}
			style={{height: 310, width: 710}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
}
