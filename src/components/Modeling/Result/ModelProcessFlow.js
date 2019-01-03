import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react'
import Next from './Next.svg'
import {Popover,Button,Icon,Tag} from 'antd'

@observer
export default class ModelProcessFlow extends Component {

    constructor(props){
        super(props);
        console.log(props.model.dataFlow)
    }

    DP(data){
        const minimum_fraction = data['categorical_encoding:one_hot_encoding:minimum_fraction'];
        const use_minimum_fraction = data['categorical_encoding:one_hot_encoding:use_minimum_fraction'];

        return <dl>
            <dt>One hot encoding</dt>
            <dd style={{display:(minimum_fraction?'':'none')}}>minimum_fraction: {minimum_fraction}</dd>
            <dd style={{display:(use_minimum_fraction?'':'none')}}>use_minimum_fraction: {use_minimum_fraction}</dd>
            <dt>Rescaling</dt>
            <dd>: standardize</dd>
        </dl>
    }

    FP(data){
        const degree = data['preprocessor:polynomial:degree'];
        const include_bias = data['preprocessor:polynomial:include_bias'];

        return <dl>
            <dt>Polynomial</dt>
            <dd style={{display:(degree?'':'none')}}>degree: {degree}</dd>
            <dd style={{display:(include_bias?'':'none')}}>include_bias: {include_bias}</dd>
        </dl>
    }

    Third(data){
        const bootstrap = data['preprocessor:extra_trees_preproc_for_classification:bootstrap'];
        const riterion = data['classifier:random_forest:criterion'];
        const max_depth = data['classifier:adaboost:max_depth'];
        const max_features = data['classifier:random_forest:max_features'];
        const min_samples_leaf = data['classifier:gradient_boosting:min_samples_leaf'];
        const min_samples_split = data['classifier:gradient_boosting:min_samples_split'];
        const min_weight_fraction_leaf = data['classifier:gradient_boosting:min_weight_fraction_leaf'];

        return <dl>
            <dd style={{display:(bootstrap?'':'none')}}>bootstrap: {bootstrap}</dd>
            <dd style={{display:(riterion?'':'none')}}>riterion: {riterion}</dd>
            <dd style={{display:(max_depth?'':'none')}}>max_depth: {max_depth}</dd>
            <dd style={{display:(max_features?'':'none')}}>max_features: {max_features}</dd>
            <dd style={{display:(min_samples_leaf?'':'none')}}>min_samples_leaf: {min_samples_leaf}</dd>
            <dd style={{display:(min_samples_split?'':'none')}}>min_samples_split: {min_samples_split}</dd>
            <dd style={{display:(min_weight_fraction_leaf?'':'none')}}>min_weight_fraction_leaf: {min_weight_fraction_leaf}</dd>
        </dl>
    }

    render() {
            const {dataFlow} = this.props.model;
            if(dataFlow.length === 1) {
                return <section className={styles.process}>
                    <label>Raw Data</label>
                    <img src={Next}/>
                    <Popover placement="bottom" content={this.DP(dataFlow[0])} trigger="click">
                        <Button>Data Preprocessing<Icon type="down" /></Button>
                    </Popover>
                    <img src={Next}/>
                    <Popover placement="bottom" content={this.FP(dataFlow[0])} trigger="click">
                        <Button>Feature Preprocessing<Icon type="down" /></Button>
                    </Popover>
                    <img src={Next}/>
                    <Popover placement="bottom" content={this.Third(dataFlow[0])} trigger="click">
                        <Button>{dataFlow[0].model_name}<Icon type="down" /></Button>
                    </Popover>
                    <img src={Next}/>
                    <label>Prediction</label>
                </section>
            }else{
                return <section className={styles.process}>
                    <label>Raw Data</label>
                    <img src={Next}/>
                    <dl>
                        {
                            dataFlow.map((itm,index)=>{
                                return <dd key={index}>
                                    <Popover placement="bottom" content={this.DP(itm)} trigger="click">
                                        <Button>Data Preprocessing<Icon type="down" /></Button>
                                    </Popover>
                                    <img src={Next}/>
                                    <Popover placement="bottom" content={this.FP(itm)} trigger="click">
                                        <Button>Feature Preprocessing<Icon type="down" /></Button>
                                    </Popover>
                                    <img src={Next}/>
                                    <Popover placement="bottom" content={this.Third(itm)} trigger="click">
                                        <Button>{itm.model_name}<Icon type="down" /></Button>
                                    </Popover>
                                    <Tag>{itm.weight}</Tag>
                                </dd>
                            })
                        }
                    </dl>
                    <img src={Next}/>
                    <label>Ensembled Model</label>
                    <img src={Next}/>
                    <label>Prediction</label>
                </section>
            }

        }
}
