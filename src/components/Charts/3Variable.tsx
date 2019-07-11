import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import EN from "../../constant/en";
import _ from 'lodash';

const color = [
	"#80bdfd",
	"#b0e39b",
	"#fec571",
	"#5bdcef",
	"#ff9595",
	"#a89fec",
	"#52b4ee",
	"#ddf07a",
	"#ed85a5",
	"#828de5",
	"#afe39b",
	"#fc8b89",
	"#ffe169",
	"#82ddc1",
	"#ffb287",
	"#de80b9"
];

interface Interface {
	x_name:string
	y_name:string
	z_name:string
	data:any
}

export default class ThreeVariable extends PureComponent<Interface>{
	private chart: React.RefObject<any>;
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}

	getOption() {
		const symbolSize = 5;
		const {x_name='',y_name='',z_name='',data=[]} = this.props;

		let xmin:any = Infinity;

		const series = data.sort((a,b)=>a.name - b.name).map((itm,ind)=>{
			if(!color[ind]){
				color.push('#'+Math.random().toString(16).substring(2,8))
			}
			xmin = _.min([xmin,..._.map(itm.value,it=>it[0])]);
			return {
				name:itm.name,
				type: 'scatter3D',
				symbolSize,
				data:itm.value,
				emphasis:{
					label:{
						show:false,
					}
				},
				itemStyle:{
					color:color[ind]
				},
			}
		});

		series.push({
			name:EN._Average,
			symbolSize:2,
			type: 'scatter3D',
			// symbol:'triangle',
			symbol:'path://M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z',
			itemStyle:{
				color:'#1c2b3b'
			},
		});

		series.forEach((itm,ind)=>{
			const mean = _.unzip(itm.data).map(itm=>_.mean(itm));
			series.push({
				name:EN._Average,
				symbolSize:1.5*symbolSize,
				type: 'scatter3D',
				data:[mean,[xmin-10000,0,0]],
				symbol:'triangle',
				emphasis:{
					label:{
						show:false
					}
				},
				itemStyle:{
					borderWidth:0.1,
					borderColor:'#000',
					color:color[ind]
				},
			})
		});

		return {
			tooltip: {
				show:true,
				formatter: function (params) {
					let {seriesName,value,marker,color} = params;
					if(seriesName === EN._Average){
						const list= series.filter(itm=>itm.itemStyle.color === color);
						seriesName = list[0].name + EN._NewAverage
					}
					return `
						${marker}${seriesName}<br/>
						${x_name}:${value[0].toFixed(3)}<br/>
						${y_name}:${value[1].toFixed(3)}<br/>
						${z_name}:${value[2].toFixed(3)}
					`
				},
			},
			grid3D: {},
			temporalSuperSampling:{
				enable:true,
			},
			animation:true,
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
				name:x_name,
				min:Math.floor(xmin)
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
