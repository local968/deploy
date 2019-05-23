import React from 'react';
import styles from "../Train/AdvancedViewUn/AdvancedView.module.css";
import {Select} from "antd";
import PCS from "./PCS";

export default function PAW(props){
	const {url}  = props;
	console.log(url)
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
				<dd>
					<ul>
						<li>1</li>
						<li>2</li>
						<li>3</li>
					</ul>
				</dd>
				<dd>
					<ul>
						<li>2</li>
						<li>2</li>
						<li>3</li>
					</ul>
				</dd>
			</dl>
		</div>
		<div className={styles.chart}>
			<div>
				Choose 2 PCs
				<Select style={{ width: 120 }} onChange={name=>{
				
				}}>
					<Option key={'0'}>3</Option>
				</Select>
			</div>
			<dl>
				<dt>
					{/*The Correlation between PCs and original variables:*/}
					<PCS/>
				</dt>
				<dd></dd>
			</dl>
		</div>
	</section>
}
