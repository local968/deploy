import React, {PureComponent} from 'react'
import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'

export default class PRCharts extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.state = {
			ready:false,
			position:null,
		};
		this.updatePoint = _.debounce(this.updatePoint.bind(this),10);
	}
	
	prePair(){
		const {x_name='',y_name='',model} = this.props;
		const {chartData,fitIndex=0} = model;
		const {roc} = chartData;
		const {Recall:x,Precision:y} = roc;
		
		const _x = Object.values(x);
		const _y = Object.values(y);
		const data = _.zip(_x,_y);
		const point = data[fitIndex][0];
		
		const result = {
			x_name,
			y_name,
			point,
			data,
		};
		
		this.setState({
			ready:true,
			result,
			_data : [data[fitIndex]],
			_x,
		})
	}
	
	componentDidMount(){
		this.prePair()
	}

	getOption() {
		const {ready,result,_data} = this.state;
		if(!ready){
			return {
				xAxis: {},
				yAxis: {},
			}
		}
		const myChart = this.chart.getEchartsInstance();

		let {x_name,y_name,data,point} = result;

		const series = [{
			type: 'line',
			data,
			smooth:false,
			symbolSize:0,
		},{
			id: 'point',
			symbolSize: 20,
			smooth: true,
			data:_data,
			type: 'line',
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
			},
			grid:{
				y2:80,
			},
			tooltip:{
				triggerOn: 'none',
			},
			series,
		};
	}


	onPointDragging(){
		let {result,myChart,point} = this;
		let {data} = result;

		const _data = data.filter(itm=>itm[0] === point)||data[0];
		_data[0] = myChart.convertFromPixel('grid', this.position);
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
		// console.log(point)
		this.props.model.setFitIndex(this.state._x.indexOf(point));
	}

	render(){
		const {width=600,height=300} = this.props;
		return <ReactEcharts
			ref = {chart=>this.chart = chart}
			option={this.getOption()}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
