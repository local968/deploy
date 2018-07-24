import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";

@inject('userStore')
@observer
export default class SignActive extends Component{
    state = {
        msg: '正在激活'
    }

    componentDidMount() {
        const {search} = this.props.location
        const params = search.substr(1).split("&");
        this.props.userStore.completeReg(params)
    }

    render() {
        return <div>
            {this.state.msg}
        </div>
    }
}