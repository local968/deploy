import React, {PureComponent} from 'react'
import TSEN from './T-SEN'
import request from '../Request'
import { Select } from 'antd';
const {Option} = Select;
import useStyles from './charts.css';
import THREE from './3Variable'
import EN from "../../constant/en";
// import styles from '@src/views/modeling.pre.result/modeling.pre.result.css';

const classes = useStyles;

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
	
	async componentDidMount() {
		const { url } = this.props;
		const result = await request.post({
			url: '/graphics/residual-plot-diagnosis',
			data: {
				url,
			},
		});
		const {featuresLabel} = result;
		
		const [x_name,y_name] = featuresLabel;
		
		this.setState({
			result,
			ready:true,
			x_name,
			y_name,
			show_name:{
				x_name,
				y_name,
				z_name:'',
			},
		})
	}
	
	selection(order){
		const {result,show_name} = this.state;
		const {featuresLabel} = result;
		
		const disable = Object.values(show_name).filter(itm=>itm !== show_name[order]);
		
		const options = featuresLabel.map(itm=><Option key={itm} disabled={disable.includes(itm)} value={itm}>{itm}</Option>);
		if(order === 'z_name'){
			options.unshift(<Option key='-000' value=''>null</Option>);
		}
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
			const val = itm.filter((it, index) => {
				return dot.includes(index)
			});
			data.filter(itm => itm.name === labels[index])[0].value.push(val);
		});
		if (z_name) {
			return <THREE
				x_name={x_name}
				y_name={y_name}
				z_name={z_name}
				data={data}
			/>
		}
		
		return <TSEN
			x_name={x_name}
			y_name={y_name}
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
		
		return <section className={classes.d3d2}>
			<dl>
				<dt>Choose 2 or 3 Variables</dt>
				<dd>Var1:{this.selection('x_name')}</dd>
				<dd>Var2:{this.selection('y_name')}</dd>
				<dd>Var3:{this.selection('z_name')}</dd>
				<dd>
					<button className={'styles.button'} onClick={this.save.bind(this)}>
						<span>{EN.Save}</span>
					</button>
				</dd>
			</dl>
			{this.chart()}
		</section>
	}
}
