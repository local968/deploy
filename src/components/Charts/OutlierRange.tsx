import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import InputNum from 'rc-input-number';
import { default as _, debounce } from 'lodash';
import {Button} from 'antd'
import './echarts.config'
import EN from '../../constant/en';
import 'rc-input-number/assets/index.css'
import styles from './styles.module.css';
import request from "../Request";
import {toJS} from "mobx";

interface Interface {
	closeEdit:any
	saveEdit:any
	field:any
	id:string
	project:any
	title?:string
}

export default class OutlierRange extends PureComponent<Interface>{
	private chart: any;
	state:any;
	constructor(props){
		super(props);
		const {field,project} = props;
		const {rawDataView={},outlierDictTemp} = project;
		let {low,high} = rawDataView[field];
		const bin = Math.min(project.rawDataView[field].doubleUniqueValue, 14);
		const interval = (high-low)/ 10;

		const startValue =  +low - 2 * +interval;
		const endValue =  +high + 2 *+interval;

		if(toJS(outlierDictTemp)[field]){
			const data = outlierDictTemp[field];
			low = (+data[0]).toFixed(2);
			high =(+data[1]).toFixed(2);
		}
		this.state = {
			max:null,
			min:0,
			ready:false,
			selectArea:[low,high],//选中的区域
			low:0,
			high:0,
			sliderValue:[+(startValue.toFixed(3)),+(endValue.toFixed(3))],//当前显示的范围
			bin,
		};
		this.chart = React.createRef();
		this.setSelectArea = debounce(this.setSelectArea, 10);
    this.setSlider = debounce(this.setSlider, 1000);
    this.getData = debounce(this.getData, 1000);
	}

	componentDidMount() {
		this.getData();
	}

	async setSlider(sliderValue){
		const {sliderValue:_sliderValue} = this.state;
		const [start,end] = _sliderValue;
		const [_start,_end] = sliderValue;
		if(this.chart){
			const chart = this.chart.getEchartsInstance();
			chart.hideLoading();
			if(start!==_start||end!==_end){
				this.setState({
					sliderValue,
				},()=>{
					this.getData();
					chart.showLoading();
				});
			}
		}
	}

