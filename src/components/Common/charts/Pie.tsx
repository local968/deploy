import React from "react";
import ReactEcharts from "echarts-for-react";

export default function Pie(props) {
  const {
    used = 0,
    restriction = 0,
    title = "",
    width = 300,
    height = 350
  } = props as any;
  const remain = restriction - used;
  let startAngle = 0;

  if (restriction) {
    startAngle = 90 + (used / restriction) * 180;
  }
  const option = {
    title: {
      text: title,
      subtext: `${used} / ${restriction}`,
      x: "center",
      bottom: 20,
      subtextStyle: {
        color: "#4a4a4a",
        fontSize: 14
      }
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    series: [
      {
        name: title,
        type: "pie",
        radius: "55%",
        center: ["50%", "45%"],
        startAngle,
        data: [{ value: used, name: "使用" }, { value: remain, name: "剩余" }],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  };

  return (
    <ReactEcharts
      option={option}
      style={{ height, width }}
      notMerge={true}
      lazyUpdate={true}
      // theme="customed"
    />
  );
}
