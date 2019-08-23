import React from 'react';
import EN from '../../constant/en';
import {
  FitBar,
  PIE,
  HS,
  PVA,
  BoxPlots,
  TSENOne,
  CorrelationMatrixs,
	UnivariantPlots,
	HistogramCategorical,
} from './index';

interface Interface {
  project: any;
  x_name?: string;
  y_name?: string;
  name?: string;
  data: any;
}

export default function Chart(props: Interface) {
  let { x_name = '', y_name = '', project, name, data: _data = {} } = props;
  const { problemType, mapHeader, target } = project;
  let data;
  if (name) {
    data = _data;
  } else {
    name = _data.name;
    data = _data.data;
  }

  let chart;
  switch (name) {
    case 'correlation-matrix':
      const { header } = data;
      const { colType, trainHeader, dataHeader, dataViews } = project;
      const fields = Object.entries(colType)
        .filter(
          itm =>
            itm[1] !== 'Raw' &&
            itm[0] !== target &&
            !(itm[1] === 'Categorical' && dataViews[itm[0]].uniqueValues === 1),
        )
        .map(itm => itm[0])
        .filter(itm => !trainHeader.includes(itm) && dataHeader.includes(itm))
        .map(itm => mapHeader[itm]);
      chart = (
        <CorrelationMatrixs
          message={{
            data: data.data,
            header: header.map(itm => mapHeader[itm]),
            target: mapHeader[target],
            fields,
          }}
        />
      );
      break;
    case 'histogram-categorical':
      chart = (
        <HistogramCategorical
          x_name={x_name}
          y_name={y_name}
          data={data}
          across={
            problemType === 'MultiClassification' &&
            mapHeader[target] === x_name
          }
          width={550}
          height={330}
        />
      );
      break;
    case 'histogram-numerical':
      chart = <HS x_name={x_name} y_name={y_name} data={data} />;
      break;
    case 'classification-numerical':
    case 'classification-categorical':
      if (problemType === 'MultiClassification') {
        chart = <FitBar message={data} />;
      } else {
        chart = (
          <UnivariantPlots
            x_name={x_name}
            y_name={y_name}
            result={data}
            renameVariable={project.renameVariable}
          />
        );
      }
      break;
    case 'regression-numerical':
      chart = <TSENOne x_name={x_name} y_name={y_name} data={data} />;
      break;
    case 'regression-categorical':
      chart = <BoxPlots x_keys={data.x_keys} value={data.value} />;
      break;
    case 'predicted-vs-actual-plot':
      chart = (
        <PVA
          x_name={EN.PointNumber}
          y_name={y_name}
          data={data}
          project={project}
        />
      );
      break;
    case 'pie':
      chart = (
        <PIE
          RowsWillBeFixed={data.fixedPercent}
          RowsWillBeDeleted={data.deletePercent}
          CleanData={data.cleanPercent}
        />
      );
      break;
    default:
      chart = null;
  }
  return chart;
}
