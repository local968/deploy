import React, { ReactElement, useMemo, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import './echarts.config';
import { Switch } from 'antd';
import EN from '../../constant/en';
import _ from 'lodash';
import { toJS } from 'mobx';

interface Interface {
  height?:number;
  width?:number;
  readonly message: any;
}

export default function CorrelationMatrixs(props: Interface):ReactElement {
  const { message, height = 500, width = 600 } = props;
  const { header, data, target } = message;
  const [show, upShow] = useState(!!target);

  function result(_fields) {
    let _index = -1;
    const __data = [];
    _.forEach(data, (itm, index) => {
      if (_.includes(_fields, header[index])) {
        _index++;
        let _ind = _fields.length;
        _.forEach(itm, (it, ind) => {
          if (_fields.includes(header[ind])) {
            _ind--;
            __data.push([_ind, _index, it]);
          }
        });
      }
    });
    return {
      data:__data.map(item => [item[1], item[0], item[2] || '-']),
      fields:_fields
    }
  }

  const show_result = useMemo(()=>{
    const _fields = _.cloneDeep(toJS(message.fields));
    _fields.push(target);
    return result(_fields);
  },[]);

  const hide_result = useMemo(()=>{
    const _fields = _.cloneDeep(toJS(message.fields));
    return result(_fields);
  },[]);

  const {data:_data,fields} = useMemo(()=>{
    if(show){
      return show_result;
    }
    return hide_result;
  },[show]);

  const len = useMemo(()=>_.max([...header.map(itm => itm.length), 0]),[]);

  const nameTextStyle = {
    color: '#000',
  };

  let series: any = {
    type: 'heatmap',
    data: _data,
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    tooltip: {
      formatter: data => {
        const { marker, value } = data;
        return `${marker}${value[2].toFixed(3)}`;
      },
    },
  };
  if (!len) {
    series = {
      type: 'tree',
      data: [{ name: 'N/A' }],
      left: '20%',
      symbol: 'emptyCircle',
      symbolSize: 1,

      orient: 'LR',

      label: {
        normal: {
          position: 'center',
          rotate: -90,
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 100,
        },
      },

      leaves: {
        label: {
          normal: {
            position: 'center',
            rotate: -0,
            verticalAlign: 'middle',
            align: 'left',
          },
        },
      },
    };
  }

  const option = {
    tooltip: {
      position: 'top',
    },
    animation: true,
    grid: {
      left: 8 * len + 10,
      top: 4 * len + 20,
      right:100,
    },
    xAxis: {
      type: 'category',
      data: fields,
      position: 'top',
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
      nameTextStyle,
    },
    yAxis: {
      type: 'category',
      data: [...fields].reverse(),
      nameTextStyle,
    },
    dataZoom: [
      {
        type: 'slider',
        // filterMode: 'none',
        rangeMode: ['percent', 'percent'],
      },
      {
        type: 'slider',
        // filterMode: 'none',
        rangeMode: ['percent', 'percent'],
        orient: 'vertical',
        right:0,
      },
    ],
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'vertical',
      bottom: 'center',
      precision: 1,
      itemHeight: 280,
      inRange: { color: ['#80BDFD', '#fff', '#B0E39B'] },
      align: 'bottom',
      right:40,
    },
    series,
  };
  return (
    <section>
      <ReactEcharts
        option={option}
        style={{ height: height + 10 * len, width: width + 10 * len }}
        notMerge={true}
        lazyUpdate={true}
        theme="customed"
      />
      {target && (
        <div>
          <Switch checked={show} onClick={(e)=>upShow(e)} />
          {EN.DisplayTargetVariable}
        </div>
      )}
    </section>
  );
}
