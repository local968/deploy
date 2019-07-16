import React, {Component, Fragment} from 'react';
import styles from './styles.module.css';
import {Button, Icon, Popover, Tag} from 'antd'
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import {toJS} from "mobx";
import _ from 'lodash';
import classnames from 'classnames'

const Next = 'data:image/svg+xml;base64,DQo8c3ZnIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IjUtNS00bW9kZWxpbmctQkNsYXNzaWZpY2F0aW9uLXNpbXBsZVZpZXc1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjkyLjAwMDAwMCwgLTQ1NC4wMDAwMDApIiBmaWxsPSIjNDQ4RUVEIj4NCiAgICAgICAgICAgIDxnIGlkPSJHcm91cC00MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjIxLjQwMDAwMCwgNDQ3LjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJQYWdlLTEiIHBvaW50cz0iNzcuNDg2NzM3NyA3LjE5OTkxODAzIDc3LjQ4NjczNzcgMTAuMjcwNTk0NCA3MC44IDEwLjI3MDU5NDQgNzAuOCAxOS4xMjg5MTM4IDc3LjQ4NjczNzcgMTkuMTI4OTEzOCA3Ny40ODY3Mzc3IDIyLjIgODUuODAwNDA4OSAxNC42OTk5NTkiPjwvcG9seWdvbj4NCiAgICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg=='

interface Interface {
	project:any
	model:any
}
export default class ModelProcessFlow extends Component<Interface> {

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
							value = formatNumber(String(value))
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
		const rescaling = {
			minmax:'MinMaxScaler',
			normalize:'Normalizer',
			quantile_transformer:'QuantileTransformer',
			robust_scaler:'RobustScaler',
			standardize:'StandardScaler',
			none:'No Scaling',
		}[data['rescaling:__choice__']];

		const {
			model:{featureLabel},
			project:{ colType ,mapHeader}
		} = this.props;

		const variables = featureLabel.filter(itm=>colType[itm] === "Categorical").map(itm=>mapHeader[itm]||itm);

		return <dl className={styles.over}>
			{this.list(data, 'categorical_encoding:one_hot_encoding:', 'Encoding:OneHotEncoding')}
			{data['categorical_encoding:__choice__'] === "one_hot_encoding"&&<dd>
				<p style={{display:(variables.length?'':'none')}}>
					<label>variables:</label>
					<ul>
						{
							variables.map(it=><li title={it}>{it}</li>)
						}
					</ul>
				</p>
			</dd>}

