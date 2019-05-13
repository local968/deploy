import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import InputNum from 'rc-input-number';
import { debounce } from 'lodash'
import {Button} from 'antd'
import './echarts.config'
import EN from '../../constant/en';
import 'rc-input-number/assets/index.css'
import styles from './styles.module.css';
import request from "../Request";
import {toJS} from "mobx";

export default class OutlierRange extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			max:null,
			min:0,
			ready:false,
			selectArea:[],
		};
		this.chart = React.createRef();
		this.setSelectArea = debounce(this.setSelectArea, 0)
	}

	componentDidMount() {
		const {title='',field,id,project} = this.props;
		let {min,max,low,high} = project.rawDataView[field];

		if(toJS(project.outlierDictTemp)[field]){
			const data = project.outlierDictTemp[field];
			low = data[0];
			high = data[1];
		}
		let selectArea = [low,high];
		// const zoom=0.1*(max-min);
		const zoom = 0;
		const bin = Math.min(project.stats[field].originalStats.doubleUniqueValue, 15);
		const interval = Math.ceil((max-min)/bin);
		const chart = this.chart.getEchartsInstance();
		
		request.post({
			url: '/graphics/outlier-range',
			data: {
				field:field+'.double',
				id,
				interval,
			},
		}).then((result) => {
			this.setState({
				title,
				min:+(min-zoom).toFixed(3),
				max:+(max+zoom).toFixed(3),
				selectArea,
				data:result.data,
				chart,
				ready:true,
				low,
				high,
			},this.setBrush);
			chart.on('brushselected',  (params)=> {
				const {areas=[]} = params.batch[0];
				if(!areas[0]){
					return
				}
				const area =  areas[0];
				const {selectArea} = this.state;
				const [start,end] = selectArea;
				const [_start,_end] = area.coordRange;
				if(start!==_start||end!==_end){
					this.setSelectArea(area.coordRange)
				}
			});
			setTimeout(()=>this.reset(),0)
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
					coordRange: [Math.trunc(selectArea[0]*100)/100,Math.trunc(selectArea[1]*100)/100],
					xAxisIndex: 0,
				},
			],
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
		
		const _data = data.map(itm=>{
			const _min = Math.max(itm[0],min);
			const _max = Math.min(itm[1],max);
			return [_min,_max,itm[2]]
		});
		
		
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
					height: size[1],
				},
				style,
			};
		}
		return {
			xAxis: {
				min,
				max,
				scale: true,
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
						show: false,
						position: 'top',
					},
				},
				encode: {
					x: [0, 1],
				},
				data:_data,
			}],
			brush: {
				xAxisIndex: 'all',
				brushLink: 'all',
				removeOnClick:false,
				outOfBrush: {
					opacity:0.5,
					colorAlpha: 0.5,
				},
				brushStyle:{
					borderWidth: 1,
					color: 'rgba(176, 227, 155, 0.3)',
					borderColor: 'rgba(254, 197, 113, 0.8)',
				},
			},
			// dataZoom: {
			// 	type: 'inside',
			// 	xAxisIndex: [0, 1],
			// 	start: 98,
			// 	end: 100
			// },
		};
	}

	reset(){
		const {low,high} = this.state;
		this.setState({
			selectArea:[low,high],
		},this.setBrush);
	}

	render(){
		const {max,min,selectArea} = this.state;
		const [start,end] = selectArea;
		const {closeEdit,saveEdit} = this.props;
		return [
			<div key="div" className={styles.outlierTop}>
				<div>最小值:<InputNum
					min={min}
					max={max}
					step={0.01}
					precision={2}
					value={start}
					style={{ width: 100 }}
					onChange={(start)=>{
						this.setState({
							selectArea:[start,end],
						},this.setBrush);
					}}
				/></div>
				<div>最大值:<InputNum
					min={min}
					max={max}
					step={0.01}
					precision={2}
					value={end}
					style={{ width: 100 }}
					onChange={(end)=>{
						this.setState({
							selectArea:[start,end],
						},this.setBrush);
					}}
				/></div>
			<Button onClick={this.reset.bind(this)}>重置</Button>
			</div>,
			<ReactEcharts
			ref = {chart=>this.chart=chart}
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			key="'chart"
			/>,
			<div key='bottom' className={styles.fixesBottom}>
				<button className={styles.save} onClick={()=>saveEdit(selectArea)}><span>{EN.Apply}</span></button>
				<button className={styles.cancel} onClick={closeEdit}><span>{EN.CANCEL}</span></button>
			</div>,
		]
	}
}
