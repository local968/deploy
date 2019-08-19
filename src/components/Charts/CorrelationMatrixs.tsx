import React, { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import './echarts.config';
import { Switch } from 'antd';
import EN from "../../constant/en";
import _ from 'lodash';

interface Interface {
  height?;
  width?;
  message:any
}

export default function CorrelationMatrixs(props: Interface) {
  const { message, height = 400, width = 500 } = props;

  const {header, data, target} = message;

  const [show, upShow] = useState(!!target);
  const [_data, upData] = useState([]);
  const [fields, upFields] = useState(message.fields);


	useEffect(()=>{
	  const _fields = _.cloneDeep(message.fields);
  	if(show){
		  _fields.push(target);
	  }
    let _index = -1;
  	const __data = [];
    data.forEach((itm, index) => {
      if (_fields.includes(header[index])) {
        _index++;
        let _ind = _fields.length;
        itm.forEach((it, ind) => {
          if (_fields.includes(header[ind])) {
            _ind--;
            __data.push([ _ind, _index,it]);
          }
        });
      }
    });
    upData(__data.map(item => [item[1], item[0], item[2] || '-']));
    upFields(_fields);
  },[show]);

  const len = Math.max(...header.map(itm => itm.length), 0);
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
      x: 8 * len + 10,
      y: 4 * len + 20,
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
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'vertical',
      left: 'right',
      bottom: 'center',
      precision: 1,
      itemHeight: 280,
      inRange: { color: ['#80BDFD', '#fff', '#B0E39B'] },
      align: 'bottom',
    },
    series,
  };
  return (
    <section>
      <ReactEcharts
        option={option}
        style={{ height: height + 6 * len, width: width + 6 * len }}
        notMerge={true}
        lazyUpdate={true}
        theme="customed"
      />
      {target&&<div>
        <Switch
          checked={show}
          onClick={upShow}
        />
        {EN.DisplayTargetVariable}
      </div>}
    </section>
  );
}
