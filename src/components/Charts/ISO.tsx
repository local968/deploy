import React, {PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';
import { debounce } from 'lodash'
import Slider from 'rc-slider'
import InputNum from 'rc-input-number'
import 'rc-input-number/assets/index.css'
import 'rc-slider/assets/index.css'
import './echarts.config'
import request from '../Request'
import styles from './charts.module.css';
import EN from "../../constant/en";
import {Select} from 'antd';
import {inject, observer} from "mobx-react";
const {Option} = Select;

const classes = styles;

const color:any = ['#b7cbf8','#ffffff','green','red'];//背景(开始)/背景(结束）/正常点/异常点

interface DataSampleProps {
    projectStore?:any
}

@inject('projectStore')
@observer
export default class Iso extends PureComponent<DataSampleProps>{
    private chart:any;
    constructor(props){
        super(props);
        this.state = {
            ready:false,
            slider_value:0,
            x_name:'',
            y_name:'',
            show_name:{
                var1:'',
                var2:'',
            },
            list:[],
            var1:'',
            var2:'',
            url:'',
            vars:[],
            modelName:'',
        };
        this.chart = React.createRef();
        this.updatePoint = debounce(this.updatePoint, 280)
    }

    componentDidMount() {
        const chart = this.chart.getEchartsInstance();
        chart.showLoading();

        return this.message();
    }

    async message() {
        const chart = this.chart.getEchartsInstance();
        chart.showLoading();
        const { selectModel:models} = this.props.projectStore.project;
        const {outlierPlotData:url,rate,initRate} = models;

        const point = (rate).toFixed(3);
        let var1,var2,vars=[];
        const {modelName,vars:_vars} = this.state as any;
        if(models.modelName === modelName){
            vars = _vars;
        }
        const {featureImportance} = models;
        if(vars.length){
            var1 = vars[0];
            var2 = vars[1];
        }else{
            const list = Object.entries(featureImportance).sort((b:any,a:any)=>a[1]-b[1]);
             var1 = list[0][0];
             var2 = list[1][0];
        }

        const result:any = await request.post({
            url: '/graphics/outlier',
            data: {
                url,
            },
        });

        const {feature1Range:xRange=[],feature2Range:yRange=[],background:value=[],dotScore:dot=[]} = result;
        this.setState({
            xRange,
            yRange,
            value,
            dot,
            point,
            default_point:initRate,
            slider_value:point,
            ready:true,
            show_name:{
                var1,
                var2,
            },
            list:Object.keys(featureImportance),
            var1,
            var2,
            url,
        },()=>chart.hideLoading())
    }

    getOption() {
        let {ready,xRange,yRange,value,dot,point,var1,var2,url} = this.state as any;

        const {mapHeader} = this.props.projectStore.project;

        if(!ready){
            return {
                xAxis: {},
                yAxis: {},
            }
        }
        const {projectStore} = this.props as any;

        if(url !== projectStore.project.selectModel.outlierPlotData){
            this.componentDidMount()
        }

        const x_space = (xRange[1] - xRange[0]) / value[0].length;
        const y_space = (yRange[1] - yRange[0]) / value.length;
        let x_itm = xRange[0];
        let y_itm = yRange[0];
        let x_range = [x_itm.toFixed(1)];
        let y_range = [y_itm.toFixed(1)];
        while(xRange[1]>x_itm){
            const x = (x_itm+=x_space).toFixed(1);
            x_range.push(x);
        }

        while(yRange[1]>y_itm){
            const y = (y_itm+=y_space).toFixed(1);
            y_range.push(y);
        }

        let data = [];

        value.map((itm,index)=>{
            itm.forEach((it,ind)=>{
                data.push([index,ind,(+it?it:0.01)]);
            })
        });

        data = data.map( (item)=> [item[1], item[0], item[2] || '-']);

        const heat_map = {
            type: 'heatmap',
            progressive:0,
            progressiveThreshold:10000,
            data,
            silent:true,
        };

        const series = [heat_map,heat_map];

        const xr = (xRange[1] - xRange[0])/value[0].length;
        const yr = (yRange[1] - yRange[0])/value.length;
        dot = dot.map((itm)=>[(itm[0] - xRange[0])/xr,(itm[1] - yRange[0])/yr,itm[2]]);


        let data1=[],data2=[];
        if(point){
            data1 = dot.filter(itm=>itm[2]>point).map(itm=>[itm[0],itm[1]]);//正常
            data2 = dot.filter(itm=>itm[2]<=point).map(itm=>[itm[0],itm[1]]);//异常
        }else{
            data1 = dot.map(itm=>[itm[0],itm[1]]);
        }

        data1.unshift([-100,-1,0]);
        data2.unshift([-100,-1,0]);

        series.push({
            type:'scatter',
            data:data1,
            // @ts-ignore
            color:color[2],
            visualMap:false,
            symbolSize:3,
            name:EN.normal,
            animation:true,
            silent:true,
            zlevel:3,
        },{
            type:'scatter',
            data:data2,
            color:color[3],
            visualMap:false,
            symbolSize:3,
            name:EN.abnormal,
            animation:true,
            silent:true,
            zlevel:2,
        });

        const nameTextStyle = {
	        color:'#000',
        };

        return {
                tooltip: {
                    position: 'top',
                },
                legend: {
                    top: 5,
                    right:0,
                    data: [EN.normal,EN.abnormal],
                    align: 'left',
                    orient:'vertical',
                },
                animation: true,
                grid: {
                    // height: '100%',
                    y: '10%',
                },
                xAxis: {
                    type: 'category',
                    data: x_range,
                    axisLabel:{
                        interval:value[0].length/5,
                    },
                    boundaryGap:false,
                    alignWithLabel:true,
                    offset:1,
                    name:mapHeader[var1],
                    nameLocation:'middle',
                    nameGap:25,
	                  nameTextStyle,
                },
                yAxis: {
                    type: 'category',
                    data: y_range,
                    axisLabel:{
                        interval:value.length/5,
                    },
                    boundaryGap:false,
                    offset:3,
                    name:mapHeader[var2],
                    nameLocation:'middle',
                    nameGap:25,
	                  nameTextStyle,
                },
                visualMap: {
                    min:0,
                    max:1,
                    calculable: true,
                    inRange: {color: [ color[0],color[1]]},
                    orient:'horizontal',
                    show:false,
                },
                dataZoom:[{
                    type: 'inside',
                }],
                series,
        };
    }

    updatePoint(point){
        this.setState({
            point,
        });
        const {projectStore} = this.props as any;
        return projectStore.project.selectModel.updateModel({rate: point})
    }

    selection(order){
        const {show_name,list} = this.state as any;
        const {projectStore} = this.props as any;
	      const {mapHeader} = projectStore.project;

	      const disable = Object.values(show_name).filter(itm=>itm !== show_name[order]);


        const options = list.map(itm=><Option key={itm} title={mapHeader[itm]} disabled={disable.includes(itm)} value={itm}>
            {mapHeader[itm]}
        </Option>);

        const id = Math.random().toString(16).substring(2,5);

        return <Select
            id={id}
            value={show_name[order]}
            style={{ width: 120 }}
            getPopupContainer={() =>
              document.getElementById(id)
            }
            onChange={name=>{
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

    save(){
        const {show_name} = this.state as any;
        const {var1,var2} = show_name;
        const {projectStore} = this.props as any;
        const { modelName} = projectStore.project.selectModel;

        this.setState({
            modelName,
            vars:[var1,var2],
        },()=>{
            const chart = this.chart.getEchartsInstance();
            chart.showLoading();
        });
        return projectStore.project.selectModel.saveFeatureList([var1,var2]);
    }

    reset(){
        const {default_point=0} = this.state as any;
        this.setState({
            slider_value:default_point,
        });
        return this.updatePoint(default_point)
    }

    render(){
        const {slider_value} = this.state as any;
        const {
            height = 500,
            width = 600,
        } = this.props as any;

        return [
            <section key='dl' className={classes.d3d2}>
                <dl>
                <dt>{EN.Choose2Variables}</dt>
                <dd>Var1:{this.selection('var1')}</dd>
                <dd>Var2:{this.selection('var2')}</dd>
                <dd>
                    <button className={styles.button} onClick={this.save.bind(this)}>
                        <span>{EN.Save}</span>
                    </button>
                </dd>
            </dl>
            <ReactEcharts
              key="echarts"
              ref = {chart=>this.chart=chart}
              option={this.getOption()}
              style={{height, width}}
              notMerge={true}
              lazyUpdate={true}
              theme='customed'
            />
        </section>,
            <div key="'slider" className={classes.slider}>
                <Slider
                    min={0}
                    max={0.5}
                    marks={{
                        '0':'0',
                        '0.05':'',
                        '0.1':'0.1',
                        '0.15':'',
                        '0.2':'0.2',
                        '0.25':'',
                        '0.3':'0.3',
                        '0.35':'',
                        '0.4':'0.4',
                        '0.45':'',
                        '0.5':'0.5',
                    }}
                    included={false}
                    step={0.001}
                    onChange={(slider_value)=>{
                        this.setState({
                            slider_value,
                        });
                        return this.updatePoint(slider_value)
                    }}
                    value={+slider_value} />
                    <a href="javascript:" onClick={this.reset.bind(this)}>{EN.Reset}</a>
            </div>,
            <div key = 'adjust' className={classes.adjust}>
                <label data-tip={EN.Thisratiowilldetermine}>{EN.Youcanadjustthecontaminationrate}:</label>
               <InputNum
              min={0}
              max={0.5}
              step={0.001}
              precision={3}
              value={slider_value}
              style={{ width: 100 }}
              onChange={(slider_value)=>{
                  this.setState({
                      slider_value,
                  });
                  return this.updatePoint(slider_value)
              }}
            />
            </div>,
        ]
    }
}
