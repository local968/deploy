import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";

@inject('userStore', 'routing')
@observer
export default class SignActive extends Component{
    componentDidMount() {
        const {search} = this.props.location
        const code = search.substr(1);
        if(!code) return this.props.routing.push("/")
        this.props.userStore.completeReg(code)
    }

    render() {
        const {reg, regErr} = this.props.userStore
        return <div className={styles.signActive}>
            <span>{reg?(regErr?'激活失败,请重新注册':'激活成功, 2秒后跳转'):'正在激活'}</span>
        </div>
    }
}