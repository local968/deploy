import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

export default class SpeedvsAccuracy extends PureComponent{
	constructor(props){
		super(props);
		this.chart = React.createRef();
	}
	
	getOption() {
		const result = {
			x_name:'x_name',
			y_name:'y_name',
			data:[{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd',
				value:[8.0, 6.95],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd2',
				value:[1,2],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd3',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd4',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd5',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd6',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd7',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd8',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd9',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs10',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs11',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs12',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs13',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs14',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs15',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs16',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs17',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd',
				value:[8.0, 6.95],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd2',
				value:[1,2],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd3',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd4',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd5',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd6',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd7',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd8',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd9',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs10',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs11',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs123',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs133',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs143',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs153',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs163',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs173',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd3',
				value:[8.0, 6.95],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd21',
				value:[1,2],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd31',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd41',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd51',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd61',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd71',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd81',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd91',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs101',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs111',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs121',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs131',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs141',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs151',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs161',
				value:[6,6],
			},{
				name:'asdafsdytafdyafdaydfahsdfahdjahdfjahs171',
				value:[6,6],
			}]
		}
		const {x_name,y_name,data} = result;
		
		const lineStyle = {
			normal: {
				type: 'dashed'
			}
		}
		
		const series = data.map(itm=>{
			return {
				name:itm.name,
				symbolSize: 20,
				data:[itm.value],
				type: 'scatter',
				markLine : {
					lineStyle,
					symbol:false,
					data:[
						{
							xAxis:itm.value[0],
						},
						{
							type:'min'
						}
					]
				}
			}
		})
		
		return {
			xAxis: {
				name:x_name,
			},
			yAxis: {
				name:y_name,
			},
			series,
			legend: {
				type:'scroll',
				orient:'vertical',
				left:'right',
				// width:500,
				// bottom:0,
				height:'90%',
			},
			grid:{
				x2:300,
				// y2:300,
			}
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
