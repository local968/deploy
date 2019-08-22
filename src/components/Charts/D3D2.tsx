import React, {useContext, useState, useEffect } from 'react';
import TSEN from './T-SEN'
import request from '../Request'
import styles from './charts.module.css';
import THREE from './3Variable';
import EN from "../../constant/en";
import {MobXProviderContext, observer } from 'mobx-react';
import D3D2List from './D3D2List'

interface Interface {
	url:string
	projectStore?:any
}
const D3D2 = observer((props:Interface)=>{
	const {url} = props;
	const {projectStore:{project:{mapHeader}}} = useContext(MobXProviderContext);
	const [ready,upReady] = useState(false);
	const [show,upShow] = useState(false);
	const [x_name,upx_name] = useState('');
	const [y_name,upy_name] = useState('');
	const [z_name,upz_name] = useState('');
	const [result,upResult] = useState({} as any);
	const [changing,upChanging] = useState(false);
	useEffect(()=>{
		upShow(false);
		upChanging(true);
		request.post({
			url: '/graphics/residual-plot-diagnosis',
			data: {
				url,
			},
		}).then((result:any)=>{
			const {featuresLabel} = result;

			const [x_name,y_name,z_name=''] = featuresLabel;
			upResult(result);
			upx_name(x_name);
			upy_name(y_name);
			upz_name(z_name);
			upChanging(false);
			upReady(true);
			upShow(true);
		})
	},[url]);
	function chart(){
		if(!show)return null;
		const { featuresLabel, featureData, labels } = result;
		const data = [...new Set(labels)].map(itm => {
			return {
				name: itm,
				value: [],
			}
		});

		let dot = [x_name, y_name, z_name].map(itm => featuresLabel.indexOf(itm));

		featureData.map((itm, index) => {
			const val = dot.map(it=>itm[it]).filter(it=>it === 0 ||it);
			data.filter(itm => itm.name === labels[index])[0].value.push(val);
		});

		const names = [x_name, y_name, z_name].filter(itm=>itm);
		if (names.length === 3) {
			return <THREE
				x_name={mapHeader[x_name]||x_name}
				y_name={mapHeader[y_name]||y_name}
				z_name={mapHeader[z_name]||z_name}
				data={data}
			/>
		}
		return <TSEN
			x_name={mapHeader[names[0]]||names[0]}
			y_name={mapHeader[names[1]]||names[1]}
			data={data}
			average={true}
		/>
	}
	async function save(show_name){
		const {x_name,y_name,z_name} = show_name;
		await upShow(false);

		upx_name(x_name);
		upy_name(y_name);
		upz_name(z_name);
		upShow(true);
	}
	if (!ready) {
		return <div/>
	}

	return <section className={styles.d3d2}>
		<dl>
			{
				!changing&&<>
					<dt>{EN.Choose2or3Variables}</dt>
					<D3D2List
						featuresLabel = {result.featuresLabel}
						mapHeader = {mapHeader}
						update = {save}
					/>
				</>
			}
		</dl>
		{chart()}
	</section>
});
export default D3D2;
