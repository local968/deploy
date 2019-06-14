import React, {Component} from 'react'
import ReactEcharts from 'echarts-for-react';
import * as _ from "lodash";
import {debounce} from "lodash";
import InputNum from'rc-input-number';
import classNames from 'classnames';
// import Slider from "rc-slider";
import 'rc-input-number/assets/index.css';
// import 'rc-slider/assets/index.css';
import request from "../Request";
import EN from "../../constant/en";
import styles from './charts.module.css';
import Hint from "../Common/Hint";


// const createSliderWithTooltip = Slider.createSliderWithTooltip;
// const Range = createSliderWithTooltip(Slider.Range);

export default class PVA extends Component{
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.setSlider = debounce(this.setSlider, 1000);
		this.state = {
			sliderValue : [0,100],
			ready:false,
			data:[],
		}
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.url !== this.props.url){
			return this.componentDidMount(nextProps.url);
		}
	}
	
	async componentDidMount(url=this.props.url) {
		let data = this.props.data;
		if(!data){
			data = (await request.post({
				url:'/graphics/predicted-vs-actual-plot',
				data:{
					url,
				},
			})).data;
		}
		
		// data[0].name = EN.ActualValues;
		// data[1].name = EN.PredictedValues;
		this.setState({
			data,
			ready:true,
		})
	}
	
	async setSlider(sliderValue){
		const [start,end] = this.state.sliderValue;
		const [_start,_end] = sliderValue;
		if(!this.chart){
			return;
		}
		const chart = this.chart.getEchartsInstance();
		chart.hideLoading();
		if(start!==_start||end!==_end){
			const rebuild = start === _start||end===_end||Math.abs(start-end-_start+_end)>0.1;
			if(!rebuild){
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
		const {ready,data} = this.state;
		const _data = _.cloneDeep(data);
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		
		const sliderValue = _.cloneDeep(this.state.sliderValue);
		const {x_name='',y_name=''} = this.props;
		const [start,end] = sliderValue;
		
		let sum = 100/(end-start)*100;
		
		const barLength = _.max([_.size(_data[0].value)/sum,1]);
		
		sum = _.min([sum,_.size(_.chunk(_data[0].value,barLength))]);
		
		const series = _data.map(itm=>({
			type: 'line',
			name:EN[itm.name],
			symbolSize: 3,
			yAxisIndex: 0,
			smooth: false,
			data:_.map(_.chunk(itm.value,barLength),(itm,index)=>[index*100/sum,_.sum(itm)/_.size(itm)]),
		}));
		
		
		const ResidualRate = series[0].data.map((itm,index)=>{
			const act = itm[1];
			const pre = series[1].data[index][1];
			return [index,Math.abs((act-pre)*100/act)];
		});
		
		series.push({
			name:EN.ResidualRate,
			yAxisIndex: 1,
			type: 'bar',
			data:ResidualRate,
		});
		
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
					if(!isNaN(`${value}`)){
						sliderValue.shift();
						sliderValue.push(value);
						this.setSlider(sliderValue);
						return value.toFixed(3);
					}
				},
				start,
				end,
			},{
				type: 'inside',
				start,
				end,
				xAxisIndex: [0],
				rangeMode:['percent','percent'],
				labelPrecision:2,
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
			},{
				name: EN.ResidualPercent,
				type: 'value'
			}],
			legend: {},
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
					params.forEach(itm=>(result.filter(it=>it.name === itm.seriesName && !it.value)[0]||{}).value = itm.data[1].toFixed(3));
					
					let res = '';
					result.filter(itm=>itm.value).forEach(itm=>res+=(`${itm.name}:${itm.value}${itm.percent}<br/>`));
					return res;
				},
			},
			series,
			grid:{
				// x2:130,
				y2:80,
			},
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
	
	render(){
		const {data} = this.state;
		if(!data[0]){
			return null;
		}
		const act = _.cloneDeep(data[0].value)||[];
		const pre = _.cloneDeep(data[1].value)||[];
		
		const yMin = _.min(act);
		const yMax = _.max(act);
		const {range= [yMin,yMax],yRange= [0,_.size(act)]} = this.state;
		const [x,y] = range;
		let [y_start,y_end] = yRange;
		return [
			<div className={styles.predictActual}>
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
							// let start = _.min([lines1.indexOf(lines1.find(itm=>itm>min)),lines2.indexOf(lines2.find(itm=>itm>min))]);
							let start = _.min([_.indexOf(act,_.find(act,itm=>itm>min)),_.indexOf(pre,_.find(pre,itm=>itm>min))]);
							
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
							let end = _.max([_.indexOf(act,_.find(_.reverse(act),itm=>itm<max)),_.lastIndexOf(pre,_.find(_.reverse(pre),itm=>itm<max))]);
							this.setState({
								yRange:[y_start,end+1],
								range:[x,max]
							});
						}}
					/>
					<button className={classNames(styles.button,styles.small)} onClick={()=>{
						if(y_start === y_end){
							y_end++
						}
						return this.setSlider([y_start/act.length*100,y_end/act.length*100])
					}}>{EN.Yes}</button>
					<button className={classNames(styles.button,styles.small,styles.white)} onClick={()=>{
						return this.setSlider([0,100])
					}}>{EN.Reset}</button>
				</div>
			</div>
		]
	}
}
