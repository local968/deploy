import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import InputNum from'rc-input-number';
import 'rc-input-number/assets/index.css';

export default class Outlier extends PureComponent{
	constructor(props){
		super(props);
		this.state = {
			max:null,
			min:0,
			ready:false,
		}
		this.chart = React.createRef();
	}
	
	componentDidMount() {
		const result = {
			title:'title',
			min:10,
			max:50,
			data:[[0,10, 1], [10, 20, 15], [20, 30, 12], [30, 40, 22], [40, 50, 7], [50, 60, 17]]
		}
		
		const chart = this.chart.getEchartsInstance();
		this.setState({
			...result,
			chart,
			ready:true
		})
		
		chart.on('datazoom',  ()=> {
			const {startValue:min,endValue:max} = chart.getOption().dataZoom[0]
			this.setState({
				min,
				max
			})
		});
	}
	
	getOption() {
		const {ready,data,min,max,title} = this.state;
		if(!ready){
			return {
				xAxis:{},
				yAxis:{},
			}
		}
		
		function renderItem(params, api) {
			var yValue = api.value(2);
			var start = api.coord([api.value(0), yValue]);
			var size = api.size([api.value(1) - api.value(0), yValue]);
			var style = api.style();
			
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
				min:0,
				scale: true
			},
			yAxis: {},
			toolbox:{
				feature:{
					dataZoom:{
						show:true,
					}
				}
			},
			dataZoom: {
				show: true,
				realtime: true,
				startValue:min,
				endValue:max,
				backgroundColor:'#ccc',
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
			}]
		};
	}

	render(){
		const {max,min} = this.state;
		return [<ReactEcharts
			ref = {chart=>this.chart=chart}
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			// onChartReady={this.onChartReadyCallback}
			// onEvents={EventsDict}
			// opts={}
			/>,
			<div>
				min:<InputNum
					// min={0}
					// max={0.5}
					// step={0.01}
					precision={2}
					value={min}
					style={{ width: 100 }}
					onChange={min=>{
						this.setState({
							min
						});
						// this.updatePoint(slider_value)
					}}
				/>
				max:<InputNum
				// min={0}
				// max={0.5}
				// step={0.01}
				precision={2}
				value={max}
				style={{ width: 100 }}
				onChange={max=>{
					this.setState({
						max
					});
					// this.updatePoint(slider_value)
				}}
			/>
			</div>
		]
	}
}
