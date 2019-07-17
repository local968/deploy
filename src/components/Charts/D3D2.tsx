import React, {PureComponent} from 'react'
import TSEN from './T-SEN'
import request from '../Request'
import {Select} from 'antd';
const {Option} = Select;
import styles from './charts.module.css';
import THREE from './3Variable';
import EN from "../../constant/en";
import {inject} from "mobx-react";

interface DataSampleProps {
	url:string
	projectStore?:any
}

@inject('projectStore')
export default class D3D2 extends PureComponent<DataSampleProps>{
	state:any;
	show_name:any;
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			show:false,
			x_name:'',
			y_name:'',
			z_name:'',
			result:null,
			// show_name:{
			// 	x_name:'',
			// 	y_name:'',
			// 	z_name:'',
			// },
		};
		this.show_name = {
			x_name:'',
			y_name:'',
			z_name:'',
		}
	}

	componentWillReceiveProps(nextProps) {
		const {url} = this.props;
		if(nextProps.url !== url){
			this.setState({
				show:false,
			},()=>this.componentDidMount(nextProps.url));
		}
	}

	async componentDidMount(url=this.props.url) {

		const result:any = await request.post({
			url: '/graphics/residual-plot-diagnosis',
			data: {
				url,
			},
		});
		const {featuresLabel} = result;

		const [x_name,y_name,z_name=''] = featuresLabel;

		this.show_name = {
			x_name,
			y_name,
			z_name,
		};

		this.setState({
			result,
			ready:true,
			show:true,
			x_name,
			y_name,
			z_name,
		});
	}

	selection(order){
		const {result} = this.state;
		const {show_name} = this;
		const {featuresLabel} = result;

		const {mapHeader} = this.props.projectStore.project;

		const disable = Object.values(show_name).filter(itm=>itm !== show_name[order]);

		const options = featuresLabel.map(itm=><Option key={itm} disabled={disable.includes(itm)} title={mapHeader[itm]||itm} value={itm}>
			{mapHeader[itm]||itm}
		</Option>);
		options.unshift(<Option key='-000' disabled={disable.includes('')} value=''>none</Option>);
		return <Select
			defaultValue={show_name[order]}
			style={{ width: 120 }}
			getPopupContainer={() => document.getElementById(order)}
			onChange={name=>{
				this.show_name = {
						...this.show_name,
						[order]:name,
				}
				// this.setState({
				// 	show_name:{
				// 		...show_name,
				// 		[order]:name,
				// 	},
				// })
			}}>
			{
				options
			}
		</Select>
	}

	chart(){
		const {x_name,y_name,z_name,result} = this.state;
		const { featuresLabel, featureData, labels } = result;
		const {mapHeader} = this.props.projectStore.project;

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

	save(){
		// const {show_name} = this.state;
		const {show_name} = this;
		const {x_name,y_name,z_name} = show_name;
		this.setState({
			x_name,
			y_name,
			z_name,
			show:true,
		})
	}

	render() {
		const {ready,show} = this.state;
		if (!ready) {
			return <div/>
		}

		return <section className={styles.d3d2}>
			<dl>
				{
					show&&<React.Fragment>
						<dt>{EN.Choose2or3Variables}</dt>
						{
							['x_name','y_name','z_name'].map((itm,index)=><dd key={itm} id={itm}>Var{index+1}:{this.selection(itm)}</dd>)
						}
						<dd>
							<button className={styles.button} onClick={()=>{
								this.setState({
									show:false,
								},()=>this.save());
							}}>
								<span>{EN.Save}</span>
							</button>
						</dd>
					</React.Fragment>
				}
			</dl>
			{show&&this.chart()}
		</section>
	}
}
