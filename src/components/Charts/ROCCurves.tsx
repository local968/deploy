import React, {PureComponent} from 'react'
import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'

interface Interface {
	height:number
	width:number
	x_name:string
	y_name:string
	model:any
	isHoldout:boolean
}

export default class ROCCurves extends PureComponent<Interface>{
	private chart: any;
	state:any;
	constructor(props){
		super(props);
		this.chart = React.createRef();
		this.state = {
			ready:false,
			position:null,
			startIndex:props.model.fitIndex,
		};
		this.updatePoint = _.debounce(this.updatePoint.bind(this),200);
	}

	componentWillReceiveProps(nextProps) {
		const {isHoldout} = this.props;
		const {startIndex} = this.state;

		if(nextProps.isHoldout!==isHoldout||nextProps.model.fitIndex!==startIndex){
			this.setState({
				startIndex:nextProps.model.fitIndex
			},()=>this.prePair(nextProps.model.fitIndex,nextProps.isHoldout));
		}
	}

	prePair(fitIndex=this.props.model.fitIndex,isHoldout=this.props.isHoldout){
		const {x_name='',y_name='',model} =this.props;
		const {chartData,holdoutChartData} = model;
		const {roc} = isHoldout?holdoutChartData:chartData;
		const {FPR:x,TPR:y} = roc;
		const _x = Object.values(x).map((itm:number,index)=>itm+index*10**-6);
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
		const {isHoldout} = this.props;
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
			symbolSize:1,
		},{
			id: 'point',
			symbolSize: 20,
			smooth: true,
			data:_data,
			type: 'line',
		}];

		const t = this;
		setTimeout( ()=> {
			const {util} = echarts as any;
			try {
				myChart.setOption({
					graphic: util.map(_data, function (item) {
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
							ondrag: util.curry(t.onPointDragging),
							updatePoint:t.updatePoint,
							z: 100,
							isHoldout,
						};
					})
				});
			}catch{}
		}, 0);

		return  {
			xAxis: {
				name:x_name,
				type: 'value',
				boundaryGap: false,
				min:0,
				max:1.001,
			},
			yAxis: {
				type: 'value',
				name:y_name,
			},
			grid:{
				y2:80,
				x2:150,
			},
			tooltip:{
				triggerOn: 'none',
			},
			series,
		};
	}

	onPointDragging(){
		let {result,myChart,point,isHoldout} = this as any;
		if(isHoldout){
			return;
		}
		let {data} = result;

		const _data = data.filter(itm=>itm[0] === point)||data[0];
		//@ts-ignore
		_data[0] = myChart.convertFromPixel('grid', this.position);

		if(!_data[0]){
			return
		}

		const _x = _data[0][0];
		const next_point = data.filter(itm=>itm[0]>point)[0];

		const prev_point = data.filter(itm=>itm[0]<point).reverse()[0];

		if((!next_point&&_x>point)||(!prev_point&&_x<=point)){
			//@ts-ignore
			this.position = myChart.convertToPixel('grid', data.filter(itm=>itm[0] === point)[0]);
			// console.log(1, myChart.convertToPixel('grid', data.filter(itm=>itm[0] === point)[0]))
			return
		}else if(next_point&&_x>next_point[0]){
			// console.log(2)
			point = next_point[0];
			//@ts-ignore
			this.position = myChart.convertToPixel('grid', next_point)
		}else if(prev_point&&_x<prev_point[0]){
			// console.log(3)
			point = prev_point[0];
			//@ts-ignore
			this.position =  myChart.convertToPixel('grid', prev_point)
		}

		const p1 = data.filter(itm=>itm[0] === point)[0];

		if(next_point&&_x>point&&_x<next_point[0]){
			const p2 = next_point;
			const y = (p2[1]-p1[1])/(p2[0]-p1[0])*(_x-p1[0])+p1[1];
			//@ts-ignore
			this.position = myChart.convertToPixel('grid', [_x,y])
		}

		if(prev_point&&_x<point&&_x>prev_point[0]){
			const p2 = prev_point;
			const y = (p1[1]-p2[1])/(p1[0]-p2[0])*(_x-p2[0])+p2[1];
			//@ts-ignore
			this.position = myChart.convertToPixel('grid', [_x,y])
		}

		//@ts-ignore
		_data[0] = myChart.convertFromPixel('grid', this.position);

		myChart.setOption({
			series: [{
				id: 'point',
				data: _data
			}]
		});

		//@ts-ignore
		this.point = point;
		this.updatePoint(point)
	}

	updatePoint(point){
		const {model} = this.props;
		const {_x} = this.state;
		model.setFitIndex(_x.indexOf(point));
	}

	render(){
		const {width=650,height=300} = this.props;
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
