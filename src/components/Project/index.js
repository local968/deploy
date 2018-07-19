import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import ContinueButton from '../Common/ContinueButton';
import { Input } from 'antd';
const { TextArea } = Input;

@observer
export default class Project extends Component {
    onChange = (k, e) => {
        const {project} = this.props;
        project[k] = e.target.value;
    }

    nextStep = () => {
        const {project} = this.props;
        project.updateProject({
            name: project.name,
            description: project.description
        })
        project.nextMainStep(1);
        // this.props.history.push(`/problem/${this.pid}`);
    }

    render() {
        const {project} = this.props;
        return <div className={styles.project}>
            <div className={styles.title}>
                <span>Please name your project and give it a description</span>
            </div>
            <div className={styles.row}>
                <label>Project Name</label>
                <Input placeholder={"project name"} defaultValue={project?project.name:""} onChange={this.onChange.bind(this,"name")} />
            </div>
            <div className={styles.row}>
                <label >Project Description</label>
                <TextArea rows={8} placeholder="project description" defaultValue={project?project.description:""} onChange={this.onChange.bind(this,"description")} />
            </div>
            <ContinueButton onClick={this.nextStep} disabled={false} text="Continue" />
        </div>
    }
}