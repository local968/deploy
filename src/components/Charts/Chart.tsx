import React from 'react';
import HistogramCategorical from "./HistogramCategorical";
import HistogramNumerical from "./HistogramNumerical";
import UnivariantPlots from "./UnivariantPlots";
import CorrelationMatrixs from "./CorrelationMatrixs";
import TSENOne from "./TSENOne";
import BoxPlots from "./BoxPlots";
import EN from "../../constant/en";
import PIE from "./PIE";
import PVA from "./PVA";

export default function Chart(props){
	const {x_name='',y_name='',title='',project} = props;
	const {data:_data={}} = props;
	const {name,data} = _data as any;
	let chart;
	switch (name) {
		case 'histogram-categorical':
			chart = <HistogramCategorical
				x_name={x_name}
				y_name={y_name}
				title={title}
				data={data}
			/>;
			break;
		case 'histogram-numerical':
			chart = <HistogramNumerical
				x_name={x_name}
				y_name={y_name}
				title={title}
				data={data}
			/>;
			break;
		case 'classification-numerical':
			// @ts-ignore
			chart = <UnivariantPlots
				x_name={x_name}
				y_name={y_name}
				result={data}
			/>;
			break;
		case 'classification-categorical':
			// @ts-ignore
			chart = <UnivariantPlots
				x_name={x_name}
				y_name={y_name}
				result={data}
			/>;
			break;
		case 'correlation-matrix':
			chart = <CorrelationMatrixs
				value={data.value}
				type={data.type}
			/>;
			break;
		case 'regression-numerical':
			chart = <TSENOne
				x_name={x_name}
				y_name={y_name}
				data={data}
			/>;
			break;
		case 'regression-categorical':
			// @ts-ignore
			chart = <BoxPlots
				x_keys={data.x_keys}
				value={data.value}
			/>;
			break;
		case 'predicted-vs-actual-plot':
			//@ts-ignore
			chart = <PVA
				x_name = {EN.PointNumber}
				y_name = {y_name}
				data={data}
				project={project}
			/>;
			break;
		case 'pie':
			chart = <PIE
				RowsWillBeFixed={data.fixedPercent}
				RowsWillBeDeleted={data.deletePercent}
				CleanData={data.cleanPercent}
			/>;
			break;
		default:
			chart = null;

	}
	return chart;
}
