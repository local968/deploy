import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';
import Project from 'components/Project';
import Problem from 'components/Problem';
import Data from 'components/Data';
import Modeling from 'components/Modeling';
import { ProjectLoading, Confirm } from 'components/Common';
import { message } from 'antd';
import styles from './styles.module.css';

@inject('userStore', 'projectStore', 'routing')
@observer
export default class Main extends Component {
  constructor(props) {
    super(props);
    const { pid } = props.match.params || {};
    this.pid = pid

    when(
      () => props.userStore.status === "login",
      () => props.projectStore.initProject(this.pid).then(init => {
        if (!init) {
          message.error("Sorry but you don't have the authority for entering this project.")
          this.props.routing.push("/")
        }
      })
    )
  }

  componentWillMount() {
    when(
      () => this.props.projectStore.project,
      () => this.props.projectStore.inProject(this.pid)
    )
  }

  getChild = () => {
    const { project } = this.props.projectStore;
    const { curStep } = project || {};

    when(
      () => project && !project.exist,
      () => {
        message.warn("project not exist")
        this.props.routing.push("/")
      }
    )

    switch (curStep) {
      case 1:
        return <Problem project={project} />
      case 2:
        return <Data project={project} />
      case 3:
        return <Modeling project={project} />
      case 0:
      default:
        return <Project project={project} />
    }
  }

  exit = () => {
    this.props.routing.push("/")
    this.props.projectStore.outProject()
  }

  render() {
    const { project, conflict, notExit } = this.props.projectStore
    return <React.Fragment>
      <div className={styles.header}>
        {project && project.name && <div className={styles.projectName}>
          <span className={styles.label}>Project: </span>
          <span className={styles.value}> {project.name}</span>
        </div>}
        {project && project.fileName && <div className={styles.dataset}>
          <span className={styles.label}>Dataset: </span>
          <span className={styles.value}> {project.fileName}</span>
        </div>}
      </div>
      {!project ? <ProjectLoading /> : this.getChild()}
      {<Confirm
        width="6em"
        title={`You have been kicked out`}
        visible={conflict}
        onClose={this.exit}
        onConfirm={notExit}
        closeByMask={false}
        showClose={false}
        confirmText="Go Back to the Project"
        closeText="Go to Home Page"
        content={"You have been kicked out of the project by another user."} />}
    </React.Fragment>
  }
}
