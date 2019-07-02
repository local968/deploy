import React, {Component} from 'react'
import ReactEcharts from 'echarts-for-react';
import * as _ from "lodash";
import {debounce} from "lodash";
import InputNum from'rc-input-number';
import 'rc-input-number/assets/index.css';
import request from "../Request";
import EN from "../../constant/en";
import styles from './charts.module.css';
import { Button } from 'antd';
import { Hint, Switch } from 'components/Common';
import {observer} from "mobx-react";

interface DataSampleProps {
	x_name:string
	y_name:string
	model:any
	project:any
}

@observer
export default class PVA extends Component<DataSampleProps>{
	private chart: any;
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.setSlider = debounce(this.setSlider, 1000);
		this.state = {
			sliderValue : [0,100],
			ready:false,
			chartDate:[],
			holdOutChartDate:[],
			loading:'',
			isHoldout:false,
			selected:{},
		};
	}

	componentWillReceiveProps(nextProps) {
		const {model} = this.props as any;
		if(nextProps.model.validatePlotData !== model.validatePlotData){
			return this.componentDidMount(nextProps.model);
		}
	}

	//@ts-ignore
	async componentDidMount(model=this.props.model||{}) {
		const { validatePlotData, holdoutPlotData } = model as any;
		const {data} = this.props as any;

		if(!data){
			request.post({
				url: '/graphics/list',
				data: [{
					name: 'predicted-vs-actual-plot',
					data: {
						url: validatePlotData,
					}
				}, {
					name: 'predicted-vs-actual-plot',
					data: {
						url: holdoutPlotData,
					}
				}]
			}).then(data => {
				const [chartDate, holdOutChartDate] = data;
				this.setState({
					chartDate:chartDate.data,
					holdOutChartDate:holdOutChartDate.data,
					ready:true,
					isHoldout:false,
				})
			});
		}else{
			const [holdOutChartDate,chartDate] = data;
			this.setState({
				chartDate:chartDate.data,
				holdOutChartDate:holdOutChartDate.data,
				ready:true,
			})
		}
	}

	async setSlider(sliderValue,loading=''){
		const {loading:_loading,sliderValue:_sliderValue} = this.state as any;
		const [start,end] = _sliderValue;
		const [_start,_end] = sliderValue;

		if(loading!==_loading){
			this.setState({
				loading,
			});
		}

		if(!this.chart){
			return;
		}
		const chart = this.chart.getEchartsInstance();
		chart.hideLoading();
		chart.on('legendselectchanged', ({selected})=> {
			this.setState({
				selected
			})
		});
		if(start!==_start||end!==_end||loading){
			const rebuild = start === _start||end===_end||Math.abs(start-end-_start+_end)>0.1;
			if(!rebuild&&!loading){
				return this.setState({
					sliderValue,
				})
			}
			await this.setState({
				ready:false,
			},()=>chart.showLoading());
			setTimeout(async()=>{
				await this.setState({
					sliderValue,
					ready:true,
				});
			},100)
		}
	}

	getOption() {
		const {ready,chartDate,holdOutChartDate,sliderValue:_sliderValue,selected} = this.state as any;
		const {project,y_name} = this.props as any;
		const {isHoldout} = project;
		const data = isHoldout?holdOutChartDate:chartDate;
		const _data = _.cloneDeep(data);
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}

		const sliderValue = _.cloneDeep(_sliderValue);
		const [start,end] = sliderValue;

		let sum = 100/(end-start)*100;

		const barLength = _.max([_.size(_data[0].value)/sum,1]);

		let chunk;

		let max = 0;

		const series = _data.map(itm=>{
			chunk = _.chunk(itm.value,barLength);
			const data = _.map(chunk,(itm,index:number)=>[index*100/chunk.length,_.sum(itm)/_.size(itm)]);
			max = _.max([max,...data.map(itm=>itm[1])]);
			return {
				type: 'line',
				name:EN[itm.name],
				symbolSize: 3,
				yAxisIndex: 0,
				smooth: false,
				data,
			}
		});

		max = Math.abs(max)>10e8?10e8:max;

		const ResidualRate = series[0].data.map((itm,index)=>{
			const act = itm[1];
			const pre = series[1].data[index][1];
			return [index*100/chunk.length,act?Math.abs((act-pre)*100/act):0];
		});

		series.push({
			name:EN.ResidualRate,
			yAxisIndex: 1,
			type: 'bar',
			data:ResidualRate,
		});

		const minValueSpan = 100/_.size(_data[0].value) * 3;//最少显示3个点

		const grid:any = {
			y2:80,
		};

		const maxL = (`${parseInt(String(max))}`.length);

		if(maxL>5){
			grid.x = (`${parseInt(String(max))}`.length) * 18 + 20;
		}

		return {
			title:{
				subtext:EN.ZoomRegion,
				right:234,
				top:19,
				subtextStyle:{
					fontSize:12,
				}
			},
			dataZoom: [{
				type: 'slider',
				rangeMode:['percent','percent'],
				labelPrecision:2,
				realtime:false,
				xAxisIndex: [0],
				labelFormatter: (value)=> {
					if(!isNaN(Number(`${value}`))){
						sliderValue.shift();
						sliderValue.push(value);
						 this.setSlider(sliderValue);
						return value.toFixed(3);
					}
				},
				start,
				end,
				minValueSpan,
			},{
				type: 'inside',
				start,
				end,
				xAxisIndex: [0],
				rangeMode:['percent','percent'],
				labelPrecision:2,
				minValueSpan,
			}],
			xAxis: {
				// name:x_name,
				type: 'value',
				min:0,
				max:100,
			},
			yAxis: [{
				name: y_name,
				type: 'value',
				axisLabel:{
					formatter: (value)=>{
						if(String(parseInt(value)).length>10){
							const p = Math.floor(Math.log(Math.abs(value)) / Math.LN10);
							const n = value * Math.pow(10, -p);
							return n.toFixed(3) + 'e+' + p
						}
						return value;
					}
				}
			},{
				name: EN.ResidualPercent,
				type: 'value'
			}],
			legend: {
				selected,
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params) {
					const result = [{
						name:EN.ActualValues,
						percent:'',
					},{
						name:EN.PredictedValues,
						percent:'',
					},{
						name:EN.ResidualRate,
						percent:'%',
					}];
					//@ts-ignore
					params.forEach((itm)=>(result.filter((it:any)=>it.name === itm.seriesName && !it.value)[0]||{}).value = itm.data[1].toFixed(3));

					let res = '';
					result.filter((itm:any)=>itm.value).forEach((itm:any)=>res+=(`${itm.name}:${itm.value}${itm.percent}<br/>`));
					return res;
				},
			},
			series,
			grid,
			toolbox:{
				show : true,
				top:20,
				right:200,
				itemSize:20,
				feature : {
					dataZoom: {
						title:{
							// zoom:EN.ZoomRegion,
							zoom:'',
						},
						icon:{
							back:'image://'
						}
					},
				}
			}
		};

	}
	handleHoldout(){
		const {project} = this.props as any;
		const {isHoldout} = project;
		project.upIsHoldout(!isHoldout);
	}

	render(){
		const {loading,chartDate,holdOutChartDate} = this.state as any;
		const {project} = this.props as any;
		const {isHoldout} = project;
		const data = isHoldout?holdOutChartDate:chartDate;

		if(!data[0]){
			return null;
		}
		const act = _.cloneDeep(data[0].value)||[];

		const yMin = _.min(act);
		const yMax = _.max(act);
		const {range= [yMin,yMax],yRange= [0,_.size(act)]} = this.state as any;
		const [x,y] = range;
		let [y_start,y_end] = yRange;
		return [
			<div className={styles.predictActual} key='predictActual'>
				<div className={styles.title}>
					{EN.PredictedVSActualPlotSorted}
					<Hint content={<p><strong>{EN.ChartDescription}</strong><br/>
						{EN.ChartOrder}<br/>
						{EN.ChartSplit}<br/>
						{EN.ChartSHowWhat}<br/>
						{EN.ChartZone}<br/>
						<div style={{paddingLeft:20}}>
							{EN.ChartZoneA}<br/>
							{EN.ChartZoneB}<br/>
							{EN.ChartZoneC}<br/>
						</div>
						{EN.ChartReset}</p>}
						/>
				</div>
				<div className={styles.metricSwitch} style={{top:-25}}>
					<span>{EN.Validation}</span>
					<Switch checked={isHoldout} onChange={this.handleHoldout.bind(this)} style={{ backgroundColor: '#1D2B3C' }} />
					<span>{EN.Holdout}</span>
				</div>
				<ReactEcharts
					key='echart'
					option={this.getOption()}
					ref = {chart=>this.chart=chart}
					style={{height: 400, width: 800}}
					notMerge={true}
					lazyUpdate={true}
					theme='customed'
					/>
				<div className={styles.pva} id='pva'>
					{EN.InputRanges}:
					<InputNum
						min={yMin}
						max={y}
						// step={0.0001}
						precision={4}
						value={x}
						style={{ width: 100,marginLeft:20 }}
						onChange={min=>{
							let start = _.indexOf(act,_.find(act,itm=>itm>min));
							start = start > 0 ? start-1:start;
							this.setState({
								yRange:[start,y_end],
								range:[min,y]
							});
							// this.updatePoint(slider_value)
						}}
					/>~
					<InputNum
						min={x}
						max={yMax}
						// step={0.0001}
						precision={4}
						value={y}
						style={{ width: 100 }}
						onChange={max=>{
							let end = _.indexOf(act,_.find(_.reverse(act),itm=>itm<max));
							this.setState({
								yRange:[y_start,end+1],
								range:[x,max]
							});
						}}
					/>
					<Button
						type="primary"
						loading={loading === 'change'}
						disabled={loading === 'reset'}
						onClick={()=>{
							if(y_start === y_end){
								y_end++
							}
							return this.setSlider([y_start/act.length*100,y_end/act.length*100],'change')
						}}
					>{EN.Yes}</Button>
					<Button
						loading={loading === 'reset'}
						disabled={loading === 'change'}
						onClick={()=>{
							return this.setSlider([0,100],'reset')
						}}
					>{EN.Reset}</Button>

				</div>
			</div>
		]
	}
}
