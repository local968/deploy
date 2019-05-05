import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import InputNum from'rc-input-number';
import 'rc-input-number/assets/index.css';
import { debounce } from 'lodash'

export default class Outlier extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			max:null,
			min:0,
			ready:false,
			selectArea:[]
		};
		this.chart = React.createRef();
		this.setSelectArea = debounce(this.setSelectArea, 0)
	}
	
	componentDidMount() {
		const result = {
			title:'title',
			min:-40,
			max:55,
			selectArea:[10,50],
			data:[
				[
					-40,
					-35,
					2
				],
				[
					-35,
					-30,
					4
				],
				[
					-30,
					-25,
					5
				],
				[
					-25,
					-20,
					24
				],
				[
					-20,
					-15,
					81
				],
				[
					-15,
					-10,
					103
				],
				[
					-10,
					-5,
					450
				],
				[
					-5,
					0,
					39986
				],
				[
					0,
					5,
					49417
				],
				[
					5,
					10,
					323
				],
				[
					10,
					15,
					82
				],
				[
					15,
					20,
					62
				],
				[
					20,
					25,
					6
				],
				[
					25,
					30,
					4
				],
				[
					30,
					35,
					0
				],
				[
					35,
					40,
					1
				],
				[
					40,
					45,
					0
				],
				[
					45,
					50,
					0
				],
				[
					50,
					55,
					1
				]
			]
		};
		
		const chart = this.chart.getEchartsInstance();
		 this.setState({
			...result,
			chart,
			ready:true
		},this.setBrush);
		
		
		chart.on('brushselected',  (params)=> {
			const {areas=[]} = params.batch[0];
			if(!areas[0]){
				return
			}
			const [start,end] = this.state.selectArea;
			const [_start,_end] = areas[0].coordRange;
			if(start!==_start||end!==_end){
				this.setSelectArea(areas[0].coordRange)
			}
		});
	}
	
	setSelectArea(selectArea){
		this.setState({
			selectArea,
		},this.setBrush)
	}

	setBrush(){
		const {chart,selectArea} = this.state;
		chart.dispatchAction({
			type: 'brush',
			areas: [
				{
					brushType: 'lineX',
					coordRange: selectArea,
					xAxisIndex: 0
				}
			]
		});
	}
	
	getOption() {
		const {ready,data,min,max} = this.state;
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		
		function renderItem(params, api) {
			const yValue = api.value(2);
			const start = api.coord([api.value(0), yValue]);
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
				style: style
			};
		}
		
		return {
			title: {
				text: 'Profit',
				left: 'center'
			},
			xAxis: {
				min,
				max,
				scale: true
			},
			yAxis: {},
			toolbox:{
				show:false,
			},
			series: [{
				type: 'custom',
				renderItem,
				label: {
					normal: {
						show: true,
						position: 'top'
					}
				},
				encode: {
					x: [0, 1],
				},
				data,
			}],
			brush: {
				xAxisIndex: 'all',
				brushLink: 'all',
				removeOnClick:false,
				outOfBrush: {
					opacity:0.5,
					colorAlpha: 0.5
				},
				brushStyle:{
					borderWidth: 1,
					color: 'rgba(176, 227, 155, 0.3)',
					borderColor: 'rgba(254, 197, 113, 0.8)',
				}
			},
			// dataZoom: {
			// 	type: 'inside',
			// 	xAxisIndex: [0, 1],
			// 	start: 98,
			// 	end: 100
			// },
		};
	}

	render(){
		const {max,min,selectArea} = this.state;
		const [start,end] = selectArea;
		return [<ReactEcharts
			ref = {chart=>this.chart=chart}
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			key="'chart"
			
			// onChartReady={this.onChartReadyCallback}
			// onEvents={EventsDict}
			// opts={}
			/>,
			<div key="div">
				min:<InputNum
					min={min}
					max={end}
					step={0.01}
					precision={2}
					value={start}
					style={{ width: 100 }}
					onChange={start=>{
						this.setState({
							selectArea:[start,end]
						},this.setBrush);
					}}
				/>
				max:<InputNum
				min={min}
				max={max}
				step={0.01}
				precision={2}
				value={end}
				style={{ width: 100 }}
				onChange={end=>{
					this.setState({
						selectArea:[start,end]
					},this.setBrush);
				}}
			/>
			</div>
		]
	}
}
