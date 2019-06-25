import React, { Component, Fragment } from 'react';
import styles from './styles.module.css';
import {inject, observer} from 'mobx-react'
import Next from './Next.svg'
import { Popover, Button, Icon } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import {toJS} from "mobx";

@inject('projectStore')
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
			{label}
		</dl>
	}

	FP() {
		return <dl>
			<dd>No Preprocessing</dd>
		</dl>
	}

	Third(data) {
		return <dl>
			{this.list(data)}
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
		} = this.props.projectStore.project;
		
		const nfm = _.cloneDeep(nullFillMethod);
		const mfm = _.cloneDeep(mismatchFillMethod);
		
		Object.entries(nullLineCounts).filter(itm=>itm[1]&&!nullFillMethod[itm[0]]).map(itm=>{
			nfm[itm[0]] = colType[itm[0]] === 'Numerical' ? 'mean' : 'mode';
		});
		
		if(otherMap.hasOwnProperty('')){
			Reflect.deleteProperty(nfm,target);
		}
		
		Object.entries(mismatchLineCounts).filter(itm=>colType[itm[0]] === 'Numerical'&&itm[1]&&!mismatchFillMethod[itm[0]]).map(itm=>{
			mfm[itm[0]] = 'mean';
		});
		
		const mv = this.DQFData(nfm,EN.MissingValue,nullLineCounts[target]);//缺失值
		const mi = this.DQFData(mfm,EN.mismatch,mismatchLineCounts[target]);
		const out = this.DQFData(outlierFillMethod,`${EN.Outlier}(${target})`,outlierLineCounts[target],true);
		
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
		} = this.props.projectStore.project;
		
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
			const NFMT = nullFillMethod[target];
			
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
		
		// drop = drop.map(itm=>mapHeader[itm]);
		
		return <React.Fragment>
			<dt>{EN.TargetMore2Unique}</dt>
			{
				<dd title={drop.join(',')} style={{display:(drop.length?'':'none')}}>{EN.DropTheRows}:{drop.join(',')}</dd>
			}
			{
				<dd title={mapping.map(itm=>`${itm[0]}->${itm[1]}`)} style={{display:(mapping.length?'':'none')}}>{EN.Mapping}:{mapping.map((itm,index)=>`${index?',':''}${itm[0]}->${itm[1]}`)}</dd>
			}
		</React.Fragment>
	}
	
	DQFData(data,title,showTarget,outlier=false){
		const { colType,target,rawDataView,outlierDictTemp,mapHeader} = this.props.projectStore.project;
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
				res.map(itm=>{
					const _data = itm.data.map(itm=>mapHeader[itm]).join(',');
					return <dd key={itm.key} title={_data}>{itm.key}:{_data}</dd>
				})
			}
		</Fragment>
	}
	
	FS(){//新建特性与特征选择
		const { featureLabel } = this.props.model;
		const {rawHeader,expression,target,colType,mapHeader} = this.props.projectStore.project;
		
		let drop = _.without(rawHeader,...featureLabel,target);
		
		const create = Object.values(expression).map(itm=>{
			return `${itm.nameArray.join(',')}=${itm.exps.map(it=>it.value).join('')}`
		}).filter(itm=>itm);
		
		if(!drop.length&&!create.length){
			return null;
		}
		
		let raw = drop.filter(itm=>colType[itm] === "Raw");
		drop = _.without(drop,...raw).map(itm=>mapHeader[itm]||itm);
		
		raw = raw.map(itm=>mapHeader[itm]||itm);
		
		const pop = <dl className={styles.over}>
			<dt style={{display:(drop.length?'':'none')}} title = {drop.join(',')}>
				{EN.DropTheseVariables}:<label>{drop.join(',')}</label>
			</dt>
			<dt style={{display:(raw.length?'':'none')}} title = {raw.join(',')}>
				{EN.DropTheseVariables}(raw):<label>{raw.join(',')}</label>
			</dt>
			<dt style={{display:(create.length?'':'none')}} title = {create.join(',')}>
				{EN.CreateTheseVariables}:
			</dt>
			{
				create.map((itm,index)=><dd key={index} title={mapHeader[itm]}>{mapHeader[itm]}</dd>)
			}
		</dl>;
		
		return <Fragment>
			<img src={Next} alt='' />
			{this.popOver(pop,EN.FeatureCreationSelection)}
		</Fragment>
	}

	render() {
		const { dataFlow } = this.props.model;
		return <section className={styles.process}>
			<label>{EN.RawData}</label>
			<img src={Next} alt='' />
			{this.popOver(this.DQF(),EN.DataQualityFixing)}
			{this.FS()}
			<img src={Next} alt='' />
			{this.popOver(this.FP(), EN.DataPreprocessing)}
			<img src={Next} alt='' />
			{this.popOver(this.FP(), EN.FeaturePreprocessing)}
			<img src={Next} alt='' />
			{this.popOver(this.Third(dataFlow[0]), dataFlow[0].model_name)}
			<img src={Next} alt='' />
			<label>{EN.Prediction}</label>
		</section>
	}
}
