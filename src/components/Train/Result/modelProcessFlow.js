import React, { Component, Fragment } from 'react';
// import styles from './styles.module.css';
import styles from '../../Modeling/Result/styles.module.css';
import { observer } from 'mobx-react'
import Next from './Next.svg'
import { Popover, Button, Icon } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';
@observer
export default class ModelProcessFlow extends Component {

	list(data) {
		const _data = Object.entries(data)
			// .filter(itm => itm[0].startsWith(type))
			// .filter(itm => !itm[0].endsWith("__choice__"))
			.filter(itm => itm[0].toString().toUpperCase() !== 'MODEL_NAME');
		if (_data.length || show) {
			return <Fragment>
				{/* <dt>{name}</dt> */}
				{
					_data.map((itm, index) => {
						const key = itm[0] //.substring(type.length);
						let value = itm[1];
						if (typeof value === 'number') {
							value = formatNumber(value)
						}
						// if (key === 'strategy') {
						// 	return <dd key={index}>{value}</dd>
						// }
						return <dd key={index}>{'' + key}:{'' + value}</dd>
					})
				}
			</Fragment>
		}
	}

	DP(label) {
		return <dl>
			{`${label} scale`}
		</dl>
	}

	// FP(data) {
	// 	const name = data['preprocessor:__choice__'];
	// 	const types = {
	// 		'extra_trees_preproc_for_classification': EN.extremlrandtreesprepr,
	// 		'extra_trees_preproc_for_regression': EN.extremlrandtreesprepr,
	// 		'fast_ica': EN.ICA,
	// 		'feature_agglomeration': EN.FeatureAgglomeration,
	// 		'kernel_pca': EN.kernelPCA,
	// 		'kitchen_sinks': EN.KitchenSinks,
	// 		'linear_svc_preprocessor': EN.LinearSVMprepr,
	// 		'no_preprocessor': EN.NoPreprocessing,
	// 		'no_preprocessing': EN.NoPreprocessing,
	// 		'nystroem_sampler': EN.NystroemSampler,
	// 		'pca': EN.PCA,
	// 		'polynomial': EN.Polynomial,
	// 		'random_trees_embedding': EN.RandomTreesembed,
	// 		'select_percentile_classification': EN.SelectPercentile,
	// 		'select_percentile_regression': EN.SelectPercentile,
	// 		'select_rates': EN.SelectRates
	// 	};

	// 	return <dl>
	// 		{this.list(data, `preprocessor:${name}:`, types[name], true)}
	// 	</dl>
	// }

	Third(data) {
		// let name = data['classifier:__choice__'];
		// let type = `classifier:${name}:`;
		// if (!name) {
		// 	name = data['regressor:__choice__'];
		// 	type = `regressor:${name}:`;
		// }

		return <dl>
			{this.list(data)}
		</dl>;
	}
	
	popOver(content, text) {
		return <Popover
			overlayClassName={styles.popover}
			arrowPointAtCenter={true}
			autoAdjustOverflow={false}
			getPopupContainer={() => document.getElementsByClassName(styles.process)[0]}
			placement="bottom" content={content} trigger="click">
			<Button>{text}<Icon type="down" /></Button>
		</Popover>
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
		
		const result = mismatchArray.map(itm=>({
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
				res.map((itm,ind)=>{
					return <dd key={ind}>
						<label>{itm.key}:</label>
						<ul>
							{
								itm.data.map((it,ind)=><li key={ind} title={mapHeader[it]}>{mapHeader[it]}</li>)
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
		
		const create = Object.values(expression).map(itm=>{
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
							drop.map(it=><li key={it} title={it}>{it}</li>)
						}
					</ul>
				</dt>:null
			}
			
			{
				raw.length?<dt>
					<label>{EN.DropTheseVariables}(raw):</label>
					<ul>
						{
							raw.map(it=><li key={it} title={it}>{it}</li>)
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
								create.map(it=><li key={it} title={it}>{it}</li>)
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
	
	
	render() {
		const { dataFlow, standardType } = this.props.model;
		return <section className={styles.process}>
			<label>{EN.RawData}</label>
			<img src={Next} alt='' />
			{this.popOver(this.DQF(),EN.DataQualityFixing)}
			{this.FS()}
			<img src={Next} alt='' />
			{this.popOver(this.DP(standardType), EN.DataPreprocessing)}
			<img src={Next} alt='' />
			{this.popOver(this.Third(dataFlow[0]), dataFlow[0].model_name)}
			<img src={Next} alt='' />
			<label>{EN.Prediction}</label>
		</section>
	}
}
