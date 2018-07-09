import React, { Component } from 'react';
import styles from './styles.module.css';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';
import { Input } from 'antd';
const { TextArea } = Input;
const step = ["project", "problem", 'data', 'modeling']


@inject('userStore', 'projectStore')
@observer
export default class Project extends Component {
    constructor(props) {
        super(props);
        const {pid} = props.match.params || {};
        this.pid = pid ? parseInt(pid, 10) : 0;
        
        when(
            () => props.userStore.userId && !props.userStore.isLoad,
            () => props.projectStore.init(props.userStore.userId, this.pid)
        )
        when(
            () => props.projectStore.project,
            () => {
                const {curStep, isFirst, mainStep} = props.projectStore.project;
                const currStep = isFirst?mainStep:curStep;
                if(currStep == 0){
                    return;
                }
                props.history.push("/"+step[currStep]+"/"+this.pid)
            }
        )
    }

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
        project.nextMainStep(1);
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