import React, { Component, Fragment } from 'react';
import styles from './styles.module.css';
import {inject, observer} from 'mobx-react'
import Next from './Next.svg'
import { Popover, Button, Icon } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';

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
		
		const mv = this.DQFData(nfm,EN.MissingValue,nullLineCounts[target]);
		const mi = this.DQFData(mfm,EN.mismatch,mismatchLineCounts[target]);
		const out = this.DQFData(outlierFillMethod,`${EN.Outlier}(${target})`,outlierLineCounts[target],true);
		
		if(!mv&&!mi&&!out){
			return <dl>
				<dd>{EN.none}</dd>
			</dl>
		}
		
		return <dl className={styles.over}>
			{problemType==='Classification'&&this.DQFT()}
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
		} = this.props.projectStore.project;
		
		let drop = [],mapping=[];
		
		const df = _.without(Object.keys(colValueCounts[target]),...targetArray);
		df.forEach(itm=>{
			if(otherMap[itm]){
				mapping.push([itm,otherMap[itm]])
			}else{
				drop.push(itm);
			}
		});
		
		if(drop.length&&Object.keys(colValueCounts[target]).length === 2){
			drop = [];
		}
		
		if(!drop.length&&!mapping.length){
			return null;
		}
		
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
		const { colType,target,rawDataView,outlierDictTemp} = this.props.projectStore.project;
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
			return <React.Fragment>
				<dt>{title}</dt>
				<dd>{EN.ValidRange}:[{low},{high}]</dd>
				{
					res.map(itm=><dd key={itm.key} title={itm.data.join(',')}>{itm.key}</dd>)
				}
			</React.Fragment>
		}
		return <React.Fragment>
			<dt>{title}</dt>
			{
				res.map(itm=><dd key={itm.key} title={itm.data.join(',')}>{itm.key}:{itm.data.join(',')}</dd>)
			}
		</React.Fragment>
	}

	render() {
		const { dataFlow, standardType } = this.props.model;
		// if (dataFlow.length === 1) {
		return <section className={styles.process}>
			<label>{EN.RawData}</label>
			<img src={Next} alt='' />
			{this.popOver(this.DQF(),EN.DataQualityFixing)}
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
