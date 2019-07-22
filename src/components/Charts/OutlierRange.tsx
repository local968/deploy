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

interface DataSampleProps {
	closeEdit:any
	saveEdit:any
	field:any
	id:string
	project:any
	title?:string
}

export default class OutlierRange extends PureComponent<DataSampleProps>{
	private chart: any;
	state:any;
	constructor(props){
		super(props);
		const {field,project} = props;
		const {rawDataView={}} = project;
		let {low,high} = rawDataView[field];
		const bin = Math.min(project.rawDataView[field].doubleUniqueValue, 10);
		const interval = ((high-low)/bin).toFixed(2);
		// const interval = (Math.max((high-low)/bin,(re-rs)/9999)).toFixed(2);

		const startValue =  +low - +interval;
		const endValue =  +high + +interval;
		this.state = {
			max:null,
			min:0,
			ready:false,
			selectArea:[],
			low:0,
			high:0,
			sliderValue:[startValue,endValue],
			bin,
			// interval,
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
		const {title='',field,id,project,} = this.props;
		const {sliderValue,bin} = this.state;
		const {rawDataView={}} = project;
		let {min,max,low,high} = rawDataView[field];

		low = low.toFixed(2);
		high = high.toFixed(2);

		if(toJS(project.outlierDictTemp)[field]){
			const data = project.outlierDictTemp[field];
			low = (+data[0]).toFixed(2);
			high =(+data[1]).toFixed(2);
		}

		let selectArea = [+low,+high];
		// const bin = Math.min(project.rawDataView[field].doubleUniqueValue, 10);
		// const interval = (Math.max((high-low)/bin,(max-min)/9999)).toFixed(2);
		const [rs,re] = sliderValue;
		const interval = (Math.max((high-low)/bin,(re-rs)/9999)).toFixed(2);
		const chart = this.chart.getEchartsInstance();

		request.post({
			url: '/graphics/outlier-range',
			data: {
				field:field + '.double',
				id,
				interval:+interval,
				range:sliderValue,
			},
		}).then((result:any) => {

			this.setState({
				title,
				min:(Math.min(+(min),low)).toFixed(3),
				max:(Math.max(+(min),high)).toFixed(3),
				selectArea,
				data:result.data,
				chart,
				ready:true,
				low,
				high,
				interval,
				// sliderValue:[startValue,endValue],
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
		const {ready,data,interval,sliderValue:_sliderValue} = this.state;
		const {field,project} = this.props;
		const {min,max,low,high} = project.rawDataView[field];
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		const sliderValue = _.cloneDeep(_sliderValue);

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
		const [startValue,endValue] = sliderValue;
		return {
			xAxis: {
				min:Math.min(startValue,+min- 2 * +interval),
				max:Math.max(endValue,+max+ 2 * +interval),
				scale: true,
				nameTextStyle,
				axisLabel:{
					interval:0,
					rotate:10,
					formatter:num=>{
						if(+num>100000){
							const p = Math.floor(Math.log(+num) / Math.LN10).toFixed(3);
							const n = (+num * Math.pow(10, -p)).toFixed(3);
							return +n + 'e+' + +p;
						}else if(+num<-100000){
							num = -num;
							const p = Math.floor(Math.log(+num) / Math.LN10).toFixed(3);
							const n = (+num * Math.pow(10, -p)).toFixed(3);
							return '-'+n + 'e+' + +p;
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
			dataZoom: [{
				type: 'inside',
				rangeMode:['value','value'],
				startValue,
				endValue,
			},{
				type: 'slider',
				rangeMode:['value','value'],
				startValue,
				endValue,
				labelPrecision:2,
				backgroundColor:"rgba(204,204,204,0.2)",
				labelFormatter: (value)=> {
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
		const {field,project} = this.props;
		const {rawDataView={}} = project;
		let {low,high} = rawDataView[field];
		// const startValue =  +low-Math.abs(low)*0.1;
		// const endValue =  +high+Math.abs(high)*0.1;

    this.setState({
			selectArea:[low,high],
		},this.setBrush);
		if(force){
      const bin = Math.min(rawDataView[field].doubleUniqueValue, 10);
      const interval = ((high-low)/bin).toFixed(2);
      const startValue =  +low - +interval;
      const endValue =  +high + +interval;
      this.setState({
				sliderValue:[startValue,endValue],
        bin,
      },()=>{
				this.getData();
			});
		}
	}

	render(){
		const {selectArea,sliderValue,interval=0,bin} = this.state;
    const {field,project} = this.props;
    const {min,max} = project.rawDataView[field];
		const [start,end] = selectArea;
		const {closeEdit,saveEdit} = this.props;
		const _low = Math.max(min,start).toFixed(2);
		const _high = Math.min(max,end).toFixed(2);
    const [startValue,endValue] = sliderValue;

    return [
			<div key="div" className={styles.outlierTop}>
				<div>{EN.Minimum}:<InputNum
					min={+min}
					max={+max}
					step={0.01}
					precision={2}
					value={+_low||0}
					style={{ minWidth: 100 }}
					onChange={(start)=>{
						this.setState({
							selectArea:[+start,+end],
						},this.setBrush);
					}}
				/></div>
				<div>{EN.Maximum}:<InputNum
					min={+min}
					max={+max}
					step={0.01}
					precision={2}
					value={+_high||0}
					style={{ minWidth: 100 }}
					onChange={(end)=>{
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
              min={+(Math.min(startValue,+min- 2 * +interval))}
              max={endValue}
              precision={3}
              value={startValue}
              style={{ minWidth: 100,marginLeft:20 }}
              onChange={min=>{
                if(min>=endValue){
                  min = endValue - 0.0001
                }
                return this.setSlider([min,endValue]);
              }}
            />
            <a href="javascript:" onClick={()=>this.setSlider([+(Math.min(startValue,+min- 2 * +interval)),endValue])}>{EN.SetToMinimum}</a>
          </section>
          <span>~</span>
          <section>
            <InputNum
              min={startValue}
              max={+(Math.max(endValue,+max+ 2 * +interval))}
              precision={3}
              value={endValue}
              style={{ minWidth: 100 }}
              onChange={max=>{
                if(max<=startValue){
                  max = startValue + 0.0001
                }
                return this.setSlider([startValue,max]);
              }}
            />
            <a href="javascript:" onClick={()=>this.setSlider([startValue,+(Math.max(endValue,+max+ 2 * +interval))])}>{EN.SetToMaximum}</a>
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
            this.setState({
              bin
            },()=>this.getData())
          }}
        />(&lt;=10,000)
          {/*<button className={styles.save} onClick={()=>saveEdit([_low,_high])}><span style={{color:'#fff'}}>{EN.Apply}</span></button>*/}
        </div>
      </div>,
			<div key='bottom' className={styles.fixesBottom}>
				<button className={styles.save} onClick={()=>saveEdit([_low,_high])}><span style={{color:'#fff'}}>{EN.Apply}</span></button>
				<button className={styles.cancel} onClick={closeEdit}><span>{EN.Cancel}</span></button>
			</div>,
		]
	}
}