			{/*{this.list(data, 'categorical_encoding:no_encoding:', 'Encoding:No Encoding')}*/}
			{data['categorical_encoding:__choice__'] === "no_encoding"&&<dt>Encoding:No Encoding</dt>}
			<dt>Banlance:{data['balancing:strategy']}</dt>
			{this.list(data, `rescaling:${data['rescaling:__choice__']}:`, `Rescaling:${rescaling}`)}
		</dl>
	}

	FP(data) {
		const name = data['preprocessor:__choice__'];
		const types = {
			'extra_trees_preproc_for_classification': 'SelectFeature_ExtraTreesClassifier',
			'extra_trees_preproc_for_regression': 'SelectFeature_ExtraTreesRegressor',
			'fast_ica': 'FastICA',
			'feature_agglomeration': 'FeatureAgglomeration',
			'kernel_pca': 'KernelPCA',
			'kitchen_sinks': 'kernel_approximation_RBFSampler',
			'linear_svc_preprocessor': 'Linear SVM prepr.',
			'no_preprocessor': 'No Preprocessing',
			'no_preprocessing': 'No Feature Preprocessing',
			'nystroem_sampler': 'kernel_approximation_Nystroem',
			'pca': 'PCA',
			'polynomial': 'PolynomialFeatures',
			'random_trees_embedding': 'RandomTreesEmbedding',
			'select_percentile_classification': 'SelectPercentile',
			'select_percentile_regression': 'SelectPercentile',
			'select_rates': 'GenericUnivariateSelect',
			'liblinear_svc_preprocessor':'SelectFeature_LinearSVC',
			'truncatedSVD':'TruncatedSVD',
		};

		return <dl className={styles.over}>
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

		const result = this.list(data, type, '');

		if(result){
			return <dl className={styles.over}>
				{this.list(data, type, '')}
			</dl>;
		}
		return <dl>
			<dd>{EN.none}</dd>
		</dl>
	}

	DQF(){
		const {
			nullFillMethod,nullLineCounts,
			mismatchFillMethod,mismatchLineCounts,
			outlierFillMethod,outlierLineCounts,
			colType,
			target,
			problemType,
			otherMap,
			mapHeader,
		} = this.props.project;

		const nfm = _.cloneDeep(nullFillMethod);
		const mfm = _.cloneDeep(mismatchFillMethod);

		Object.entries(nullLineCounts).filter(itm=>itm[1]&&!nullFillMethod[itm[0]]).map(itm=>{
			nfm[itm[0]] = colType[itm[0]] === 'Numerical' ? 'mean' : 'mode';
		});

		if(problemType==='Classification'){
			Reflect.deleteProperty(nfm,target)
		}

		if(otherMap.hasOwnProperty('')){
			Reflect.deleteProperty(nfm,target);
		}

		Object.entries(mismatchLineCounts).filter(itm=>colType[itm[0]] === 'Numerical'&&itm[1]&&!mismatchFillMethod[itm[0]]).map(itm=>{
			mfm[itm[0]] = 'mean';
		});

		const mv = this.DQFData(nfm,EN.MissingValue,nullLineCounts[target]);//缺失值
		const mi = this.DQFData(mfm,EN.mismatch,mismatchLineCounts[target]);
		const out = this.DQFData(outlierFillMethod,`${EN.Outlier}(${mapHeader[target]})`,outlierLineCounts[target],true);

		const dqft = problemType==='Classification'&&this.DQFT();

		if(!mv&&!mi&&!out&&!dqft){
			return <dl>
				<dd>{EN.none}</dd>
			</dl>
		}

		return <dl className={styles.over}>
			{dqft}
			{mv}
			{mi}
			{out}
		</dl>
	}

	DQFT(){
		const {
			otherMap,
			targetArray,
			colValueCounts,
			target,
			targetCounts,
			nullFillMethod,
			nullLineCounts,
		} = this.props.project;

		let drop = [],mapping=[];

		let ta =[...targetArray];

		if(!targetArray.length){
			ta = Object.keys(targetCounts).splice(0,2)
		}

		const df = _.without(Object.keys(colValueCounts[target]),...ta);

		const om = {};
		Object.entries(toJS(otherMap)).forEach(itm=>{
			om[itm[0]] = (itm[1]||'NULL')
		});

		df.forEach(itm=>{
			if(om[itm]){
				mapping.push([itm,om[itm]])
			}else{
				drop.push(itm);
			}
		});


		if(ta.find(itm=>itm === '') === undefined){
			const NFMT = om['']||nullFillMethod[target];

			if(NFMT&&nullLineCounts[target]){
				if(NFMT === 'drop'){
					drop.push('NULL')
				}else{
					mapping.push(['NULL',NFMT])
				}
			}

		}

		if(!drop.length&&!mapping.length){
			return null;
		}

		return <Fragment>
			<dt>{EN.TargetMore2Unique}</dt>
			{
				<dd title={drop.join(',')} style={{display:(drop.length?'':'none')}}>{EN.DropTheRows}:{drop.join(',')}</dd>
			}
			{
				<dd title={mapping.map(itm=>`${itm[0]}->${itm[1]}`).join(',')}
				    style={{display:(mapping.length?'':'none')}}>
					{EN.Mapping}:{mapping.map((itm,index)=>`${index?',':''}${itm[0]}->${itm[1]}`)}
				</dd>
			}
		</Fragment>
	}


	DQFData(data,title,showTarget,outlier=false){
		const { colType,target,rawDataView,outlierDictTemp,mapHeader} = this.props.project;
		if(!showTarget){
			Reflect.deleteProperty(data,target)
		}
		const values = Object.entries(data);

		const mismatchArray =  [{
			value: 'mode',
			label: EN.Replacewithmostfrequentvalue
		}, {
			value: 'drop',
			label: EN.Deletetherows
		}, {
			value: 'ignore',//Categorical
			label: EN.Replacewithauniquevalue
		}, {
			value: 'ignore',
			label: EN.DoNothing
		},{
			value: 'mean',
			label: EN.Replacewithmeanvalue
		},{
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
		},{
			value: 'low',
			label: EN.Replacewithlower
		}, {
			value: 'high',
			label: EN.Replacewithupper
		}];

		const result:any = mismatchArray.map(itm=>({
			type:itm.value,
			key:itm.label,
			data:[],
		}));

		values.forEach(itm=>{
			if(!isNaN(+itm[1])){
				if(!result.find(itm=>itm.type === itm[1])){
					result.push({
						type:itm[1],
						key:EN.Replacewith + itm[1],
						data:[],
					})
				}
				result.filter(it=>it.type === itm[1])[0].data.push(itm[0]);
			}else if(itm[1]!=='ignore'){
				result.filter(it=>it.type === itm[1])[0].data.push(itm[0]);
			}else{
				if(colType[itm[0]] === 'Categorical'){
					result.filter(it=>it.type === itm[1])[0].data.push(itm[0]);
				}else{
					result.filter(it=>it.type === itm[1])[1].data.push(itm[0]);
				}
			}
		});

		const res = result.filter(itm=>itm.data&&itm.data.length);

		if(!res.length){
			return null;
		}
		if(outlier){
			let {low,high} = rawDataView[target];
			if(outlierDictTemp[target]){
				const lh = [...outlierDictTemp[target]];
				low = lh[0];
				high = lh[1];
			}else{
				low = +low.toFixed(2);
				high = +high.toFixed(2);
			}
			return <Fragment>
				<dt>{title}</dt>
				<dd>{EN.ValidRange}:[{low},{high}]</dd>
				{
					res.map(itm=><dd key={itm.key} title={itm.data.map(itm=>mapHeader[itm]).join(',')}>{itm.key}</dd>)
				}
			</Fragment>
		}
		return <Fragment>
			<dt>{title}</dt>
			{
				res.map(itm=>{
					return <dd>
						<label>{itm.key}:</label>
						<ul>
							{
								itm.data.map(it=><li title={mapHeader[it]}>{mapHeader[it]}</li>)
							}
						</ul>
					</dd>
				})
			}
		</Fragment>
	}

	FS(){//新建特性与特征选择
		const { featureLabel } = this.props.model;
		const {rawHeader,expression,target,colType,mapHeader} = this.props.project;

		let drop = _.without(rawHeader,...featureLabel,target);

		const create = Object.values(expression).map((itm:any)=>{
			return `${itm.nameArray.join(',')}=${itm.exps.map(it=>it.type=== 'ID'?mapHeader[it.value]:it.value).join('')}`
		});

		if(!drop.length&&!create.length){
			return null;
		}

		let raw = drop.filter(itm=>colType[itm] === "Raw");
		drop = _.without(drop,...raw).map(itm=>mapHeader[itm]||itm);

		raw = raw.map(itm=>mapHeader[itm]||itm);

		const pop = <dl className={styles.over}>
			{
				drop.length?<dt>
					<label>{EN.DropTheseVariables}:</label>
					<ul>
						{
							drop.map(it=><li title={it}>{it}</li>)
						}
					</ul>
				</dt>:null
			}

			{
				raw.length?<dt>
					<label>{EN.DropTheseVariables}(raw):</label>
					<ul>
						{
							raw.map(it=><li title={it}>{it}</li>)
						}
					</ul>
				</dt>:null
			}
			{
				create.length?<Fragment>
					<dt title = {create.join(',')}>
						<label>{EN.CreateTheseVariables}:</label>
						<ul>
							{
								create.map(it=><li title={it}>{it}</li>)
							}
						</ul>
					</dt>
				</Fragment>:null
			}

		</dl>;

		return <Fragment>
			<img src={Next} alt='' />
			{this.popOver(pop,EN.FeatureCreationSelection)}
		</Fragment>
	}

	popOver(content, text) {
		return <Popover
			overlayClassName={styles.popover}
			arrowPointAtCenter={true}
			autoAdjustOverflow={false}
			getPopupContainer={() => (document as any).getElementsByClassName(styles.process)[0]}
			placement="bottom" content={content} trigger="click">
			<Button>{text}<Icon type="down" /></Button>
		</Popover>
	}

	render() {
		const { dataFlow, modelName = '' } = this.props.model;
		if (dataFlow.length === 1) {
			return <section className={classnames(styles.process)}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				{this.popOver(this.DQF(),EN.DataQualityFixing)}
				{this.FS()}
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
			return <section className={classnames(styles.process,styles.many)}>
				<label>{EN.RawData}</label>
				<img src={Next} alt='' />
				{this.popOver(this.DQF(),EN.DataQualityFixing)}
				{this.FS()}
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
								<Tag>{formatNumber(itm.weight || '0')}</Tag>
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
				{this.FS()}
				<img src={Next} alt='' />
		        <label>{str}</label>
		        <img src={Next} alt='' />
		        <label>{EN.Prediction}</label>
			</section>
		}
	}
}