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

	async componentDidMount() {
		const {url} = this.props;
		const {data} = await request.post({
			url:'/graphics/predicted-vs-actual-plot',
			data:{
				url,
			},
		});
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

		// 指定图表的配置项和数据
		return {
			// title: {
			// 	text: 'Within Group Sum of Squares'
			// },
			xAxis: {
				name:x_name,
				type: 'value',
			},
			yAxis: {
				name: y_name,
				type: 'value',
			},
			legend: {
				data: data.map(itm=>itm.name),
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params) {
					const result = params.map((itm)=> {
						return <dd>
							{itm.seriesName}:{itm.value[1].toFixed(3)}
						</dd>;
					});
					return `
						Group Number:${params[0].axisValue}
						${result.map(itm=>('<br/>' + itm.props.children.join('')))}
					`
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
