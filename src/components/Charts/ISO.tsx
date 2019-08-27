import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import Slider from 'rc-slider';
import InputNum from 'rc-input-number';
import 'rc-input-number/assets/index.css';
import 'rc-slider/assets/index.css';
import './echarts.config';
import request from '../Request';
import styles from './charts.module.css';
import EN from '../../constant/en';
import { Select } from 'antd';
import { MobXProviderContext, observer } from 'mobx-react';
import _ from 'lodash';
const { Option } = Select;

const classes = styles;

const color: any = ['#b7cbf8', '#ffffff', 'green', 'red']; //背景(开始)/背景(结束）/正常点/异常点

interface Interface {
  height?: number;
  width?: number;
}

const ISO = observer((props: Interface) => {
  const { height = 500, width = 600 } = props;
  const {
    projectStore: {
      project,
      project: {
        selectModel: {
          updateModel,
          outlierPlotData: url,
          featureImportance,
          rate,
          initRate,
          saveFeatureList,
        },
        mapHeader,
      },
    },
  } = useContext(MobXProviderContext);
  const chart = useRef(null);
  const [point, upPoint] = useState();
  const [slider_value, up_slider_value] = useState(0);
  const [ready, upReady] = useState(false);
  const [xRange, upXRange] = useState([]);
  const [yRange, upYRange] = useState([]);
  const [value, upValue] = useState([]);
  const [vars, upVars] = useState([]);
  const [dot, upDot] = useState([]);
  const [list, upList] = useState([]);
  const [var1, upVar1] = useState('');
  const [var2, upVar2] = useState('');
  const [show_name, up_show_name] = useState({ var1: '', var2: '' });
  const [default_point, up_default_point] = useState(0);

  const updatePoint = _.debounce(point => {
    upPoint(point);
    updateModel({ rate: point });
  }, 280);

  useEffect(() => {
    const _chart = chart.current.getEchartsInstance();
    _chart.showLoading();
    if (!project) return;

    const point = rate.toFixed(3);
    let var1, var2;
    if (vars.length) {
      var1 = vars[0];
      var2 = vars[1];
    } else {
      const list = Object.entries(featureImportance).sort(
        (b: any, a: any) => a[1] - b[1],
      );
      var1 = list[0][0];
      var2 = list[1][0];
    }

    request
      .post({
        url: '/graphics/outlier',
        data: {
          url,
        },
      })
      .then((result: any) => {
        const {
          feature1Range: xRange = [],
          feature2Range: yRange = [],
          background: value = [],
          dotScore: dot = [],
        } = result;
        upXRange(xRange);
        upYRange(yRange);
        upValue(value);
        upDot(dot);
        upPoint(point);
        up_default_point(initRate);
        up_slider_value(point);
        up_show_name({
          var1,
          var2,
        });
        upList(Object.keys(featureImportance));
        upVar1(var1);
        upVar2(var2);
        upReady(true);
        _chart.hideLoading();
      });
  }, [url]);

  function save() {
    const { var1 = '', var2 = '' } = show_name;
    upVars([var1, var2]);

    // this.setState(
    //   {
    //     modelName,
    //   },
    //   () => {
    //     const chart = this.chart.getEchartsInstance();
    //     chart.showLoading();
    //   },
    // );
    saveFeatureList([var1, var2]);
  }

  function reset() {
    up_slider_value(default_point);
    updatePoint(default_point);
  }

  function selection(order) {
    const disable = Object.values(show_name).filter(
      itm => itm !== show_name[order],
    );

    const options = list.map(itm => (
      <Option
        key={itm}
        title={mapHeader[itm] || itm}
        disabled={disable.includes(itm)}
        value={itm}
      >
        {mapHeader[itm] || itm}
      </Option>
    ));

    return (
      <Select
        value={show_name[order]}
        style={{ width: 120 }}
        getPopupContainer={el => el.parentElement}
        onChange={name => {
          up_show_name({
            ...show_name,
            [order]: name,
          });
        }}
      >
        {options}
      </Select>
    );
  }

  let option: any = {
    xAxis: {},
    yAxis: {},
  };
  const { _dot, series, x_range, y_range } = useMemo(() => {
    if (!ready) {
      return {};
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

    let data = [];

    value.map((itm, index) => {
      itm.forEach((it, ind) => {
        data.push([index, ind, +it ? it : 0.01]);
      });
    });

    data = data.map(item => [item[1], item[0], item[2] || '-']);

    const heat_map = {
      type: 'heatmap',
      progressive: 0,
      progressiveThreshold: 10000,
      data,
      silent: true,
    };

    const series: any = [heat_map, heat_map];

    const xr = (xRange[1] - xRange[0]) / value[0].length;
    const yr = (yRange[1] - yRange[0]) / value.length;
    const _dot = dot.map(itm => [
      (itm[0] - xRange[0]) / xr,
      (itm[1] - yRange[0]) / yr,
      itm[2],
    ]);
    return {
      series,
      _dot,
      x_range,
      y_range,
    };
  }, [url, ready]);

  if (ready) {
    let data1 = [],
      data2 = [];
    if (point) {
      data1 = _dot.filter(itm => itm[2] > point).map(itm => [itm[0], itm[1]]); //正常
      data2 = _dot.filter(itm => itm[2] <= point).map(itm => [itm[0], itm[1]]); //异常
    } else {
      data1 = _dot.map(itm => [itm[0], itm[1]]);
    }

    data1.unshift([-100, -1, 0]);
    data2.unshift([-100, -1, 0]);

    const _series = _.cloneDeep(series);

    _series.push(
      {
        type: 'scatter',
        data: data1,
        color: color[2],
        visualMap: false,
        symbolSize: 3,
        name: EN.normal,
        animation: true,
        silent: true,
        zlevel: 3,
      },
      {
        type: 'scatter',
        data: data2,
        color: color[3],
        visualMap: false,
        symbolSize: 3,
        name: EN.abnormal,
        animation: true,
        silent: true,
        zlevel: 2,
      },
    );

    const nameTextStyle = {
      color: '#000',
    };

    option = {
      tooltip: {
        position: 'top',
      },
      legend: {
        top: 5,
        right: 0,
        data: [EN.normal, EN.abnormal],
        align: 'left',
        orient: 'vertical',
      },
      animation: true,
      grid: {
        y: '10%',
      },
      xAxis: {
        type: 'category',
        data: x_range,
        axisLabel: {
          interval: value[0].length / 5,
        },
        boundaryGap: false,
        alignWithLabel: true,
        offset: 1,
        name: mapHeader[var1] || var1,
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle,
      },
      yAxis: {
        type: 'category',
        data: y_range,
        axisLabel: {
          interval: value.length / 5,
        },
        boundaryGap: false,
        offset: 3,
        name: mapHeader[var2] || var2,
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle,
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        inRange: { color: [color[0], color[1]] },
        orient: 'horizontal',
        show: false,
      },
      dataZoom: [
        {
          type: 'inside',
        },
      ],
      series: _series,
    };
  }

  return (
    <>
      <section className={classes.d3d2}>
        <dl>
          <dt>{EN.Choose2Variables}</dt>
          <dd>Var1:{selection('var1')}</dd>
          <dd>Var2:{selection('var2')}</dd>
          <dd>
            <button className={styles.button} onClick={save}>
              <span>{EN.Save}</span>
            </button>
          </dd>
        </dl>
        <ReactEcharts
          key="echarts"
          ref={chart}
          option={option}
          style={{ height, width }}
          notMerge={true}
          lazyUpdate={true}
          theme="customed"
        />
      </section>
      <div className={classes.slider}>
        <Slider
          min={0}
          max={0.5}
          marks={{
            '0': '0',
            '0.05': '',
            '0.1': '0.1',
            '0.15': '',
            '0.2': '0.2',
            '0.25': '',
            '0.3': '0.3',
            '0.35': '',
            '0.4': '0.4',
            '0.45': '',
            '0.5': '0.5',
          }}
          included={false}
          step={0.001}
          onChange={slider_value => {
            up_slider_value(slider_value);
            updatePoint(slider_value);
          }}
          value={+slider_value}
        />
        <a onClick={reset}>{EN.Reset}</a>
      </div>
      <div className={classes.adjust}>
        <label data-tip={EN.Thisratiowilldetermine}>
          {EN.Youcanadjustthecontaminationrate}:
        </label>
        <InputNum
          min={0}
          max={0.5}
          step={0.001}
          precision={3}
          value={slider_value}
          style={{ width: 100 }}
          onChange={slider_value => {
            up_slider_value(slider_value);
            updatePoint(slider_value);
          }}
        />
      </div>
    </>
  );
});

export default ISO;
