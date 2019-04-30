import React, { PureComponent } from "react";
import ReactEcharts from "echarts-for-react";
import "./echarts.config";

/**
 * Univariant Plot
 */
export default class UnivariantPlot extends PureComponent {
  constructor(
    props: Readonly<{
      title: string;
      x_name: string;
      y_name: string;
      item: string[];
      data: {
        name: string;
        value: number[];
      }[];
    }>
  ) {
    super(props);
  }

  getOption() {
    // const result = {
    // 	title:'title',
    // 	x_name:'x_name',
    // 	y_name:'y_name',
    // 	item:['a','b','c','d','e','f','g','h','i','j','k','l'],
    // 	data:[{
    // 		name:'a',
    // 		value:[1,2,3,4,5,6,1.1,2.1,3.1,0.4,2,1],
    // 	},{
    // 		name:'b',
    // 		value:[2,1,3,4,5,6,2.1,3.1,1.1,5,0.9,0.1],
    // 	}],
    // };

    const { title = "", x_name = "", y_name = "", result = {} } = this
      .props as any;

    let { data = [], item = [] } = result;

    const series = data.map((itm: any) => {
      return {
        name: itm.name,
        data: itm.value,
        type: "bar",
        stack: "sum",
        markPoint: {
          data: [
            { type: "max", name: "最大值" },
            { type: "min", name: "最小值" }
          ]
        }
      };
    });

    return {
      title: {
        text: title
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
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
      calculable: true,
      xAxis: {
        type: "category",
        name: x_name,
        data: item
      },
      yAxis: {
        type: "value",
        name: y_name
      },
      series
    };
  }

  render() {
    const { height = 330, width = 400 } = this.props as any;

    return (
      <ReactEcharts
        option={this.getOption()}
        style={{ height, width }}
        notMerge={true}
        lazyUpdate={true}
        theme="customed"
      />
    );
  }
}
