import React, {Component} from 'react'
import ReactEcharts from 'echarts-for-react';
import * as _ from "lodash";
import {debounce} from "lodash";
import Slider from 'rc-slider';
import 'rc-input-number/assets/index.css';
import 'rc-slider/assets/index.css';
import { toJS } from 'mobx';

export default class HS extends Component{
	private chart: any;
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.setSlider = debounce(this.setSlider, 1000);
		const {result,data} = props;
		const {min=0,max=0,interval=1} =result||data;
		const _data = result?data:data.data;
		this.state = {
			sliderValue : [min,max],
			ready:true,
			step:1,
			data:toJS(_data),
			min,
			max,
			interval,
		}
	}

	componentDidMount() {
		this.chart.getEchartsInstance().showLoading();
	}

	async setSlider(sliderValue){
		const {sliderValue:_sliderValue} = this.state as any;
		const [start,end] = _sliderValue;
		const [_start,_end] = sliderValue;
		if(this.chart){
			const chart = this.chart.getEchartsInstance();
			chart.hideLoading();
			if(start!==_start||end!==_end){
				const rebuild = start === _start||end===_end||Math.abs(start-end-_start+_end)>0.1;
				if(rebuild){
					this.setState({
						sliderValue,
					})
				}
			}
		}
	}

	getOption() {
		const {ready,step,sliderValue:_sliderValue,data,min,max} = this.state as any;
		let {title,x_name,y_name} = this.props as any;
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}


		const sliderValue = _.cloneDeep(_sliderValue);
		let _data = _.cloneDeep(data);
		const [start,end] = sliderValue;

		const series = [{
			yAxisIndex: 0,
			type: 'bar',
			data:_.map(_.chunk(_data,step),(itm)=>{
				let x=[],y=0;
				_.forEach(itm,it=>{
					x.push(it[0]);
					y+=it[1];
				});
				return [_.mean(x),y]
			}),
		}];

		const nameTextStyle = {
			color:'#000',
		};
		const fontSize = 15;
		title = _.chunk([...title],35).map(itm=>itm.join('')).join('\n');

		const minValueSpan = (max-min)/_.size(data) * step;//最少显示3个点

		return {
			title: {
				text: title,
				x: 'center',
				textStyle:{
					fontSize
				}
			},
			dataZoom: [{
				type: 'slider',
				rangeMode:['value','value'],
				labelPrecision:2,
				// realtime:false,
				labelFormatter: (value)=> {
					if(!isNaN(Number(`${value}`))){
						sliderValue.shift();
						sliderValue.push(value);
						this.setSlider(sliderValue);
						return value.toFixed(3);
					}
				},
				startValue:start,
				endValue:end,
				minValueSpan,
			} ,{
				type: 'inside',
				// start,
				// end,
				rangeMode:['value','value'],
				labelPrecision:2,
				minValueSpan,
			}
			],
			xAxis: {
				name:x_name,
				type: 'value',
				// min,
				// max,
				nameLocation:'middle',
				nameGap:25,
				nameTextStyle,
				axisLabel:{
					interval:Math.floor((data.length/5)),
					formatter: (value)=>value.toFixed(2),
				},
			},
			yAxis: {
				name: y_name,
				type: 'value',
				nameTextStyle,
			},
			legend: {},
			series,
			grid:{
				y2:80,
			},
			toolbox:{
				show : true,
				right:30,
				itemSize:20,
				feature : {
					dataZoom: {
						icon:{
							back:'image://'
						}
					},
				}
			}
		};
	}

	render(){
		const {step,data,interval} = this.state as any;
		return [
			<ReactEcharts
				key='echart'
				option={this.getOption()}
				ref = {chart=>this.chart=chart}
				style={{height: 400, width: 580}}
				notMerge={true}
				lazyUpdate={true}
				theme='customed'
			/>,
			<div key='s'
			     style={{
			     	 textAlign:'left',
				     width:550,
			     }}>
				当前比例：{step * interval}
			</div>,
			<div key='y' id='pva'
			     style={{
						 width:550,
				     display:'flex',
				     whiteSpace:'nowrap',
				}}>
				比例:
				<Slider
					min={1}
					max={data.length}
					step={1}
					value = {step}
					onChange={step=>{
						this.setState({
							step,
						})
					}}
				/>
			</div>
		]
	}
}
