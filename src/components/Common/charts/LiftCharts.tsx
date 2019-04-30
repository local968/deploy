import React from "react";
import ReactEcharts from "echarts-for-react";
import _ from "lodash";

export default function LiftCharts(props: any) {
  const {
    models,
    x_name,
    y_name,
    height = 400,
    width = 950,
    mom,
    x,
    y,
    formatter = false
  } = props as any;

  const data = models.map((itm: any) => {
    const mother = itm.chartData[mom];
    const _x = Object.values(mother[x]);
    const _y = Object.values(mother[y]);
    return {
      name: itm.name,
      value: _.zip(_x, _y)
    };
  });

  const series = data.map((itm: any) => {
    return {
      name: itm.name,
      symbolSize: 0,
      data: itm.value,
      type: "line"
    };
  });

  const option = {
    xAxis: {
      name: x_name,
      axisLabel: {
        formatter: (value: any) => {
          if (formatter) {
            return `${value * 100}%`;
          }
          return value;
        }
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
      x2: 300,
      x: 30
    }
  };

  return (
    <ReactEcharts
      option={option}
      style={{ height, width }}
      notMerge={true}
      lazyUpdate={true}
      theme="customed"
    />
  );
}
