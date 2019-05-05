import React, { PureComponent } from "react";
import ReactEcharts from "echarts-for-react";
import "echarts-gl";
import "./echarts.config";

export default class ThreeVariable extends PureComponent<any> {
  constructor(props: any) {
    super(props);
  }

  getOption() {
    const symbolSize = 5;

    const { x_name = "", y_name = "", z_name = "", data = [] } = this
      .props as any;

    const series = data.map((itm: any) => {
      return {
        name: itm.name,
        type: "scatter3D",
        symbolSize,
        data: itm.value
      };
    });

    return {
      tooltip: {},
      grid3D: {},
      animation: false,
      legend: {
        orient: "vertical",
        top: 20,
        right: 0,
        // data: keys,
        align: "left"
      },
      xAxis3D: {
        name: x_name
      },
      yAxis3D: {
        name: y_name
      },
      zAxis3D: {
        name: z_name
      },
      series
    };
  }

  render() {
    return (
      <ReactEcharts
        option={this.getOption()}
        style={{ height: 400, width: 600 }}
        notMerge={true}
        lazyUpdate={true}
        theme="customed"
      />
    );
  }
}
