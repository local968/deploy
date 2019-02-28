import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import ContinueButton from 'components/Common/ContinueButton';
import { Input } from 'antd';
import { action } from 'mobx';
const { TextArea } = Input;

@inject('projectStore', 'deploymentStore')
@observer
export default class Project extends Component {
  nextStep = () => {
    const { project } = this.props.projectStore;
    project.updateProject({ ...project.nextMainStep(1), name: project.name || "Project " + new Date().toLocaleString() })
  }

  onChange = action((type, e) => {
    const { projectStore, deploymentStore } = this.props
    const { project } = projectStore;
    project[type] = e.target.value;
    project.updateProject({
      name: project.name || "Project " + new Date().toLocaleString(),
      // description: project.description,
      business: project.business,
      statement: project.statement
    })
    if (type === 'name') {
      const deployment = deploymentStore.deployments.find(d => project.id === d.projectId)
      if (deployment) deploymentStore.change(deployment.id, 'projectName', e.target.value)
    }
  })

  render() {
    const { project } = this.props.projectStore;
    return <div className={styles.project}>
      <div className={styles.row}>
        <label>Project Name</label>
        <Input placeholder={"project name"} defaultValue={project ? project.name : ""} onChange={this.onChange.bind(this, "name")} />
      </div>
      {/* <div className={styles.row}>
        <label >Project Description</label>
        <TextArea rows={4} placeholder="project description" defaultValue={project ? project.description : ""} onChange={this.onChange.bind(this, "description")} className={styles.textarea}/>
      </div> */}
      <div className={styles.sep}> </div>
      <div className={styles.textBox}>
        <label>Problem Statement</label>
        <TextArea
          defaultValue={project ? project.statement : ''}
          className={styles.textarea}
          onChange={this.onChange.bind(this, "statement")}
          rows={4}
          placeholder='<Problem statement>  e.g. Predict important customers who might churn in the next 30 days so that customer service department can take effectively target and retain these customers.' />
      </div>
      <div className={styles.textBox}>
        <label>Business Value</label>
        <TextArea
          defaultValue={project ? project.business : ""}
          className={styles.textarea}
          onChange={this.onChange.bind(this, "business")}
          rows={4}
          placeholder='<Business value> e.g. This will help proactively retain important customers. Acquiring a new customer is not costlier than retain an existing customer. It is critial to maintain customer satisfaction and loyalty to sustain good revenue opportunity and a strong market presence.' />
      </div>
      <ContinueButton onClick={this.nextStep} disabled={false} text="Continue" />
    </div>
  }
}
