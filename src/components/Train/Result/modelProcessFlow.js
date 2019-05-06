import React, { Component, Fragment } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react'
import Next from './Next.svg'
import { Popover, Button, Icon, Tag } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';
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
			{this.list(data, 'categorical_encoding:one_hot_encoding:', EN.Onehotencoding)}
			{this.list(data, 'rescaling:', EN.Rescaling)}
			{this.list(data, 'imputation:', EN.Imputation)}
			{this.list(data, 'balancing:', EN.Banlance)}
		</dl>
	}

	FP(data) {
		const name = data['preprocessor:__choice__'];
		const types = {
			'extra_trees_preproc_for_classification': EN.extremlrandtreesprepr,
			'extra_trees_preproc_for_regression': EN.extremlrandtreesprepr,
			'fast_ica': EN.ICA,
			'feature_agglomeration': EN.FeatureAgglomeration,
			'kernel_pca': EN.kernelPCA,
			'kitchen_sinks': EN.KitchenSinks,
			'linear_svc_preprocessor': EN.LinearSVMprepr,
			'no_preprocessor': EN.NoPreprocessing,
			'no_preprocessing': EN.NoPreprocessing,
			'nystroem_sampler': EN.NystroemSampler,
			'pca': EN.PCA,
			'polynomial': EN.Polynomial,
			'random_trees_embedding': EN.RandomTreesembed,
			'select_percentile_classification': EN.SelectPercentile,
			'select_percentile_regression': EN.SelectPercentile,
			'select_rates': EN.SelectRates
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
		const { dataFlow, name = '' } = this.props.model;
		if (dataFlow.length === 1) {
			return <section className={styles.process}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				{this.popOver(this.DP(dataFlow[0]), EN.DataPreprocessing)}
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
				<label>{EN.EnsembledModel}</label>
				<img src={Next} alt='' />
				<label>{EN.Prediction}</label>
			</section>
		} else {
			let str = name.split('.')[0];
			str = str.substring(0, str.length - 1);
			return <section className={styles.process}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				<label>{str}</label>
				<img src={Next} alt='' />
				<label>{EN.Prediction}</label>
			</section>
		}
	}
}
