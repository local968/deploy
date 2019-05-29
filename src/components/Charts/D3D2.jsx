import React, {PureComponent} from 'react'
import TSEN from './T-SEN'
import request from '../Request'
import { Select } from 'antd';
const {Option} = Select;
import styles from './charts.module.css';
import THREE from './3Variable';
import EN from "../../constant/en";

export default class D3D2 extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			x_name:'',
			y_name:'',
			z_name:'',
			result:null,
			show_name:{
				x_name:'',
				y_name:'',
				z_name:'',
			},
		}
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.url !== this.props.url){
			return this.componentDidMount(nextProps.url);
		}
	}
	
	async componentDidMount(url=this.props.url) {
		const result = await request.post({
			url: '/graphics/residual-plot-diagnosis',
			data: {
				url,
			},
		});
		const {featuresLabel} = result;
		
		const [x_name,y_name,z_name=''] = featuresLabel;
		
		this.setState({
			result,
			ready:true,
			x_name,
			y_name,
			z_name,
			show_name:{
				x_name,
				y_name,
				z_name,
			},
		})
	}
	
	selection(order){
		const {result,show_name} = this.state;
		const {featuresLabel} = result;
		
		const disable = Object.values(show_name).filter(itm=>itm !== show_name[order]);
		
		const options = featuresLabel.map(itm=><Option key={itm} disabled={disable.includes(itm)} value={itm}>{itm}</Option>);
		options.unshift(<Option key='-000' disabled={disable.includes('')} value=''>none</Option>);
		return <Select value={show_name[order]} style={{ width: 120 }} onChange={name=>{
			this.setState({
				show_name:{
					...show_name,
					[order]:name,
				},
			})
		}}>
			{
				options
			}
		</Select>
	}
	
	chart(){
		const {x_name,y_name,z_name,result} = this.state;
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
				x_name={x_name}
				y_name={y_name}
				z_name={z_name}
				data={data}
			/>
		}
		
		return <TSEN
			x_name={names[0]}
			y_name={names[1]}
			data={data}/>
	}
	
	save(){
		const {show_name} = this.state;
		const {x_name,y_name,z_name} = show_name;
		this.setState({
			x_name,
			y_name,
			z_name,
		})
	}
	
	render() {
		const {ready} = this.state;
		if (!ready) {
			return <div/>
		}
		
		return <section className={styles.d3d2}>
			<dl>
				<dt>{EN.Choose2or3Variables}</dt>
				<dd>Var1:{this.selection('x_name')}</dd>
				<dd>Var2:{this.selection('y_name')}</dd>
				<dd>Var3:{this.selection('z_name')}</dd>
				<dd>
					<button className={styles.button} onClick={this.save.bind(this)}>
						<span>{EN.Save}</span>
					</button>
				</dd>
			</dl>
			{this.chart()}
		</section>
	}
}
