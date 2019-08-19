import ReactEcharts from "echarts-for-react";
import React from "react";
import echarts from 'echarts'
import _ from 'lodash'
import EN from "../../constant/en";
import { toJS } from 'mobx';

interface Interface {
	message:any
}

export default function FitBar(props:Interface){
	const {message:{
		data:DATA,
		item,
		featureWidth:widths=item.map(itm=>itm.count),
		targetUnique:x_names= item.map(itm=>itm.key),
		featureUnique:y_names=DATA.map(itm=>itm.name),
	}} = props;
	const y_width = y_names.length;

	let heights;

	if(DATA[0]&&DATA[0].value){
		heights = _.zip(...(DATA).map(itm=>{
			if(itm.value.length){
				return itm.value
			}
			return new Array(y_names.length);
		}));
	}else{
		heights = DATA;//新建变量
	}

	const x_sum = _.sum(widths);

	const x = widths.map(itm=>itm/x_sum);

	const ys = heights.map((itm)=>{
		const sum = _.sum(itm.map(it=>+it))||1;
		return itm.map((it=0)=>+it/sum)
	});

	const yNameL = Math.max(...y_names.map(itm=>itm.length));

	let data = [];
	let sum = 0;
	x.map((itm,index)=>{
		const y = ys[index];
		const y_name = _.cloneDeep(toJS(y_names));
		const x_name = x_names[index];
		const _y_name = y_name.pop();
		data.push([sum,sum+itm,y[0],0,x_name,_y_name,x_name,_y_name]);
		y.reduce((a,b)=>{
			data.push([sum,sum+itm,b,a,'','',x_name,y_name.pop()]);
			return a+b;
		});
		sum += itm;
	});
	data = (echarts as any).util.map(data, function (item, index) {
		return {
			value: item,
			itemStyle: {
				normal: {
					color: `rgba(96,168,228,${1-+[index%y_width]*(1/y_width)})`
				}
			}
		};
	});

	let _data = data.filter(itm=>!itm.value[0]);
	let __data = _.cloneDeep(_data);
	__data = __data.map(itm=>{
		const {value} = itm;
		value[1] = 0;

		return {
			...itm,
			value,
		}
	});
	function renderItem(params, api) {
		const yValue = api.value(2);
		const start = api.coord([api.value(0), yValue + api.value(3)]);
		const size = api.size([api.value(1) - api.value(0), yValue]);
		const style = api.style();

		return {
			type: 'rect',
			shape: {
				x: start[0],
				y: start[1],
				width: size[0],
				height: size[1]
			},
			style,
		};
	}

	const custom = {
		type: 'custom',
		renderItem,
		dimensions: ['from', 'to', 'profit'],
	};

	const series = [{
		...custom,
		label: {
			normal: {
				show: true,
				position: 'bottom',
				rotate:'30',
				color:'#000',
				distance:20,
			}
		},
		data,
		encode: {
			x: [0, 1],
			y: 4,
			// tooltip: [0, 1, 2],
			itemName: 3
		},
	},{
		...custom,
		label: {
			normal: {
				show: true,
				position: 'left',
				color:'#000',
			}
		},
		data:__data,
		encode: {
			x: [0, 1],
			y: 7,
			// tooltip: [0, 1, 2],
			itemName: 3
		},
	}];


	const option = {
		tooltip: {
			formatter:params=>{
				const {marker,value} = params;
				const [x_start,x_end,yp,,,,x_name,y_name] = value;
				return`
					${marker}${x_name}:${((x_end-x_start)*100).toFixed(3)}%<br/>
					${y_name}:${(yp*100).toFixed(3)}%
				`
			}
		},
		xAxis: {
			min:0,
			max:1,
			show:false,
		},
		yAxis: [{
		  min:0,
			max:1,
      axisLine:{
			  show:false
      },
      axisLabel:{
        show:false
      },
      name:"收缩压分组（mmHg)"
		},{
		  min:0,
      max:1,
      axisLine:{
        show:false
      },
      name:EN.Scale,
    }],
		series,
		dataZoom:{
			type: 'slider',
      filterMode:"none",
      rangeMode:['percent','percent']
		},
    grid:{
      top:50,
      bottom:100,
	    left:7*yNameL,
    }
	};


	return <ReactEcharts
		option={option}
		style={{height: 500, width: 600+7*yNameL}}
		notMerge={true}
		lazyUpdate={true}
		theme="customed"
	/>
}
