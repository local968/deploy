import React from "react";
import ReactEcharts from "echarts-for-react";
import "./echarts.config";

export default function CorrelationMatrix(props: any) {
  const {value = [], type = [""], height = 400, width = 500} = props as any;

  let data: any = [];
  value.map(
    (
      itm: { forEach: (arg0: (it: any, ind: any) => void) => void },
      index: any
    ) => {
      itm.forEach((it, ind) => {
        data.push([index, ind, it]);
      });
    }
  );

  data = data.map((item: any[]) => [item[1], item[0], item[2] || "-"]);

  const option = {
    tooltip: {
      position: "top"
    },
    animation: true,
    grid: {
      x: 100
    },
    xAxis: {
      type: "category",
      data: type,
      position: "top",
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: "category",
      data: [...type].reverse()
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: "vertical",
      left: "right",
      bottom: "center",
      precision: 1,
      itemHeight: 280,
      inRange: {color: ["#80BDFD", "#fff", "#B0E39B"]},
      align: "bottom"
    },
    series: {
      name: "Punch Card",
      type: "heatmap",
      data,
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)"
        }
      }
    }
  };
  return (
    <ReactEcharts
      option={option}
      style={{height, width}}
      notMerge={true}
      lazyUpdate={true}
      theme="customed"
    />
  );
}
