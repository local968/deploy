import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import ContinueButton from 'components/Common/ContinueButton';
import { Input } from 'antd';
import { action, observable } from 'mobx';
import EN from '../../constant/en';

const { TextArea } = Input;

@inject('projectStore', 'deploymentStore')
@observer
export default class Project extends Component {
  @observable name = (this.props.projectStore.project || {}).name || ''

  componentWillUnmount() {
    const { deploymentStore, projectStore } = this.props
    const { project } = projectStore;
    const name = this.name || EN.Project + new Date().toLocaleString('chinese', { hour12: false })
    project.updateProject({
      name: name,
      // description: project.description,
      business: project.business,
      statement: project.statement
    })
    const deployment = deploymentStore.deployments.find(d => project.id === d.projectId)
    if (deployment) deploymentStore.change(deployment.id, 'projectName', name)
  }

  nextStep = () => {
    const { project } = this.props.projectStore;
    project.updateProject(project.nextMainStep(1))
  }

  onChange = action((type, e) => {
    const { project } = this.props.projectStore;
    project[type] = e.target.value
  })

  onChangeName = e => {
    this.name = e.target.value
  }

  render() {
    const { project } = this.props.projectStore;
    return (
      <div className={styles.project}>
        <div className={styles.row}>
          <label>{EN.ProjectName}</label>
          <Input placeholder={EN.ProjectN} value={this.name}
            onChange={this.onChangeName} />
        </div>
        {/* <AA onChange={this.onChange}/> */}
        {/* <div className={styles.row}>
        <label >Project Description</label>
        <TextArea rows={4} placeholder="project description" defaultValue={project ? project.description : ""} onChange={this.onChange.bind(this, "description")} className={styles.textarea}/>
      </div> */}
        <div className={styles.sep}></div>
        <div className={styles.textBox}>
          <label>{EN.ProblemStatement}</label>
          <TextArea
            defaultValue={project ? project.statement : ''}
            className={styles.textarea}
            onChange={this.onChange.bind(this, "statement")}
            rows={4}
            placeholder={` ${EN.Problemstatement}${EN.Predictimportantcustomers} `} />
        </div>
        <div className={styles.textBox}>
          <label>{EN.BusinessValue}</label>
          <TextArea
            defaultValue={project ? project.business : ""}
            className={styles.textarea}
            onChange={this.onChange.bind(this, "business")}
            rows={4}
            placeholder={`${EN.Businessvalue}${EN.Thiswillhelpproactively}`} />
        </div>
        <ContinueButton onClick={this.nextStep} disabled={false} text={EN.Continue} />
      </div>
    )
  }
}

// @inject('projectStore')
// @observer
// class AA extends React.Component {

//   bindInput = (ref) => this.input = ref

//   componentDidMount() {
//     this.input && this.input.focus()
//   }

//   render() {
//     const { project } = this.props.projectStore;
//     const { onChange } = this.props
//     return (
//       <div className={styles.row}>
//         <label>{EN.ProjectName}</label>
//         <Input ref={this.bindInput} placeholder={EN.ProjectN} defaultValue={project ? project.name : ""}
//           onChange={onChange.bind(this, "name")} />
//       </div>
//     );
//   }
// }
