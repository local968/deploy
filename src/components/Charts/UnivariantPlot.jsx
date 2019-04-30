import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class ROC extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			title:'title',
			x_name:'x_name',
			y_name:'y_name',
			item:['a','b','c','d','e','f','g','h','i','j','k','l'],
			data:[{
				name:'a',
				value:[1,2,3,4,5,6,1.1,2.1,3.1,0.4,2,1]
			},{
				name:'b',
				value:[2,1,3,4,5,6,2.1,3.1,1.1,5,0.9,0.1]
			}]
		};
		
		const {title='',data=[],x_name='',y_name='',item=[]} = result;
		
		const series = data.map(itm=>{
			return {
				name:itm.name,
				data:itm.value,
				type:'bar',
				stack: 'sum',
				markPoint : {
					data : [
						{type : 'max', name: '最大值'},
						{type : 'min', name: '最小值'}
					]
				},
			}
		});
		
		
		return {
			title : {
				text: title,
			},
			tooltip : {
				trigger: 'axis',
				axisPointer : {
					type : 'shadow'
				}
			},
			legend: {},
			toolbox: {
				show : true,
				feature : {
					magicType : {show: true, type: ['line', 'bar']},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			calculable : true,
			xAxis : {
				type : 'category',
				name:x_name,
				data :item
			},
			yAxis:  {
				type: 'value',
				name:y_name,
			},
			series,
		};
		
	}
	
	render(){
		return <ReactEcharts
			option={this.getOption()}
			style={{height: 400, width: 1000}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
			// onChartReady={this.onChartReadyCallback}
			// onEvents={EventsDict}
			// opts={}
		/>
	}
}
