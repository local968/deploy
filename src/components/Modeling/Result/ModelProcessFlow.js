import React, { Component, Fragment } from 'react';
import styles from './styles.module.css';
import {inject, observer} from 'mobx-react'
import Next from './Next.svg'
import { Popover, Button, Icon, Tag } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';

@inject('projectStore')
@observer
export default class ModelProcessFlow extends Component {

	list(data, type, name, show = false) {
		const _data = Object.entries(data)
			.filter(itm => itm[0].startsWith(type))
			.filter(itm => !itm[0].endsWith("__choice__"))
			.filter(itm => itm[1].toString().toUpperCase() !== 'NONE');
		if (_data.length || show) {
			return <Fragment>
				<dt>{name}</dt>
				{
					_data.map((itm, index) => {
						const key = itm[0].substring(type.length);
						let value = itm[1];
						if (typeof value === 'number') {
							value = formatNumber(value)
						}
						if (key === 'strategy') {
							return <dd key={index}>{value}</dd>
						}
						return <dd key={index}>{key}:{value}</dd>
					})
				}
			</Fragment>
		}
	}

	DP(data) {
		return <dl>
			{this.list(data, 'categorical_encoding:one_hot_encoding:', 'One hot encoding')}
			{this.list(data, 'rescaling:', 'Rescaling')}
			{this.list(data, 'imputation:', 'Imputation')}
			{this.list(data, 'balancing:', 'Banlance')}
		</dl>
	}

	FP(data) {
		const name = data['preprocessor:__choice__'];
		const types = {
			'extra_trees_preproc_for_classification': 'extreml.rand.trees.prepr.',
			'extra_trees_preproc_for_regression': 'extreml.rand.trees.prepr.',
			'fast_ica': 'ICA',
			'feature_agglomeration': 'Feature Agglomeration',
			'kernel_pca': 'kernel PCA',
			'kitchen_sinks': 'Kitchen Sinks',
			'linear_svc_preprocessor': 'Linear SVM prepr.',
			'no_preprocessor': 'No Preprocessing',
			'no_preprocessing': 'No Preprocessing',
			'nystroem_sampler': 'Nystroem Sampler',
			'pca': 'PCA',
			'polynomial': 'Polynomial',
			'random_trees_embedding': 'Random Trees embed.',
			'select_percentile_classification': 'Select Percentile',
			'select_percentile_regression': 'Select Percentile',
			'select_rates': 'Select Rates',
			'liblinear_svc_preprocessor':'Liblinear Svc Preprocessor'
		};

		return <dl>
			{this.list(data, `preprocessor:${name}:`, types[name], true)}
		</dl>
	}

	Third(data) {
		let name = data['classifier:__choice__'];
		let type = `classifier:${name}:`;
		if (!name) {
			name = data['regressor:__choice__'];
			type = `regressor:${name}:`;
		}

		return <dl>
			{this.list(data, type, '')}
		</dl>;
	}
	
	DQF(){
		const {nullFillMethod,mismatchFillMethod,outlierFillMethod} = this.props.projectStore.project;
		
		const mv = this.DQFData(nullFillMethod,EN.MissingValue);
		const mi = this.DQFData(mismatchFillMethod,EN.mismatch);
		const out = this.DQFData(outlierFillMethod,EN.Outlier);
		
		if(!mv&&!mi&&!out){
			return <dl>
				<dd>{EN.none}</dd>
			</dl>
		}
		
		return <dl>
			{mv}
			{mi}
			{out}
		</dl>
	}
	DQFData(data,title){
		const values = Object.entries(data);
		const mismatchArray = [{
			value: 'mode',
			label: EN.Replacewithmostfrequentvalue
		}, {
			value: 'drop',
			label: EN.Deletetherows
		}, {
			value: 'ignore',
			label: EN.Replacewithauniquevalue
		},{
			value: 'mean',
			label: EN.Replacewithmeanvalue
		}, {
			value: 'drop',
			label: EN.Deletetherows
		}, {
			value: 'min',
			label: EN.Replacewithminvalue
		}, {
			value: 'max',
			label: EN.Replacewithmaxvalue
		}, {
			value: 'median',
			label: EN.Replacewithmedianvalue
		}, {
			value: 'zero',
			label: EN.ReplaceWith0
		}, {
			value: 'others',
			label: EN.Replacewithothers
		}];
		
		const result = mismatchArray.map(itm=>({
			type:itm.value,
			key:itm.label,
			data:[],
		}));

		values.forEach(itm=>{
			result.filter(it=>it.type === itm[1])[0].data.push(itm[0]);
		});
		
		const resu = result.filter(itm=>itm.data&&itm.data.length);
		
		if(!resu.length){
			return null;
		}
		return <React.Fragment>
			<dt>{title}</dt>
			{
				resu.map(itm=><dd key={itm.key}>{itm.key}:{itm.data.join(',')}</dd>)
			}
		</React.Fragment>
	}
	

	popOver(content, text) {
		return <Popover
			arrowPointAtCenter={true}
			autoAdjustOverflow={false}
			getPopupContainer={() => document.getElementsByClassName(styles.process)[0]}
			placement="bottom" content={content} trigger="click">
			<Button>{text}<Icon type="down" /></Button>
		</Popover>
	}

	render() {
		const { dataFlow, modelName = '' } = this.props.model;
		if (dataFlow.length === 1) {
			return <section className={styles.process}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				{this.popOver(this.DQF(),EN.DataQualityFixing)}
				<img src={Next} alt='' />
				{this.popOver(this.DP(dataFlow[0]),  EN.DataPreprocessing)}
				<img src={Next} alt='' />
				{this.popOver(this.FP(dataFlow[0]), EN.FeaturePreprocessing)}
				<img src={Next} alt='' />
				{this.popOver(this.Third(dataFlow[0]), dataFlow[0].model_name)}
				<img src={Next} alt='' />
				<label>{EN.Prediction}</label>
			</section>
		} else if (dataFlow.length > 1) {
			return <section className={`${styles.process} ${styles.many}`}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				{this.popOver(this.DQF(),EN.DataQualityFixing)}
				<img src={Next} alt='' />
				<dl>
					{
						dataFlow.filter(itm => itm.weight).map((itm, index) => {
							return <dd key={index}>
								{this.popOver(this.DP(itm), EN.DataPreprocessing)}
								<img src={Next} alt='' />
								{this.popOver(this.FP(itm), EN.FeaturePreprocessing)}
								<img src={Next} alt='' />
								{this.popOver(this.Third(itm), itm.model_name)}
								<Tag>{formatNumber(+itm.weight || 0)}</Tag>
							</dd>
						})
					}
				</dl>
				<img src={Next} alt='' />
				<label>Ensembled Model</label>
				<img src={Next} alt='' />
				<label>{EN.Prediction}</label>
			</section>
		} else {
			let str = modelName.split('.')[0];
			str = str.substring(0, str.length - 1);
			return <section className={styles.process}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				{this.popOver(this.DQF(),EN.DataQualityFixing)}
				<img src={Next} alt='' />
		        <label>{str}</label>
		        <img src={Next} alt='' />
		        <label>{EN.Prediction}</label>
			</section>
		}
	}
}
