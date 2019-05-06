import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import './echarts.config'

/**
 * Univariant Plot
 */
export default class UnivariantPlots extends PureComponent{
	getOption() {
		const {title='',x_name='',y_name='',result={}} = this.props;

		let {data=[],item=[]} = result;


		const series = data.map((itm)=>{
			return {
				name:itm.name,
				data:itm.value,
				type:'bar',
				stack: 'sum',
				markPoint : {
					data : [
						{type : 'max', name: '最大值'},
						{type : 'min', name: '最小值'},
					],
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
					type : 'shadow',
				},
			},
			legend: {},
			// toolbox: {
			// 	show : true,
			// 	feature : {
			// 		magicType : {show: true, type: ['line', 'bar']},
			// 		restore : {show: true},
			// 		saveAsImage : {show: true},
			// 	},
			// },
			calculable : true,
			xAxis : {
				type : 'category',
				name:x_name,
				data:item,
			},
			yAxis:  {
				type: 'value',
				name:y_name,
			},
			series,
		};

	}

	render(){
		const {
			height = 330,
			width = 400,
		} = this.props;

		return <ReactEcharts
			option={this.getOption()}
			style={{height, width}}
			notMerge={true}
			lazyUpdate={true}
			theme='customed'
		/>
	}
}
