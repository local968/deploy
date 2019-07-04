import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import config from 'config'
import _ from 'lodash';
import EN from '../../constant/en';
const {isEN} = config;

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

interface DataSampleProps {
	x_name : string
	y_name : string
	width?: number
	height?:number
	data : any
	title?: string
	average?:boolean
}

export default class TSEN extends PureComponent<DataSampleProps>{
	private chart: any;
	state:{
		loading:boolean
	};
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.state = {
			loading:true,
		}
	}

	componentDidMount() {
		const chart = this.chart.getEchartsInstance();
		chart.showLoading();
		this.setState({
			loading:false,
		})
	}

	getOption() {
		const {x_name,y_name,data=[],title='',average} = this.props;
		const {loading} = this.state;

		if(data.length&&!loading){
			const chart = this.chart.getEchartsInstance();
			chart.hideLoading();
		}else{
			return {
				xAxis:{},
				yAxis:{},
			}
		}

		const series = data.sort((a,b)=>a.name - b.name).map((itm,ind)=>{
			if(!color[ind]){
				color.push('#'+Math.random().toString(16).substring(2,8))
			}
			return {
				name:itm.name,
				data:itm.value,
				type:'scatter',
				symbolSize:5,
			}
		});

		if(average){
			series.push({
				name:EN._Average,
				type: 'scatter',
				symbol:'triangle',
				itemStyle:{
					borderWidth:1,
					borderColor:'#000',
					color:'#1c2b3b'
				},
			});
			series.forEach((itm,ind)=>{
				const mean = _.unzip(itm.data).map(itm=>_.mean(itm));
				series.push({
					name:EN._Average,
					symbolSize:8,
					type: 'scatter',
					data:[mean],
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
		}

		return {
			title: {
				text: title,
				textStyle:{
					fontSize:isEN?11:15,
				},
				// padding:[5,5,5,40],
				left:40,
			},
			grid: {
				left: '6%',
				right: '20%',
				bottom: '4.5%',
				containLabel: true
			},
			dataZoom:[{
				type:"inside"
			}],
			tooltip: {
				showDelay: 0,
				formatter: function (params) {
					if (params.value.length > 1) {
						return params.seriesName + '<br/>'
							+ x_name +':'+ params.value[0].toFixed(3) + '<br/>'
							+ y_name +':'+ params.value[1].toFixed(3);
					} else {
						return params.seriesName + ' :<br/>'
							+ params.name + ' : '
							+ params.value;
					}
				},
				axisPointer:{
					show: true,
					type : 'cross',
					lineStyle: {
						type : 'dashed',
						width : 1
					},
					label:{
						precision:3
					}
				}
			},
			legend: {
				orient: 'vertical',
				top: 40,
				bottom:40,
				right: 0,
				type: 'scroll',
				zlevel:20,
			},
			xAxis: [
				{
					name: x_name,
					type: 'value',
					scale: true,
					axisLine:{
						onZero:false
					},
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: true
					},
					nameLocation:'end',
					nameGap:25,
				}
			],
			yAxis: [
				{
					name: y_name,
					type: 'value',
					scale: true,
					axisLine:{
						onZero:false
					},
					axisLabel: {
						formatter: '{value}'
					},
					splitLine: {
						show: true
					},
					nameLocation:'end',
					nameGap:23,
				}
			],
			series,
			// toolbox: {
			// 	show : true,
			// 	feature : {
			// 		dataZoom: {},
			// 		brush: {
			// 			type: ['rect', 'clear']
			// 		},
			// 		dataView : {show: true, readOnly: false},
			// 		magicType : {show: true, type: ['line', 'bar']},
			// 		restore : {show: true},
			// 		saveAsImage : {show: true}
			// 	}
			// }
		}
	}

	render(){
		const {width=550,height=400} = this.props;
		return <ReactEcharts
			option={this.getOption()}
			ref = {chart=>this.chart=chart}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