	getData() {
		const {title='',field,id,project} = this.props;
		const {sliderValue,bin,chart=this.chart.getEchartsInstance()} = this.state;
		const {rawDataView={}} = project;
		let {min,max,low,high} = rawDataView[field];

		low = low.toFixed(6);
		high = high.toFixed(6);

		if(toJS(project.outlierDictTemp)[field]){
			const data = project.outlierDictTemp[field];
			low = (+data[0]).toFixed(6);
			high =(+data[1]).toFixed(6);
		}

		const [rs,re] = sliderValue;

		const _re = re + (re - rs)/1000;


		const interval = (re-rs) / bin;
		const _interval = (_re-rs) / bin;

		request.post({
			url: '/graphics/outlier-range',
			data: {
				field:field + '.double',
				id,
				interval:+(_interval.toFixed(3)),
				range:sliderValue,
			},
		}).then((result:any) => {
			this.setState({
				title,
				min:(Math.max(+min,+low)).toFixed(3),
				max:(Math.min(+max,+high)).toFixed(3),
				data:result.data,
				chart,
				ready:true,
				low,
				high,
				interval,
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
			// setTimeout(()=>this.reset(),0)
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
		const {ready,data,sliderValue:_sliderValue,selectArea,bin} = this.state;
		const {field,project} = this.props;
		const {min,max,low,high} = project.rawDataView[field];
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		const sliderValue = _.cloneDeep(_sliderValue);

		const [startValue,endValue] = sliderValue;

		const _endValue = endValue + (endValue - startValue)/1000;


		const _data = data.map(itm=>{
			// const _min = Math.max(itm[0],min);
			// const _max = Math.min(itm[1],max);
			const _min = Math.max(itm[0],startValue);
			const _max = Math.min(itm[1],_endValue);
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
				min:_.min([startValue,low,min,min - 0.5*(max-min)/2,selectArea[0]]),
				max:_.max([endValue,high,max,max + 0.5*(max-min)/2,selectArea[1]]),
				scale: true,
				nameTextStyle,
				axisLabel:{
					interval:0,
					rotate:10,
					formatter:num=>{
						if(+num>1000000){
							const p = Math.floor(Math.log(+num) / Math.LN10).toFixed(3);
							const n = (+num * Math.pow(10, -p)).toFixed(3);
							return +n + 'e+' + +p;
						}else if(+num<-1000000){
							num = -num;
							const p = Math.floor(Math.log(+num) / Math.LN10).toFixed(3);
							const n = (+num * Math.pow(10, -p)).toFixed(3);
							return '-'+n + 'e+' + +p;
						}
						return num.toFixed(3);
					}
				},
			},
			yAxis: {
				nameTextStyle,
			},

			toolbox:{
				show:false,
			},
			tooltip : {},
			series: {
				type: 'custom',
				renderItem,
				label: {
					normal: {
						show: bin<=20,
						position: 'top',
					},
				},
				encode: {
					x: [0, 1],
					y: 2,
					// tooltip: [0, 1, 2],
					itemName: 3
				},
				data:_data,
        tooltip:{
          trigger: 'item',
          formatter:params=>{
            const {marker,value} = params;
            const [x,y,z] = value;
            return `
						${marker}[${x.toFixed(3)},${y.toFixed(3)}):${z}
					`;
          }
        },
			},
			dataZoom: [{
				type: 'inside',
				rangeMode:['value','value'],
				startValue,
				endValue:_endValue,
			},{
				type: 'slider',
				rangeMode:['value','value'],
				startValue,
				endValue:_endValue,
				labelPrecision:2,
				backgroundColor:"rgba(204,204,204,0.2)",
				labelFormatter: (value)=> {
					if(value === _endValue){
						value = endValue;
					}
					if(!isNaN(Number(`${value}`))){
						sliderValue.shift();
						sliderValue.push(value);
						this.setSlider(sliderValue);
						return value.toFixed(3);
					}
				},
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
		};
	}

	reset(force=false){
		const {chart} = this.state;
		const {field,project} = this.props;
		const {rawDataView={}} = project;
		let {low,high} = rawDataView[field];

    this.setState({
			selectArea:[low,high],
		},this.setBrush);
		if(force){
			const bin = Math.min(rawDataView[field].doubleUniqueValue, 14);
			const interval = (high-low)/ 10;
			const startValue =  +low - 2 * +interval;
			const endValue =  +high + 2 *+interval;
      this.setState({
				sliderValue:[+(startValue.toFixed(3)),+(endValue.toFixed(3))],
        bin,
      },()=>{
	      chart.showLoading();
				this.getData();
			});
		}
	}

	render(){
		const {selectArea,sliderValue,bin} = this.state;
    const {field,project} = this.props;
    const {min,max} = project.rawDataView[field];
		const [start,end] = selectArea;
		const {closeEdit,saveEdit} = this.props;
    const [startValue,endValue] = sliderValue;

		const __max = max;
		const __min = min;

    return [
			<div key="div" className={styles.outlierTop}>
				<div>{EN.Minimum}:<InputNum
					max={+end-0.01}
					step={0.01}
					precision={2}
					value={+start}
					style={{ minWidth: 100 }}
					onChange={(start)=>{
						if(start === '-'){
							start = '-0'
						}
						if(+start>=+end){
							start = ((end).toFixed(2)*100 - 1)/100;
						}
						this.setState({
							selectArea:[+start,+end],
						},this.setBrush);
					}}
				/></div>
				<div>{EN.Maximum}:<InputNum
					min={+start+0.01}
					step={0.01}
					precision={2}
					value={+end}
					style={{ minWidth: 100 }}
					onChange={(end)=>{
						if(end === '-'){
							end = '-0'
						}
						if(+start>=+end){
							end = ((end).toFixed(2)*100 + 1)/100
						}
						this.setState({
							selectArea:[+start,+end],
						},this.setBrush);
					}}
				/></div>
			<Button onClick={this.reset.bind(this,true)}>{EN.Reset}</Button>
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
      <div className={styles.outlierRanged} key='pva' id='pva'>
        <div className={styles.minmax}>
          {EN.ChartDisplayRange}:
          <section>
            <InputNum
              max={+endValue}
              precision={3}
              value={+startValue}
              style={{ minWidth: 100,marginLeft:20 }}
              onChange={min=>{
                if(min>=+endValue){
                  min = endValue - 0.0001
                }
                return this.setSlider([min,+endValue]);
              }}
            />
            <a
	            className = {startValue===__min?styles.disable:''}
	            href="javascript:" onClick={()=>startValue!==__min&&this.setSlider([__min,endValue])}>{EN.SetToMinimum}</a>
          </section>
          <span>~</span>
          <section>
            <InputNum
              min={+startValue}
              precision={3}
              value={+endValue}
              style={{ minWidth: 100 }}
              onChange={max=>{
                if(max<=+startValue){
                  max = +startValue + 0.0001
                }
                return this.setSlider([+startValue,max]);
              }}
            />
            <a
	            className = {endValue===__max?styles.disable:''}
	            href="javascript:" onClick={()=>endValue!==__max&&this.setSlider([startValue,__max])}>{EN.SetToMaximum}</a>
          </section>
        </div>

        <div>
          {EN.NumberOfCartons}:<InputNum
          min={1}
          max={10000}
          precision={0}
          value={bin}
          style={{ width: 100 }}
          onChange={bin=>{
	          bin&&this.setState({
              bin
            },()=>this.getData())
          }}
        />(&lt;=10,000)
          {/*<button className={styles.save} onClick={()=>saveEdit([_low,_high])}><span style={{color:'#fff'}}>{EN.Apply}</span></button>*/}
        </div>
      </div>,
			<div key='bottom' className={styles.fixesBottom}>
				<button className={styles.save} onClick={()=>saveEdit(selectArea)}><span style={{color:'#fff'}}>{EN.Apply}</span></button>
				<button className={styles.cancel} onClick={closeEdit}><span>{EN.Cancel}</span></button>
			</div>,
		]
	}
}
