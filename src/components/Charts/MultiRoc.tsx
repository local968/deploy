import ReactEcharts from 'echarts-for-react';
import React from 'react';
import _ from 'lodash';
import EN from '../../constant/en';

interface Interface {
  chartData: {
    fpr: any;
    tpr: any;
    roc_auc:any
  };
}

export default function MultiRoc(props: Interface) {
  const {
    chartData: { fpr, tpr,roc_auc },
  } = props;
  const macro = _.zip(fpr.macro, tpr.macro);
  const micro = _.zip(fpr.micro, tpr.micro);
  const symbolSize = 2;

  const series = [
    {
      data: macro,
      symbolSize,
      type: 'scatter',
      name:`macro-average ROC curve(area=${roc_auc.macro.toFixed(2)})`
    },
    {
      data: micro,
      symbolSize,
      type: 'scatter',
      name:`micro-average ROC curve(area=${roc_auc.micro.toFixed(2)})`
    },
  ];
  const selected = {};
  Object.keys(fpr)
    .filter(itm => !['macro', 'micro'].includes(itm))
    .forEach(itm => {
      const name = `ROC curve of class ${itm}(area = ${roc_auc[itm].toFixed(2)})`;
      series.push({
        data: _.zip(fpr[itm], tpr[itm]),
        symbolSize: 1,
        type: 'line',
        name,
      });
      selected[name] = false;
    });

  const option = {
    title:{
      // text: 'Some extension of Receiver operating characteristic to multi-class',
    },
    xAxis: {
      type: 'value',
      name:EN.FalsePositiveRate
    },
    yAxis: {
      type: 'value',
      name:EN.TruePositiveRate,
    },
    tooltip: {},
    legend:{
      right:0,
      orient:"vertical",
      align:"left",
      type: 'scroll',
      selected,
      top:100,
      bottom:100,
    },
    series,
    grid:{
      x2:300,
    }
  };

  return (
    <ReactEcharts
      option={option}
      style={{ height: 500, width: 900 }}
      notMerge={true}
      lazyUpdate={true}
      theme="customed"
    />
  );
}
