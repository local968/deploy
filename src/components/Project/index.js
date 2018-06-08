import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import Hint from '../Common/Hint';
import { Input } from 'antd';
const { TextArea } = Input;


@inject('projectStore')
@observer
export default class Project extends Component {
    constructor(props) {
        super(props);
        const {pid} = props.match.params || {};
        this.pid = pid?parseInt(pid):0;
        
        //实际只修改approach
        //project下对应多个approach，目前暂时只有一个
        props.projectStore.init(this.pid);
    }

    // componentDidUpdate() {
    //     if(this.props.projectStore.project){
    //         this.setState({
    //             name: this.props.projectStore.project.name,
    //             description: this.props.projectStore.project.description
    //         })
    //     }
    // }

    onChange = (k, e) => {
        const {project} = this.props.projectStore;
        project[k] = e.target.value;
    }

    nextStep = () => {
        const {project} = this.props.projectStore;
        project.updateProject({
            name: project.name,
            description: project.description
        })
        this.props.history.push(`/problem/${this.pid}`);
    }

    render() {
        const {project} = this.props.projectStore;
        return <div className={styles.project}>
            <div className={styles.title}>
                <span>Please name your project and give it a description</span>
            </div>
            <div className={styles.row}>
                <label>Project Name</label>
                <Input placeholder={"project name"} value={project?project.name:""} onChange={this.onChange.bind(this,"name")} />
            </div>
            <div className={styles.row}>
                <label >Project Description</label>
                <TextArea rows={8} placeholder="project description" value={project?project.description:""} onChange={this.onChange.bind(this,"description")} />
            </div>
            <div className={styles.btn}>
                <button onClick={this.nextStep} className={styles.continue}>Continue</button>
            </div>
        </div>
    }
}