import React, {PureComponent} from 'react'
import THREE from './3Variable'
import TSEN from './T-SEN'

const d3d2 = require('../d3d2.json');


export default class D3D2 extends PureComponent{
	constructor(props){
		super(props);
	}
	
	render(){
		const {featuresLabel,featureData,labels} = d3d2;
		
		const x_name = 'age';
		const y_name = 'balance';
		const z_name = 'day';
		
		const data =[...new Set(labels)].map(itm=>{
			return {
				name:itm,
				value:[],
			}
		});
		
		let dot = [x_name,y_name,z_name].map(itm=>featuresLabel.indexOf(itm));
		
		featureData.map((itm,index)=>{
			const val = itm.filter((it,index)=>{
				return dot.includes(index)
			});
			data.filter(itm=>itm.name === labels[index])[0].value.push(val);
		});
		
		if(z_name){
			return <THREE
				x_name={x_name}
				y_name={y_name}
				z_name={z_name}
				data={data}
			/>
		}else{
			return <TSEN
				x_name={x_name}
				y_name={y_name}
				data={data}/>
		}
	}
}
