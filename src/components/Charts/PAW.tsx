import React, {useEffect, useState} from 'react';
import styles from "../Train/AdvancedViewUn/AdvancedView.module.css";
import {Select} from "antd";
import PCS from "./PCS";
import request from "../Request";
import TSEN from "./T-SEN";
import EN from "../../constant/en";
const {Option} = Select;
import { Hint } from 'components/Common';
import _ from 'lodash';

export default function PAW(props){
	const {url}  = props;
	const [data,setData] = useState({});
	const [pcs,setPcs] = useState([0,1]);
	const [pcsD,setPcsD] = useState([]);
	const [tsenD,setTsenD] = useState([]);

	function setPcsData(data){
		const xs = data[pcs[0]];
		const ys = data[pcs[1]];
		return _.zip(xs,ys);
	}

	function setTsenData(pcaData=[],predicts=[]){
		let data = [...new Set(predicts)].map(name=>({
			name,
			value:[],
		}));
		pcaData.map((itm,index)=>{
			const re = [];
			itm.forEach((it,index)=>{
				if(pcs.includes(index)){
					re.push(it)
				}
			});
			// return re;
			data.filter(it=>it.name === predicts[index])[0].value.push(re);
		});
		return data;
	}

	useEffect( function() {
		async function fetchData() {
			const result = await request.post({
				url: '/graphics/paw',
				data: {
					url,
				},
			});
			setData(result);
			setPcsD(setPcsData(result.corrData));
			setTsenD(setTsenData(result.pcaData,result.predicts))
		}
		fetchData();
	}, []);

	const {corrData=[],ve=[],pcaData=[],predicts,fields} = data as any;

	useEffect(() => {
		setPcsD(setPcsData(corrData));
		setTsenD(setTsenData(pcaData,predicts));
	}, pcs);


	return <section className={styles.pca}>
		<div className={styles.table}>
			{EN.VarianceExplained}
			<Hint content={<div dangerouslySetInnerHTML={{__html:EN.VarianceExplainedTip}}/>} />
			<dl>
				<dt>
					<ul>
						<li>{EN.PC}</li>
						<li>{EN.Eigenvalue}</li>
						<li>{EN.ComulatedProportion}</li>
					</ul>
				</dt>
				{
					ve.map((itm,index)=>(<dd key={index}>
						<ul>
							<li>{index+1}</li>
							{itm.map(it=><li key={it+index}>{it.toFixed(3)}</li>)}
						</ul>
					</dd>))
				}
			</dl>
		</div>
		<div className={styles.chart}>
			<div>
				{EN.Choose2PCs}
				<Hint content={<div dangerouslySetInnerHTML={{__html:EN.Choose2PCsTip}}/>} />
				<Select
					id='select_1'
					style={{ width: 120 }}
					value = {pcs[0]}
					getPopupContainer={() => document.getElementById('select_1')}
			        onChange={value=>{
				        setPcs([value,pcs[1]]);
				}}>
					{
						corrData.map((itm,index)=><Option key={index} value={index} disabled={index === pcs[1]}>PC{index+1}</Option>)
					}
				</Select>
				<Select
					id='select_2'
					style={{ width: 120 }}
					value = {pcs[1]}
					getPopupContainer={() => document.getElementById('select_2')}
					onChange={value=>{
						setPcs([pcs[0],value]);
					}}>
					{
						corrData.map((itm,index)=><Option key={index} value={index} disabled={index === pcs[0]}>PC{index+1}</Option>)
					}
				</Select>
			</div>
			<dl>
				<dt>
					<PCS
						 data={pcsD}
						 x_name = {'PC'+(pcs[0]+1)}
						 y_name = {'PC'+(pcs[1]+1)}
						 fields = {fields}
					/>
				</dt>
				<dd>
					<TSEN
						x_name = {'PC'+(pcs[0]+1)}
						y_name = {'PC'+(pcs[1]+1)}
						width = {380}
						height={340}
						data={tsenD}
						title={EN.ScatterPlotOfPCs}
					/>
				</dd>
			</dl>
		</div>
	</section>
}
