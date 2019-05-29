import React, {useEffect, useState} from 'react';
import styles from "../Train/AdvancedViewUn/AdvancedView.module.css";
import {Select} from "antd";
import PCS from "./PCS";
import request from "../Request";
import TSEN from "./T-SEN";
const {Option} = Select;

export default function PAW(props){
	const {url}  = props;
	const [data,setData] = useState({});
	const [pcs,setPcs] = useState([0,1]);
	const [pcsD,setPcsD] = useState([]);
	const [tsenD,setTsenD] = useState([]);
	
	function setPcsData(data){
		const xs = data[pcs[0]];
		const ys = data[pcs[1]];
		// return data.map(itm=>{
		// 	const re = [];
		// 	itm.forEach((it,index)=>{
		// 		if(pcs.includes(index)){
		// 			re.push(it)
		// 		}
		// 	});
		// 	return re;
		// })
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
	
	useEffect(() => {
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
	
	const {corrData=[],ve=[],pcaData=[],predicts} = data;
	
	useEffect(() => {
		setPcsD(setPcsData(corrData));
		setTsenD(setTsenData(pcaData,predicts));
	}, pcs);
	
	return <section className={styles.pca}>
		<div className={styles.table}>
			Variance Explained
			<dl>
				<dt>
					<ul>
						<li>#PC</li>
						<li>Eigenvalue</li>
						<li>Comulated Proportion</li>
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
				Choose 2 PCs
				<Select
					style={{ width: 120 }}
					value = {pcs[0]}
				        onChange={value=>{
					        setPcs([value,pcs[1]]);
				}}>
					{
						corrData.map((itm,index)=><Option key={index} value={index} disabled={index === pcs[1]}>PC{index+1}</Option>)
					}
				</Select>
				<Select
					style={{ width: 120 }}
					value = {pcs[1]}
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
					{/*The Correlation between PCs and original variables:*/}
					<PCS
						 data={pcsD}
					     x_name = {'PC'+(pcs[0]+1)}
					     y_name = {'PC'+(pcs[1]+1)}
					/>
				</dt>
				<dd>
					<TSEN
						x_name = {'PC'+(pcs[0]+1)}
						y_name = {'PC'+(pcs[1]+1)}
						width = {380}
						height={340}
						data={tsenD}
						title={'ScatterPlot of PCs:'}
					/>
				</dd>
			</dl>
		</div>
	</section>
}
