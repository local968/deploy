import React, {PureComponent} from 'react'
import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'

export default class ROC extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.state = {
			ready:false,
			position:null,
		};
		this.updatePoint = _.debounce(this.updatePoint,1);
	}
	
	componentDidMount(){
		const result = {
			x_name:'po Threshold',
			y_name:'true Density',
			point:0.2,
			data:[[0, 1],[0.1,0.9], [0.2, 0.8], [0.3, 0.9], [0.4, 0.7], [0.5, 0.8],[0.6,1],[0.7,.9],[0.8,.7],[0.9,.5],[1,.6],],
		};
		
		this.setState({
			ready:true,
			result,
		})
	}
	
	getOption() {
		const {ready,result} = this.state;
		if(!ready){
			return {
				xAxis: {},
				yAxis: {},
			}
		}
		const myChart = this.chart.getEchartsInstance();
		
		let {x_name,y_name,data,point} = result;
		
		const _data = data.filter(itm=>itm[0] === point)||data[0];
		
		const series = [{
			type: 'line',
			data,
			smooth:false,
		},{
			id: 'point',
			symbolSize: 20,
			smooth: true,
			data:_data,
			type: 'line'
		}];
		
		const t = this;
		setTimeout( ()=> {
			myChart.setOption({
				graphic: echarts.util.map(_data, function (item) {
					return {
						type: 'circle',
						position: myChart.convertToPixel('grid', item),
						shape: {
							cx: 0,
							cy: 0,
							r: 10,
						},
						invisible: true,
						draggable: true,
						result,
						myChart,
						point,
						// that:t,
						// updatePoint:echarts.util.curry(t.updatePoint),
						ondrag: echarts.util.curry(t.onPointDragging),
						updatePoint:t.updatePoint,
						z: 100
					};
				})
			});
		}, 0);
		
		return  {
			xAxis: {
				name:x_name,
				type: 'value',
				boundaryGap: false,
				min:0,
				max:1,
			},
			yAxis: {
				type: 'value',
				name:y_name,
				min:0,
				max:1,
			},
			grid:{
				x2:140,
				y2:80,
			},
			tooltip:{
				triggerOn: 'none',
			},
			series,
			toolbox: {
				show : true,
				feature : {
					dataZoom: {},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			}
		};
	}
	
	
	onPointDragging(){
		let {result,myChart,point,position} = this;
		let {data} = result;
		
		const _data = data.filter(itm=>itm[0] === point)||data[0];
		_data[0] = myChart.convertFromPixel('grid', position);
		const _x = _data[0][0];
		const next_point = data.filter(itm=>itm[0]>point)[0];
		
		const prev_point = data.filter(itm=>itm[0]<point).reverse()[0];
		
		if((!next_point&&_x>point)||(!prev_point&&_x<point)){
			this.position = myChart.convertToPixel('grid', data.filter(itm=>itm[0] === point)[0]);
			return
		}else if(next_point&&_x>next_point[0]){
			point = next_point[0];
			this.position = myChart.convertToPixel('grid', next_point)
		}else if(prev_point&&_x<prev_point[0]){
			point = prev_point[0];
			this.position =  myChart.convertToPixel('grid', prev_point)
		}
		
		const p1 = data.filter(itm=>itm[0] === point)[0];
		
		if(next_point&&_x>point&&_x<next_point[0]){
			const p2 = next_point;
			const y = (p2[1]-p1[1])/(p2[0]-p1[0])*(_x-p1[0])+p1[1];
			this.position = myChart.convertToPixel('grid', [_x,y])
		}
		
		if(prev_point&&_x<point&&_x>prev_point[0]){
			const p2 = prev_point;
			const y = (p1[1]-p2[1])/(p1[0]-p2[0])*(_x-p2[0])+p2[1];
			this.position = myChart.convertToPixel('grid', [_x,y])
		}
		
		_data[0] = myChart.convertFromPixel('grid', this.position);
		
		myChart.setOption({
			series: [{
				id: 'point',
				data: _data
			}]
		});
		
		this.point = point;
		this.updatePoint(point)
	}
	
	updatePoint(point){
		// this.setState({
		// 	point
		// })
		console.log(point)
	}
	
	render(){
		return <ReactEcharts
			ref = {chart=>this.chart = chart}
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
