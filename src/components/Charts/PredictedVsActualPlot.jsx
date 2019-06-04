import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import request from '../Request';
import styles from "../Modeling/Result/PredictVActual.module.css";
import EN from "../../constant/en";
import Hint from "../Common/Hint";

export default class PredictedVsActualPlot extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			loading:true,
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
		
		data[0].name = EN.ActualValues;
		data[1].name = EN.PredictedValues;
		this.setState({
			data,
			loading:false,
		})
	}

	getOption() {
		const {loading,data} = this.state;
		if(loading){
			return {
				xAxis:{},
				yAxis:{},
			}
		}

		const {x_name='',y_name=''} = this.props;
		const series = data.map(itm=>({
			type: 'line',
			data:itm.value,
			name:itm.name,
			symbolSize: 3,
		}));
		const nameTextStyle = {
			color:'#000',
		};

		// 指定图表的配置项和数据
		return {
			title: {
				subtext: y_name,
				subtextStyle:{
					fontSize:12,
					color:'#080808',
				},
				left:40,
			},
			xAxis: {
				name:x_name,
				type: 'value',
				nameTextStyle,
			},
			yAxis: {
				// name: y_name+y_name,
				type: 'value',
				// nameTextStyle,
			},
			legend: {
				data: data.map(itm=>itm.name),
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params) {
					let result = `
						${EN.PointNumber}: ${params[0].axisValue}<br/>
						${params[0].seriesName}: ${params[0].value[1].toFixed(3)}<br/>
					`;
					
					if(params[1]){
						return `
						${EN.PointNumber}: ${params[0].axisValue}<br/>
						${params[0].seriesName}: ${params[0].value[1].toFixed(3)}<br/>
						${params[1].seriesName}: ${params[1].value[1].toFixed(3)}
					`;
					}
					return result
				},
			},
			series,
			grid:{
				x2:130,
				y2:80,
			},
		};

	}

	render(){
		return  <div className={styles.predictActual}>
			<div className={styles.title}>
				{EN.PredictedVSActualPlotSorted}<Hint content={<p>{EN.Howwastheplotcreate}<br/>
				{EN.Sortthedatabythe}<br/>
				{EN.Dividealldatapoints}<br/>
				{EN.Calculatethemeanvalue}<br/>
				{EN.HowdoIinterprete}<br/>
				{EN.Weaimtogetyouasense}</p>}/>
			</div>
			<ReactEcharts
				option={this.getOption()}
				style={{height: 400, width: 800}}
				notMerge={true}
				lazyUpdate={true}
				theme='customed'
			/>
		</div>
	}
}
