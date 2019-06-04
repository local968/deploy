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
		this.setSelectArea = debounce(this.setSelectArea, 10)
	}

	componentDidMount() {
		const {title='',field,id,project} = this.props;
		const {rawDataView={}} = project;
		let {min,max,low,high} = rawDataView[field]||{};

		if(toJS(project.outlierDictTemp)[field]){
			const data = project.outlierDictTemp[field];
			low = (parseInt(data[0]*10*10)/100).toFixed(2);
			high = (parseInt(data[1]*10*10)/100).toFixed(2);
		}else{
			low = (parseInt(low*10*10)/100).toFixed(2);
			high = (parseInt(high*10*10)/100).toFixed(2);
		}
		let selectArea = [+low,+high];
		const zoom=0.1*(max-min);
		// const zoom = 0;
		const bin = Math.min(project.stats[field].originalStats.doubleUniqueValue, 15);
		const interval = ((max-min)/bin).toFixed(2);
		const chart = this.chart.getEchartsInstance();
		
		request.post({
			url: '/graphics/outlier-range',
			data: {
				field:field + '.double',
				id,
				interval:+interval,
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
					coordRange: selectArea,
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
		const nameTextStyle = {
			color:'#000',
		};
		return {
			xAxis: {
				min,
				max,
				scale: true,
				nameTextStyle,
				axisLabel:{
					interval:0,
					rotate:10,
					formatter:num=>{
						if(+num>100000){
							const p = Math.floor(Math.log(+num) / Math.LN10).toFixed(3);
							const n = (+num * Math.pow(10, -p)).toFixed(3);
							return +n + 'e' + +p;
						}else if(+num<-100000){
							num = -num;
							const p = Math.floor(Math.log(+num) / Math.LN10).toFixed(3);
							const n = (+num * Math.pow(10, -p)).toFixed(3);
							return '-'+n + 'e' + +p;
						}
						return num;
					}
				},
			},
			yAxis: {
				nameTextStyle,
			},
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
		const _low = (parseInt(Math.max(min,start)*10*10)/100).toFixed(2);
		const _high = (parseInt(Math.min(max,end)*10*10)/100).toFixed(2);
		return [
			<div key="div" className={styles.outlierTop}>
				<div>{EN.Minimum}:<InputNum
					min={min}
					max={max}
					step={0.01}
					precision={2}
					value={_low}
					style={{ minWidth: 100 }}
					onChange={(start)=>{
						this.setState({
							selectArea:[start,end],
						},this.setBrush);
					}}
				/></div>
				<div>{EN.Maximum}:<InputNum
					min={min}
					max={max}
					step={0.01}
					precision={2}
					value={_high}
					style={{ minWidth: 100 }}
					onChange={(end)=>{
						this.setState({
							selectArea:[start,end],
						},this.setBrush);
					}}
				/></div>
			<Button onClick={this.reset.bind(this)}>{EN.Reset}</Button>
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
				<button className={styles.save} onClick={()=>saveEdit([_low,_high])}><span style={{color:'#fff'}}>{EN.Apply}</span></button>
				<button className={styles.cancel} onClick={closeEdit}><span>{EN.Cancel}</span></button>
			</div>,
		]
	}
}
