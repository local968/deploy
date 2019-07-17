import React, {PureComponent} from 'react'
import TSEN from './T-SEN'
import request from '../Request'
import styles from './charts.module.css';
import THREE from './3Variable';
import EN from "../../constant/en";
import { inject, observer } from 'mobx-react';
import D3D2List from './D3D2List'

interface DataSampleProps {
	url:string
	projectStore?:any
}

@inject('projectStore')
@observer
export default class D3D2 extends PureComponent<DataSampleProps>{
	state:any;
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			show:false,
			x_name:'',
			y_name:'',
			z_name:'',
			result:null,
			changing:false,
		};
	}

	componentWillReceiveProps(nextProps) {
		const {url} = this.props;
		if(nextProps.url !== url){
			this.setState({
				show:false,
				changing:true,
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

		this.setState({
			result,
			ready:true,
			show:true,
			x_name,
			y_name,
			z_name,
			changing:false,
		});
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

	async save(show_name){
		// const {show_name} = this.state;
		// const {show_name} = this;
		const {x_name,y_name,z_name} = show_name;
		await this.setState({
			show:false,
		});
		this.setState({
			x_name,
			y_name,
			z_name,
			show:true,
		})
	}

	render() {
		const {ready,show,result,changing} = this.state;
		const {projectStore:{project:{mapHeader}}} = this.props;
		if (!ready) {
			return <div/>
		}

		return <section className={styles.d3d2}>
			<dl>
				{
					!changing&&<React.Fragment>
						<dt>{EN.Choose2or3Variables}</dt>
						<D3D2List
							featuresLabel = {result.featuresLabel}
							mapHeader = {mapHeader}
							update = {this.save.bind(this)}
						/>
					</React.Fragment>
				}
			</dl>
			{show&&this.chart()}
		</section>
	}
}
