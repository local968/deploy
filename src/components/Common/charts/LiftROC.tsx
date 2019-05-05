import React, { PureComponent } from "react";
import ReactEcharts from "echarts-for-react";
import "./echarts.config";

/**
 * 多模型Lift Charts
 * 多模型ROC Curve
 */
export default class LiftROC extends PureComponent {
  constructor(
    props: Readonly<{
      x_name: string;
      y_name: string;
      data: {
        name: string;
        value: number[][];
      }[];
    }>
  ) {
    super(props);
  }

  getOption() {
    // const result = {
    //   x_name:'percentage',
    //   y_name:'lift',
    //   data:[{
    //     name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd',
    //     value:[[0,0],[100,2]],
    //   },{
    //     name:'asdafsdytafdyafdaydfahsdfahdjahdfjahsd2',
    //     value:[[0,1],[2,0],[100,2.1]],
    //   }]
    // }
    const { x_name = "", y_name = "", data = [] } = this.props as any;

    const series = data.map((itm: any) => {
      return {
        name: itm.name,
        symbolSize: 0,
        data: itm.value,
        type: "line"
      };
    });

    return {
      xAxis: {
        name: x_name,
        axisLabel: {
          formatter: "{value}%"
        }
      },
      yAxis: {
        name: y_name
      },
      series,
      legend: {
        type: "scroll",
        orient: "vertical",
        left: "right",
        height: "90%"
      },
      grid: {
        x2: 300
      }
    };
  }

  render() {
    const { height = 400, width = 1000 } = this.props as any;

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
