import React, {PureComponent} from "react";
import ReactEcharts from "echarts-for-react";
import {debounce} from "lodash";
import Slider from "rc-slider";
// @ts-ignore
import InputNum from "rc-input-number";
import "./echarts.config";
import request from "../request";
import useStyles from "./charts.model.css";
import styles from "@src/views/modeling.pre.result/modeling.pre.result.css";
import EN from "../../../constant/en";
import {Select} from "antd";

const {Option} = Select;

const classes = useStyles;

declare const InputNum: any;

const color = ["#6e698f", "#d5d4df", "#367de9", "#f3ce31"]; //背景(开始)/背景(结束）/异常点/正常点

export default class Iso extends PureComponent {
  constructor(
    props: Readonly<{
      default_point: number;
      url: string;
    }>
  ) {
    super(props);
    this.state = {
      ready: false,
      slider_value: 0,
      x_name: "",
      y_name: "",
      show_name: {
        x_name: "",
        y_name: ""
      }
    };

    this.updatePoint = debounce(this.updatePoint, 1000);
  }

  async componentDidMount() {
    const {url, default_point: point = 0} = this.props as any;
    const result = await request.post({
      url: "/service/graphics/outlier",
      data: {
        url
      }
    });

    const {
      feature1Range: xRange = [],
      feature2Range: yRange = [],
      background: value = [],
      dotScore: dot = []
    } = result as any;
    this.setState({
      xRange,
      yRange,
      value,
      dot,
      point,
      slider_value: point,
      ready: true
    });
  }

  getOption() {
    let {ready, xRange, yRange, value, dot, point} = this.state as any;
    if (!ready) {
      return {
        xAxis: {},
        yAxis: {}
      };
    }

    const x_space = (xRange[1] - xRange[0]) / value[0].length;
    const y_space = (yRange[1] - yRange[0]) / value.length;
    let x_itm = xRange[0];
    let y_itm = yRange[0];
    let x_range = [x_itm.toFixed(1)];
    let y_range = [y_itm.toFixed(1)];
    while (xRange[1] > x_itm) {
      const x = (x_itm += x_space).toFixed(1);
      x_range.push(x);
    }

    while (yRange[1] > y_itm) {
      const y = (y_itm += y_space).toFixed(1);
      y_range.push(y);
    }

    let data: any = [];

    value.map(
      (
        itm: { forEach: (arg0: (it: any, ind: any) => void) => void },
        index: number
      ) => {
        itm.forEach((it, ind) => {
          data.push([index, ind, +it ? it : 0.01]);
        });
      }
    );

    data = data.map((item: any[]) => [item[1], item[0], item[2] || "-"]);

    const heat_map = {
      type: "heatmap",
      progressive: 0,
      progressiveThreshold: 10000,
      data
    };

    const series: any = [heat_map, heat_map];

    const xr = (xRange[1] - xRange[0]) / value[0].length;
    const yr = (yRange[1] - yRange[0]) / value.length;
    dot = dot.map((itm: any[]) => [
      (itm[0] - xRange[0]) / xr,
      (itm[1] - yRange[0]) / yr,
      itm[2]
    ]);
    // const data1 = dot.filter((itm:any)=>itm[2]>point).map((itm:any)=>[itm[0],itm[1]]);//正常
    // const data2 = dot.filter((itm:any)=>itm[2]<=point).map((itm:any)=>[itm[0],itm[1]]);//异常

    let data1: any = [],
      data2: any = [];
    if (point) {
      data1 = dot.filter(itm => itm[2] > point).map(itm => [itm[0], itm[1]]); //正常
      data2 = dot.filter(itm => itm[2] <= point).map(itm => [itm[0], itm[1]]); //异常
    } else {
      data1 = dot.map(itm => [itm[0], itm[1]]);
    }

    data1.unshift([-100, -1, 0]);
    data2.unshift([-100, -1, 0]);

    series.push(
      {
        type: "scatter",
        data: data1,
        color: color[2],
        visualMap: false,
        symbolSize: 5,
        name: "正常",
        animation: false
      },
      {
        type: "scatter",
        data: data2,
        color: color[3],
        visualMap: false,
        symbolSize: 5,
        name: "异常",
        animation: false
      }
    );

    return {
      tooltip: {
        position: "top"
      },
      legend: {
        top: 20,
        right: 0,
        data: ["正常", "异常"],
        align: "left"
      },
      animation: true,
      grid: {
        // height: '100%',
        y: "10%"
      },
      xAxis: {
        type: "category",
        data: x_range,
        axisLabel: {
          interval: value[0].length / 5
        },
        boundaryGap: false,
        alignWithLabel: true,
        offset: 1
      },
      yAxis: {
        type: "category",
        data: y_range,
        axisLabel: {
          interval: value.length / 5
        },
        boundaryGap: false,
        offset: 3
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        inRange: {color: [color[0], color[1]]},
        orient: "horizontal",
        show: false
      },
      // toolbox: {
      //     feature: {
      //         dataZoom: {},
      //         brush: {
      //             type: ['rect'],
      //         },
      //     },
      // },
      series
    };
  }

