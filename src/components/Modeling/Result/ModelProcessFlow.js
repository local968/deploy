import React, { Component,Fragment} from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react'
import Next from './Next.svg'
import {Popover,Button,Icon,Tag} from 'antd'

@observer
export default class ModelProcessFlow extends Component {

    constructor(props){
        super(props);
    }

    list(data,type,name,show=false){
        const _data = Object.entries(data).filter(itm=>itm[0].startsWith(type));
        if(_data.length||show){
            return <Fragment>
                <dt>{name}</dt>
                {
                    _data.map((itm,index)=>{
                        return <dd key={index}>{itm[0].substring(type.length)}:{itm[1]}</dd>
                    })
                }
            </Fragment>
        }
    }

    DP(data){
        return <dl>
            {this.list(data,'categorical_encoding:one_hot_encoding:','One hot encoding')}
            {this.list(data,'rescaling:','Rescaling')}
            {this.list(data,'imputation:','Imputation')}
            {this.list(data,'balancing:','Banlance')}
        </dl>
    }

    FP(data){
        const name = data['preprocessor:__choice__'];
        return <dl>
            {this.list(data,`preprocessor:${name}:`,name,true)}
        </dl>
    }

    Third(data){
        const name = data['classifier:__choice__'];
        return <dl>
            {this.list(data,`classifier:${name}:`,'')}
        </dl>;
    }

    render() {
            const {dataFlow} = this.props.model;
            if(dataFlow.length === 1) {
                return <section className={styles.process}>
                    <label>Raw Data</label>
                    <img src={Next} alt=''/>
                    <Popover placement="bottom" content={this.DP(dataFlow[0])} trigger="click">
                        <Button>Data Preprocessing<Icon type="down" /></Button>
                    </Popover>
                    <img src={Next} alt=''/>
                    <Popover placement="bottom" content={this.FP(dataFlow[0])} trigger="click">
                        <Button>Feature Preprocessing<Icon type="down" /></Button>
                    </Popover>
                    <img src={Next} alt=''/>
                    <Popover placement="bottom" content={this.Third(dataFlow[0])} trigger="click">
                        <Button>{dataFlow[0].model_name}<Icon type="down" /></Button>
                    </Popover>
                    <img src={Next} alt=''/>
                    <label>Prediction</label>
                </section>
            }else{
                return <section className={`${styles.process} ${styles.many}`}>
                    <label>Raw Data</label>
                    <img src={Next} alt=''/>
                    <dl>
                        {
                            dataFlow.filter(itm=>itm.weight).map((itm,index)=>{
                                return <dd key={index}>
                                    <Popover placement="bottom" content={this.DP(itm)} trigger="click">
                                        <Button>Data Preprocessing<Icon type="down" /></Button>
                                    </Popover>
                                    <img src={Next} alt=''/>
                                    <Popover placement="bottom" content={this.FP(itm)} trigger="click">
                                        <Button>Feature Preprocessing<Icon type="down" /></Button>
                                    </Popover>
                                    <img src={Next} alt=''/>
                                    <Popover placement="bottom" content={this.Third(itm)} trigger="click">
                                        <Button>{itm.model_name}<Icon type="down" /></Button>
                                    </Popover>
                                    <Tag>{itm.weight}</Tag>
                                </dd>
                            })
                        }
                    </dl>
                    <img src={Next} alt=''/>
                    <label>Ensembled Model</label>
                    <img src={Next} alt=''/>
                    <label>Prediction</label>
                </section>
            }

        }
}
