import React, { PureComponent } from "react";
import ReactEcharts from "echarts-for-react";
import * as Echarts from "echarts";
import "echarts/dist/extension/dataTool";
import "./echarts.config";

export default class BoxPlot extends PureComponent {
  constructor(props: Readonly<{}>) {
    super(props);
  }

  getOption() {
    const {
      value = [],
      title = "",
      x_name = "",
      y_name = "",
      x_keys = []
    } = this.props as any;

    const data = (Echarts as any).dataTool.prepareBoxplotData(value);

    return {
      title: [
        {
          text: title,
          left: "center"
        }
        // {
        // 	text: 'upper: Q3 + 1.5 * IQR \nlower: Q1 - 1.5 * IQR',
        // 	// borderColor: '#999',
        // 	borderWidth: 1,
        // 	textStyle: {
        // 		fontSize: 14,
        // 	},
        // 	left: '10%',
        // 	top: '90%',
        // },
      ],
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "10%",
        right: "10%",
        bottom: "15%"
      },
      xAxis: {
        name: x_name,
        type: "category",
        // data: data.axisData,
        data: x_keys,
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
          show: false
        },
        // axisLabel: {
        // 	formatter: 'expr {value}'
        // },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: "value",
        name: y_name,
        splitArea: {
          show: true
        }
      },
      series: [
        {
          name: "boxplot",
          type: "boxplot",
          data: data.boxData,
          tooltip: {
            formatter: function(param: any) {
              return [
                "Experiment " + param.name + ": ",
                "upper: " + param.data[5],
                "Q3: " + param.data[4],
                "median: " + param.data[3],
                "Q1: " + param.data[2],
                "lower: " + param.data[1]
              ].join("<br/>");
            }
          }
        },
        {
          name: "outlier",
          type: "scatter",
          data: data.outliers
        }
      ]
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
