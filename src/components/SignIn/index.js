import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from "./styles.module.css";
import warnIcon from "./fail.svg";
import config from '../../config.js';

@inject('userStore')
@observer
export default class SignIn extends Component{
    state = {
        email: window.localStorage.getItem('deploy2-email') || '',
        password: '',
        warning: {
            email: '',
            password: ''
        }
    }

    onChangeEmail = (e) => {
        this.setState({
            email: e.target.value.toLowerCase()
        })
    }

    onChangePassword = (e) => {
        this.setState({
            password: e.target.value
        })
    }

    login = () => {
        const {email, password, warning} = this.state;
        if(!email){
            warning.email = "Enter your email";
        }else if(!new RegExp(/^[a-zA-Z0-9_-]+(\.([a-zA-Z0-9_-])+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).test(email)){
            warning.email = "Enter a vaild emial address";
        }else{
            warning.email = '';
        }

        if(!password){
            warning.password = "Enter your password";
        }else {
            warning.password = '';
        }

        if(warning.email || warning.password){
            return this.setState({
                warning: warning
            })
        }

        this.props.userStore.login({email, password})
    }

    register = () => {
        this.props.history.push("/signup")
    }

    render() {
        return <div className={styles.signin}>
            <div className={styles.title}><span>Sign In</span></div>
            <div className={styles.row}>
                <div className={styles.warning}>{this.state.warning.email && <span><img src={warnIcon} alt='warning' />{this.state.warning.email}</span>}</div>
                <input type="text" placeholder="Email Address" value={this.state.email} onChange={this.onChangeEmail}/>
            </div>
            <div className={styles.row}>
                <div className={styles.warning}>{this.state.warning.password && <span><img src={warnIcon} alt='warning' />{this.state.warning.password}</span>}</div>
                <input type="password" placeholder="Set a Password" value={this.state.password} onChange={this.onChangePassword}/>
            </div>
            <div className={styles.buttonRow}>
                <button className={styles.button} onClick={this.login}>
                    <span>Sign In</span>
                </button>
                {config.openResiger&&<div className={styles.signup} onClick={this.register}><span>Sign Up</span></div>}
            </div>
        </div>
    }
}