  updatePoint(point: any) {
    this.setState({
      point
    });
  }

  selection(order) {
    const {result = {}, show_name} = this.state as any;
    const {featuresLabel = ["a", "b", "c"]} = result;

    const disable = Object.values(show_name).filter(
      itm => itm !== show_name[order]
    );

    const options = featuresLabel.map(itm => (
      <Option key={itm} disabled={disable.includes(itm)} value={itm}>
        {itm}
      </Option>
    ));

    return (
      <Select
        value={show_name[order]}
        style={{width: 120}}
        onChange={name => {
          this.setState({
            show_name: {
              ...show_name,
              [order]: name
            }
          });
        }}
      >
        {options}
      </Select>
    );
  }

  save() {
    const {show_name} = this.state as any;
    const {x_name, y_name} = show_name;
    this.setState({
      x_name,
      y_name
    });
    //this.props.changeUrl(x_name,y_name)
  }

  reset() {
    const {default_point = 0} = this.props as any;
    this.setState({
      slider_value: default_point
    });
    this.updatePoint(default_point);
  }

  render() {
    const {slider_value} = this.state as any;
    const {height = 500, width = 600} = this.props as any;

    return [
      <section key="dl" className={classes.d3d2}>
        <dl>
          <dt>Choose 2 Variables</dt>
          <dd>Var1:{this.selection("x_name")}</dd>
          <dd>Var2:{this.selection("y_name")}</dd>
          <dd>
            <button className={styles.button} onClick={this.save.bind(this)}>
              <span>{EN.Save}</span>
            </button>
          </dd>
        </dl>
        <ReactEcharts
          key="echarts"
          option={this.getOption()}
          style={{height, width}}
          notMerge={true}
          lazyUpdate={true}
          theme="customed"
        />
      </section>,
      <div key="'slider" className={classes.slider}>
        <Slider
          min={0}
          max={0.5}
          marks={{
            0: 0,
            0.05: "",
            0.1: 0.1,
            0.15: "",
            0.2: 0.2,
            0.25: "",
            0.3: 0.3,
            0.35: "",
            0.4: 0.4,
            0.45: "",
            0.5: 0.5
          }}
          included={false}
          step={0.01}
          onChange={(slider_value: any) => {
            this.setState({
              slider_value
            });
            this.updatePoint(slider_value);
          }}
          value={slider_value}
        />
        <a href="javascript:;" onClick={this.reset.bind(this)}>
          Reset
        </a>
      </div>,
      <div key="adjust" className={classes.adjust}>
        You can adjust the contamination rate :{" "}
        <InputNum
          min={0}
          max={0.5}
          step={0.01}
          precision={2}
          value={slider_value}
          style={{width: 100}}
          onChange={(slider_value: any) => {
            this.setState({
              slider_value
            });
            this.updatePoint(slider_value);
          }}
        />
      </div>
    ];
  }
}
